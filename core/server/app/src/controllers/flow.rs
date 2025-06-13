/**
* Módulo Flow - Orquestador de Análisis de Redes Sociales
* 
* Este archivo implementa el flujo completo de análisis desde la generación
* de prompts con IA hasta el scraping de redes sociales, almacenamiento en
* DynamoDB y procesamiento con fórmulas analíticas especializadas.
* 
* Autor: Arturo Barrios Mendoza
* Contributor: Carlos Alberto Zamudio Velázquez y Lucio Arturo Reyes Castillo
*/


use crate::{
    database::{Database, DbResponder},
    middlewares,
    models::{Resource, User},
    scraping::{
        instagram::InstagramPost,
        notices::Params,
        trends::{Data, Trends, TrendsScraper},
    },
};
use actix_web::{
    HttpMessage, HttpRequest, HttpResponse, Responder, Result, error, middleware::from_fn, post,
    web,
};
use regex::Regex;
use rig::{completion::Prompt, providers};
use serde::Deserialize;
use tracing::{error, info};

use crate::nosql::controllers::analytics::{
    AnalyticsRequest, HashtagData, TrendsData, process_all_hashtags,
};
use crate::nosql::{ScrapedPost, save_scraped_data_to_dynamo};
use aws_sdk_dynamodb::types::AttributeValue;

#[derive(Deserialize)]
pub struct FlowRequest {
    resource_id: i32,
}

// Guarda todos los datos scraped de las tres plataformas en DynamoDB de forma paralela
async fn save_all_scraped_data(scraped_data: &Trends) -> Vec<String> {
    let mut saved_hashtags = Vec::new();

    for item in scraped_data.data.instagram.iter() {
        let scraped_posts: Vec<ScrapedPost> = item.posts
            .iter()
            .map(|post| ScrapedPost {
                comments: post.comments as i32,
                followers: Some(post.followers as i32),
                likes: post.likes as i32,
                link: post.link.clone(),
                time: post.time.clone(),
                members: None,
                subreddit: None,
                title: None,
                vote: None,
            })
            .collect();

        match save_scraped_data_to_dynamo(
            item.keyword.clone(),
            "instagram".to_string(),
            scraped_posts.clone(),
        )
        .await
        {
            Ok(saved) => {
                if saved {
                    saved_hashtags.push(format!("{}:instagram", item.keyword));
                }
            }
            Err(_) => {}
        }
    }

    for item in scraped_data.data.reddit.iter() {
        let scraped_posts: Vec<ScrapedPost> = item.posts
            .iter()
            .map(|post| ScrapedPost {
                comments: post.comments as i32,
                followers: None,
                likes: 0,
                link: post.title.clone(),
                time: post.title.clone(),
                members: Some(post.members as i32),
                subreddit: Some(post.subreddit.clone()),
                title: Some(post.title.clone()),
                vote: Some(post.vote as i32),
            })
            .collect();

        match save_scraped_data_to_dynamo(
            item.keyword.clone(),
            "reddit".to_string(),
            scraped_posts.clone(),
        )
        .await
        {
            Ok(saved) => {
                if saved {
                    saved_hashtags.push(format!("{}:reddit", item.keyword));
                }
            }
            Err(_) => {}
        }
    }

    for item in scraped_data.data.twitter.iter() {
        let scraped_posts: Vec<ScrapedPost> = item.posts
            .iter()
            .map(|post| ScrapedPost {
                comments: post.replies as i32,
                followers: Some(post.followers as i32),
                likes: post.likes as i32,
                link: post.link.clone(),
                time: post.time.clone(),
                members: None,
                subreddit: None,
                title: Some(post.text.clone()),
                vote: Some(post.retweets as i32),
            })
            .collect();

        match save_scraped_data_to_dynamo(
            item.keyword.clone(),
            "twitter".to_string(),
            scraped_posts.clone(),
        )
        .await
        {
            Ok(saved) => {
                if saved {
                    saved_hashtags.push(format!("{}:twitter", item.keyword));
                }
            }
            Err(_) => {}
        }
    }

    saved_hashtags
}

// Extrae todos los hashtags únicos de los datos scraped de las tres plataformas
fn extract_all_hashtags_from_scraped_data(scraped_data: &Trends) -> Vec<String> {
    let mut all_hashtags = Vec::new();
    
    for item in &scraped_data.data.instagram {
        if !all_hashtags.contains(&item.keyword) {
            all_hashtags.push(item.keyword.clone());
        }
    }

    for item in &scraped_data.data.reddit {
        if !all_hashtags.contains(&item.keyword) {
            all_hashtags.push(item.keyword.clone());
        }
    }
    
    for item in &scraped_data.data.twitter {
        if !all_hashtags.contains(&item.keyword) {
            all_hashtags.push(item.keyword.clone());
        }
    }

    all_hashtags
}

// Mejora los datos scraped con datos de fallback desde DynamoDB cuando están vacíos
async fn enhance_trends_with_fallback(mut trends: Trends, hashtags: &[String]) -> Trends {
    let config = aws_config::defaults(aws_config::BehaviorVersion::latest())
        .load()
        .await;
    let client = aws_sdk_dynamodb::Client::new(&config);
    let table_name = "trendhash_hashtag_cache";

    for item in trends.data.instagram.iter_mut() {
        let keyword_opt = item.keyword.clone();

        if item.posts.is_empty() && hashtags.contains(&keyword_opt) {
            if let Ok(fallback_data) =
                get_fallback_data(&client, table_name, &keyword_opt, "instagram").await
            {
                item.posts = fallback_data;
            }
        }
    }

    for item in trends.data.twitter.iter_mut() {
        let keyword_opt = item.keyword.clone();

        if item.posts.is_empty() && hashtags.contains(&keyword_opt) {
            if let Ok(fallback_data) =
                get_fallback_data(&client, table_name, &keyword_opt, "twitter").await
            {
                let twitter_posts: Vec<crate::scraping::twitter::TweetData> = fallback_data
                    .into_iter()
                    .map(|ig_post| crate::scraping::twitter::TweetData {
                        username: "fallback_user".to_string(),
                        handle: "@fallback".to_string(),
                        text: ig_post.link.clone(), 
                        link: ig_post.link,
                        time: ig_post.time,
                        likes: ig_post.likes,
                        retweets: 0,
                        replies: ig_post.comments,
                        followers: ig_post.followers,
                    })
                    .collect();
                
                item.posts = twitter_posts;
            }
        }
    }

    trends
}

// Busca datos de fallback en DynamoDB para hashtags sin datos scraped
async fn get_fallback_data(
    client: &aws_sdk_dynamodb::Client,
    table_name: &str,
    hashtag: &str,
    platform: &str,
) -> Result<Vec<InstagramPost>, Box<dyn std::error::Error>> {
    let pk = format!("HASHTAG#{}", hashtag);
    let sk = format!("DATA#{}", platform);

    let result = client
        .get_item()
        .table_name(table_name)
        .key("pk", AttributeValue::S(pk))
        .key("sk", AttributeValue::S(sk))
        .send()
        .await?;

    if let Some(item) = result.item {
        if let Some(AttributeValue::S(scraped_posts_json)) = item.get("scraped_posts") {
            if let Ok(scraped_data) =
                serde_json::from_str::<crate::nosql::ScrapedHashtagData>(scraped_posts_json)
            {
                let instagram_posts: Vec<InstagramPost> = scraped_data
                    .posts
                    .into_iter()
                    .map(|scraped_post| InstagramPost {
                        likes: scraped_post.likes as u32,
                        comments: scraped_post.comments as u32,
                        link: scraped_post.link,
                        time: scraped_post.time,
                        followers: scraped_post.followers.unwrap_or(0) as u32,
                    })
                    .collect();

                return Ok(instagram_posts);
            }
        }

        let sk_prefix = format!("SCRAPED#{}", platform);
        let query_result = client
            .query()
            .table_name(table_name)
            .key_condition_expression("pk = :pk AND begins_with(sk, :sk_prefix)")
            .expression_attribute_values(":pk", AttributeValue::S(format!("HASHTAG#{}", hashtag)))
            .expression_attribute_values(":sk_prefix", AttributeValue::S(sk_prefix))
            .scan_index_forward(false)
            .limit(1)
            .send()
            .await?;

        if let Some(items) = query_result.items {
            if let Some(latest_item) = items.first() {
                if let Some(AttributeValue::S(scraped_posts_json)) =
                    latest_item.get("scraped_posts")
                {
                    if let Ok(scraped_data) =
                        serde_json::from_str::<crate::nosql::ScrapedHashtagData>(scraped_posts_json)
                    {
                        let instagram_posts: Vec<InstagramPost> = scraped_data
                            .posts
                            .into_iter()
                            .map(|scraped_post| InstagramPost {
                                likes: scraped_post.likes as u32,
                                comments: scraped_post.comments as u32,
                                link: scraped_post.link,
                                time: scraped_post.time,
                                followers: scraped_post.followers.unwrap_or(0) as u32,
                            })
                            .collect();

                        return Ok(instagram_posts);
                    }
                }
            }
        }
    }

    Ok(vec![])
}

// Procesa los datos scraped con las fórmulas analíticas especializadas del backend
async fn process_trends_with_analytics(
    trends: &serde_json::Value,
    hashtags: &[String],
) -> serde_json::Value {
    let analytics_request = convert_trends_to_analytics_request(trends, hashtags);
    let calculated_metrics = process_all_hashtags(&analytics_request);

    serde_json::json!({
        "hashtags": calculated_metrics,
        "total_hashtags": hashtags.len(),
        "data_source": "backend_calculations",
        "formulas_used": [
            "insta_ratio()", "insta_viral_rate()",
            "reddit_hourly_ratio()", "reddit_viral_rate()",
            "x_interaction_rate()", "x_viral_rate()"
        ]
    })
}

// Convierte los datos scraped al formato requerido por el sistema de analytics
fn convert_trends_to_analytics_request(
    trends: &serde_json::Value,
    hashtags: &[String],
) -> AnalyticsRequest {
    let mut instagram_data = Vec::new();
    let mut reddit_data = Vec::new();
    let mut twitter_data = Vec::new();

    if let Some(instagram_array) = trends
        .get("data")
        .and_then(|d| d.get("instagram"))
        .and_then(|i| i.as_array())
    {
        for item in instagram_array {
            if let (Some(keyword), Some(posts)) = (
                item.get("keyword").and_then(|k| k.as_str()),
                item.get("posts").and_then(|p| p.as_array()),
            ) {
                instagram_data.push(HashtagData {
                    keyword: keyword.to_string(),
                    posts: posts.clone(),
                });
            }
        }
    }

    if let Some(reddit_array) = trends
        .get("data")
        .and_then(|d| d.get("reddit"))
        .and_then(|r| r.as_array())
    {
        for item in reddit_array {
            if let (Some(keyword), Some(posts)) = (
                item.get("keyword").and_then(|k| k.as_str()),
                item.get("posts").and_then(|p| p.as_array()),
            ) {
                reddit_data.push(HashtagData {
                    keyword: keyword.to_string(),
                    posts: posts.clone(),
                });
            }
        }
    }

    if let Some(twitter_array) = trends
        .get("data")
        .and_then(|d| d.get("twitter"))
        .and_then(|t| t.as_array())
    {
        for item in twitter_array {
            if let (Some(keyword), Some(posts)) = (
                item.get("keyword").and_then(|k| k.as_str()),
                item.get("posts").and_then(|p| p.as_array()),
            ) {
                twitter_data.push(HashtagData {
                    keyword: keyword.to_string(),
                    posts: posts.clone(),
                });
            }
        }
    }

    AnalyticsRequest {
        hashtags: hashtags.to_vec(),
        trends: TrendsData {
            instagram: instagram_data,
            reddit: reddit_data,
            twitter: twitter_data,
        },
        sales: vec![],
    }
}

// Endpoint principal: genera prompts con IA, realiza scraping y procesa con analytics
#[post("/generate-prompt")]
async fn generate_prompt_from_flow(
    req: HttpRequest,
    payload: web::Json<FlowRequest>,
) -> Result<impl Responder> {
    let user_id = req
        .extensions()
        .get::<i32>()
        .cloned()
        .ok_or_else(|| error::ErrorUnauthorized("Missing user id"))?;

    let user = User::get_by_id(user_id)
        .await
        .to_web()?
        .ok_or_else(|| error::ErrorNotFound("User not found"))?;

    let resource = Resource::get_by_id(payload.resource_id)
        .await
        .to_web()?
        .ok_or_else(|| error::ErrorNotFound("Resource not found"))?;

    let sales = Database::get_resource_sales(payload.resource_id)
        .await
        .to_web()?;

    let prompt = format!(
        "Me dedico a la industria de {}. Tengo una {} con alcance {} y {} sucursales. Desarrollo mis operaciones en {}. Ofrezco un {} llamado {}. Consiste en: {}, y se asocia con: {}. Por favor escribe una lista de 5 palabras (palabras individuales, no términos ni frases, separadas con comas) en inglés mi producto (procura no mencionar el nombre de mi producto) y mi empresa para realizar una búsqueda de noticias. Que ninguna palabra contenga guiones. También dame 3 hashtags en inglés que hayan sido populares, que pueda buscar en redes sociales y que se relacionen con mi empresa y con mi producto (procura que los hashtags no incluyan el nombre de mi producto). No incluyas más texto en tu respuesta. Al final de la lista y antes de los hashtags, escribe el símbolo @.",
        user.industry,
        user.company_size,
        user.scope,
        user.num_branches,
        user.locations,
        resource.r_type,
        resource.name,
        resource.description,
        resource.related_words,
    );

    let client = providers::groq::Client::from_env();
    let agent = client
        .agent("deepseek-r1-distill-llama-70b")
        .preamble("You are an expert researcher")
        .build();

    let response = agent.prompt(&prompt).await.map_err(|e| {
        error!("Error generating chat response: {}", e);
        error::ErrorInternalServerError("Error generating chat response")
    })?;

    let content = response.trim();
    let after_think = content.split("</think>").nth(1).unwrap_or(content).trim();
    let parts: Vec<&str> = after_think.split('@').collect();

    let raw_sentence = parts.get(0).map(|s| s.trim()).unwrap_or("");

    let words: Vec<&str> = raw_sentence
        .split(", ")
        .map(|w| w.trim())
        .filter(|w| !w.is_empty())
        .take(5)
        .collect();

    let sentence = format!(
            "({})",
            words.iter().map(|w| w.replace("-", "")).collect::<Vec<_>>().join(" OR ")
        );

    let hashtags_block = parts.get(1).map(|s| s.trim()).unwrap_or("");
    let re = Regex::new(r"#\w+").unwrap();

    let hashtags: Vec<String> = re
        .find_iter(hashtags_block)
        .map(|m| {
            m.as_str()
                .strip_prefix('#')
                .unwrap_or(m.as_str())
                .to_string()
        })
        .collect();

    let today = chrono::Utc::now().naive_utc().date();
    let six_months_ago = today
        .checked_sub_signed(chrono::Duration::days(180))
        .unwrap_or(today);

    let params = Params::new(
        sentence.clone(),
        six_months_ago,
        today,
        String::from("English"),
    );
    let trends = TrendsScraper::get_trends_with_hashtags(params, Some(hashtags))
        .await
        .to_web()?;

    let all_hashtags = extract_all_hashtags_from_scraped_data(&trends);
    let saved_hashtags = save_all_scraped_data(&trends).await;
    let hashtags_for_calculations = if all_hashtags.is_empty() {
        vec![]
    } else {
        all_hashtags.clone()
    };

    let enhanced_trends = enhance_trends_with_fallback(trends, &hashtags_for_calculations).await;
    let enhanced_trends_json = serde_json::to_value(&enhanced_trends).unwrap();
    let calculated_results =
        process_trends_with_analytics(&enhanced_trends_json, &hashtags_for_calculations).await;

    Ok(HttpResponse::Ok().json(serde_json::json!({
        "sentence": sentence,
        "resource_name": resource.name,
        "hashtags": hashtags_for_calculations,
        "trends": enhanced_trends,
        "calculated_results": calculated_results,
        "sales": sales,
        "processing": {
            "status": "CALCULATED",
            "message": "Datos procesados con fórmulas backend y guardados en DynamoDB",
            "backend_calculations": true,
            "scraped_data_saved": true,
            "total_saved": saved_hashtags.len(),
            "saved_hashtags": saved_hashtags
        }
    })))
}

// Endpoint de testing con datos hardcodeados para desarrollo y pruebas
#[post("/test-generate-prompt")]
async fn test_generate_prompt_from_flow(payload: web::Json<FlowRequest>) -> Result<impl Responder> {
    let user_industry = "Music & Instruments";
    let user_company_size = "Small Business";
    let user_scope = "Regional";
    let user_branches = "3";
    let user_locations = "Austin, Dallas, Houston";

    let resource_type = "Product";
    let resource_name = "Stratocaster Electric Guitar";
    let resource_description =
        "High-quality electric guitar with vintage sound and modern playability";
    let resource_related_words = "music, rock, blues, vintage, amplifier";

    let sales_data = serde_json::json!([]);

    let prompt = format!(
        "Me dedico a la industria de {}. Tengo una {} con alcance {} y {} sucursales. Desarrollo mis operaciones en {}. Ofrezco un {} llamado {}. Consiste en: {}, y se asocia con: {}. Por favor escribe una lista de 5 palabras (palabras individuales, no términos ni frases, separadas con comas) en inglés mi producto (procura no mencionar el nombre de mi producto) y mi empresa para realizar una búsqueda de noticias. Que ninguna palabra contenga guiones. También dame 3 hashtags en inglés que hayan sido populares, que pueda buscar en redes sociales y que se relacionen con mi empresa y con mi producto (procura que los hashtags no incluyan el nombre de mi producto). No incluyas más texto en tu respuesta. Al final de la lista y antes de los hashtags, escribe el símbolo @.",
        user_industry,
        user_company_size,
        user_scope,
        user_branches,
        user_locations,
        resource_type,
        resource_name,
        resource_description,
        resource_related_words,
    );

    let client = providers::groq::Client::from_env();
    let agent = client
        .agent("deepseek-r1-distill-llama-70b")
        .preamble("You are an expert researcher")
        .build();

    let response = agent.prompt(&prompt).await.map_err(|e| {
        error!("Error generating chat response: {}", e);
        error::ErrorInternalServerError("Error generating chat response")
    })?;

    let content = response.trim();
    let after_think = content.split("</think>").nth(1).unwrap_or(content).trim();
    let parts: Vec<&str> = after_think.split('@').collect();

    let raw_sentence = parts.get(0).map(|s| s.trim()).unwrap_or("");

    let words: Vec<&str> = raw_sentence
        .split(", ")
        .map(|w| w.trim())
        .filter(|w| !w.is_empty())
        .take(5)
        .collect();

    let sentence = format!("({})", words.join(" OR "));

    let hashtags_block = parts.get(1).map(|s| s.trim()).unwrap_or("");
    let re = Regex::new(r"#\w+").unwrap();

    let hashtags: Vec<String> = re
        .find_iter(hashtags_block)
        .map(|m| {
            m.as_str()
                .strip_prefix('#')
                .unwrap_or(m.as_str())
                .to_string()
        })
        .collect();

    let trends = Trends {
        metadata: vec![],
        data: Data {
            instagram: vec![],
            reddit: vec![],
            twitter: vec![],
        },
    };

    let all_hashtags = extract_all_hashtags_from_scraped_data(&trends);
    let saved_hashtags = save_all_scraped_data(&trends).await;
    let hashtags_for_calculations = all_hashtags.clone();
    let enhanced_trends = enhance_trends_with_fallback(trends, &hashtags_for_calculations).await;
    let enhanced_trends_json = serde_json::to_value(&enhanced_trends).unwrap();
    let calculated_results =
        process_trends_with_analytics(&enhanced_trends_json, &hashtags_for_calculations).await;

    Ok(HttpResponse::Ok().json(serde_json::json!({
        "status": "TEST MODE",
        "message": "Endpoint de prueba - datos simulados con TODOS los hashtags",
        "sentence": sentence,
        "hashtags": hashtags_for_calculations,
        "trends": enhanced_trends,
        "calculated_results": calculated_results,
        "sales": sales_data,
        "debug": {
            "resource_id": payload.resource_id,
            "simulated": true,
            "fallback_applied": true,
            "backend_calculations": true,
            "all_hashtags_extracted": all_hashtags,
            "total_saved": saved_hashtags.len(),
            "saved_hashtags": saved_hashtags
        }
    })))
}

// Endpoint de debug para analizar la estructura de datos scraped recibidos
#[post("/debug/check-scraped-data")]
async fn debug_check_scraped_data(body: web::Json<serde_json::Value>) -> Result<impl Responder> {
    let scraped_data = body.into_inner();

    let mut debug_info = serde_json::json!({
        "status": "DEBUGGING",
        "found_hashtags": [],
        "instagram_analysis": {},
        "reddit_analysis": {},
        "twitter_analysis": {},
        "summary": {}
    });

    let mut all_found_hashtags = Vec::new();

    if let Some(instagram_array) = scraped_data
        .get("data")
        .and_then(|d| d.get("instagram"))
        .and_then(|i| i.as_array())
    {
        let mut instagram_hashtags = Vec::new();
        for (index, item) in instagram_array.iter().enumerate() {
            if let Some(keyword) = item.get("keyword").and_then(|k| k.as_str()) {
                let posts_count = item
                    .get("posts")
                    .and_then(|p| p.as_array())
                    .map(|arr| arr.len())
                    .unwrap_or(0);

                instagram_hashtags.push(serde_json::json!({
                    "index": index,
                    "keyword": keyword,
                    "posts_count": posts_count,
                    "has_posts": posts_count > 0,
                    "will_be_saved": posts_count > 0
                }));

                if !all_found_hashtags.contains(&keyword.to_string()) {
                    all_found_hashtags.push(keyword.to_string());
                }
            }
        }
        debug_info["instagram_analysis"] = serde_json::json!({
            "total_items": instagram_array.len(),
            "hashtags": instagram_hashtags
        });
    }

    if let Some(reddit_array) = scraped_data
        .get("data")
        .and_then(|d| d.get("reddit"))
        .and_then(|r| r.as_array())
    {
        let mut reddit_hashtags = Vec::new();
        for (index, item) in reddit_array.iter().enumerate() {
            if let Some(keyword) = item.get("keyword").and_then(|k| k.as_str()) {
                let posts_count = item
                    .get("posts")
                    .and_then(|p| p.as_array())
                    .map(|arr| arr.len())
                    .unwrap_or(0);

                reddit_hashtags.push(serde_json::json!({
                    "index": index,
                    "keyword": keyword,
                    "posts_count": posts_count,
                    "has_posts": posts_count > 0,
                    "will_be_saved": posts_count > 0
                }));

                if !all_found_hashtags.contains(&keyword.to_string()) {
                    all_found_hashtags.push(keyword.to_string());
                }
            }
        }
        debug_info["reddit_analysis"] = serde_json::json!({
            "total_items": reddit_array.len(),
            "hashtags": reddit_hashtags
        });
    }

    if let Some(twitter_array) = scraped_data
        .get("data")
        .and_then(|d| d.get("twitter"))
        .and_then(|t| t.as_array())
    {
        let mut twitter_hashtags = Vec::new();
        for (index, item) in twitter_array.iter().enumerate() {
            if let Some(keyword) = item.get("keyword").and_then(|k| k.as_str()) {
                let posts_count = item
                    .get("posts")
                    .and_then(|p| p.as_array())
                    .map(|arr| arr.len())
                    .unwrap_or(0);

                twitter_hashtags.push(serde_json::json!({
                    "index": index,
                    "keyword": keyword,
                    "posts_count": posts_count,
                    "has_posts": posts_count > 0,
                    "will_be_saved": posts_count > 0
                }));

                if !all_found_hashtags.contains(&keyword.to_string()) {
                    all_found_hashtags.push(keyword.to_string());
                }
            }
        }
        debug_info["twitter_analysis"] = serde_json::json!({
            "total_items": twitter_array.len(),
            "hashtags": twitter_hashtags
        });
    }

    debug_info["found_hashtags"] = serde_json::json!(all_found_hashtags);
    debug_info["summary"] = serde_json::json!({
        "total_unique_hashtags": all_found_hashtags.len(),
        "all_hashtags": all_found_hashtags,
        "analysis_timestamp": chrono::Utc::now().to_rfc3339(),
        "note": "Solo se guardan hashtags que tienen posts (posts_count > 0)"
    });

    Ok(HttpResponse::Ok().json(debug_info))
}

// Endpoint de debug para forzar el guardado de hashtags vacíos con fines de testing
#[post("/debug/force-save-empty-hashtags")]
async fn debug_force_save_empty_hashtags(
    body: web::Json<serde_json::Value>,
) -> Result<impl Responder> {
    let scraped_data = body.into_inner();

    let mut force_saved = Vec::new();

    let trends_from_json: Trends = serde_json::from_value(scraped_data.clone()).unwrap();
    let all_hashtags = extract_all_hashtags_from_scraped_data(&trends_from_json);

    for hashtag in &all_hashtags {
        match save_scraped_data_to_dynamo(
            hashtag.clone(),
            "instagram".to_string(),
            vec![],
        )
        .await
        {
            Ok(_) => {
                force_saved.push(format!("{}:instagram", hashtag));
            }
            Err(_) => {}
        }

        match save_scraped_data_to_dynamo(
            hashtag.clone(),
            "reddit".to_string(),
            vec![], 
        )
        .await
        {
            Ok(_) => {
                force_saved.push(format!("{}:reddit", hashtag));
            }
            Err(_) => {}
        }
    }

    Ok(HttpResponse::Ok().json(serde_json::json!({
        "status": "FORCE SAVE COMPLETED",
        "message": "Hashtags vacíos guardados forzadamente",
        "all_hashtags_found": all_hashtags,
        "force_saved": force_saved,
        "total_saved": force_saved.len(),
        "note": "Este endpoint fuerza el guardado incluso si los posts están vacíos"
    })))
}

// Configuración de rutas del módulo flow con endpoints seguros y de debug
pub fn routes() -> actix_web::Scope {
    web::scope("/flow")
        .service(test_generate_prompt_from_flow)
        .service(debug_check_scraped_data)
        .service(debug_force_save_empty_hashtags)
        .service(debug_check_scraped_data)
        .service(
            web::scope("/secure")
                .wrap(from_fn(middlewares::auth))
                .service(generate_prompt_from_flow),
        )
}