use actix_web::{
    web, HttpRequest, HttpResponse, Responder, Result, post, error, middleware::from_fn, HttpMessage,
};
use crate::{
    models::{User, Resource, Sale},
    middlewares,
    database::{Database, DbResponder},
    controllers::flow_config::FLOW_CONFIG,
};
use serde::Deserialize;
use tracing::{warn, info, error};
use regex::Regex;
use rig::{
    completion::Prompt,
    providers,
};

use aws_sdk_dynamodb::types::AttributeValue;
use crate::nosql::controllers::analytics::{AnalyticsRequest, TrendsData, HashtagData, process_all_hashtags};
use crate::nosql::{save_scraped_data_to_dynamo, ScrapedPost};

#[derive(Deserialize)]
pub struct FlowRequest {
    resource_id: i32,
}

// 🆕 FUNCIÓN PARA GUARDAR TODOS LOS DATOS SCRAPED
async fn save_all_scraped_data(scraped_data: &serde_json::Value) -> Vec<String> {
    let mut saved_hashtags = Vec::new();
    
    info!("🚀 Iniciando guardado de TODOS los datos scraped...");
    
    // 📸 PROCESAR INSTAGRAM
    if let Some(instagram_array) = scraped_data.get("data")
        .and_then(|d| d.get("instagram"))
        .and_then(|i| i.as_array()) {
        
        info!("📸 Procesando {} items de Instagram", instagram_array.len());
        
        for (index, item) in instagram_array.iter().enumerate() {
            if let Some(keyword) = item.get("keyword").and_then(|k| k.as_str()) {
                // 🔧 FIX: Manejar el Option correctamente para evitar lifetime issues
                let scraped_posts: Vec<ScrapedPost> = match item.get("posts").and_then(|p| p.as_array()) {
                    Some(posts_array) => {
                        info!("📸 Instagram[{}]: {} con {} posts", index, keyword, posts_array.len());
                        
                        posts_array.iter()
                            .filter_map(|post| {
                                Some(ScrapedPost {
                                    comments: post.get("comments")?.as_i64()? as i32,
                                    followers: post.get("followers").and_then(|f| f.as_i64()).map(|f| f as i32),
                                    likes: post.get("likes")?.as_i64()? as i32,
                                    link: post.get("link").and_then(|l| l.as_str()).unwrap_or("").to_string(),
                                    time: post.get("time")?.as_str()?.to_string(),
                                    members: None,
                                    subreddit: None,
                                    title: None,
                                    vote: None,
                                })
                            })
                            .collect()
                    },
                    None => {
                        info!("📸 Instagram[{}]: {} SIN posts (array vacío)", index, keyword);
                        vec![] // Vector vacío si no hay posts
                    }
                };
                
                // 🚀 INTENTAR GUARDAR (incluso si está vacío)
                match save_scraped_data_to_dynamo(
                    keyword.to_string(), 
                    "instagram".to_string(), 
                    scraped_posts.clone()
                ).await {
                    Ok(saved) => {
                        if saved {
                            saved_hashtags.push(format!("{}:instagram", keyword));
                            info!("✅ Instagram: {} guardado ({} posts)", keyword, scraped_posts.len());
                        } else {
                            warn!("⚠️ Instagram: {} NO guardado (posts vacíos)", keyword);
                        }
                    },
                    Err(e) => {
                        error!("❌ Instagram: Error guardando {}: {:?}", keyword, e);
                    }
                }
            }
        }
    }
    
    // 🔴 PROCESAR REDDIT
    if let Some(reddit_array) = scraped_data.get("data")
        .and_then(|d| d.get("reddit"))
        .and_then(|r| r.as_array()) {
        
        info!("🔴 Procesando {} items de Reddit", reddit_array.len());
        
        for (index, item) in reddit_array.iter().enumerate() {
            if let Some(keyword) = item.get("keyword").and_then(|k| k.as_str()) {
                // 🔧 FIX: Manejar el Option correctamente para evitar lifetime issues
                let scraped_posts: Vec<ScrapedPost> = match item.get("posts").and_then(|p| p.as_array()) {
                    Some(posts_array) => {
                        info!("🔴 Reddit[{}]: {} con {} posts", index, keyword, posts_array.len());
                        
                        posts_array.iter()
                            .filter_map(|post| {
                                Some(ScrapedPost {
                                    comments: post.get("comments")?.as_i64()? as i32,
                                    followers: None, // Reddit no tiene followers
                                    likes: 0, // Reddit usa upvotes en vez de likes
                                    link: post.get("link").and_then(|l| l.as_str()).unwrap_or("").to_string(),
                                    time: post.get("time")?.as_str()?.to_string(),
                                    members: post.get("members").and_then(|m| m.as_i64()).map(|m| m as i32),
                                    subreddit: post.get("subreddit").and_then(|s| s.as_str()).map(|s| s.to_string()),
                                    title: post.get("title").and_then(|t| t.as_str()).map(|t| t.to_string()),
                                    vote: post.get("vote").and_then(|v| v.as_i64()).map(|v| v as i32),
                                })
                            })
                            .collect()
                    },
                    None => {
                        info!("🔴 Reddit[{}]: {} SIN posts (array vacío)", index, keyword);
                        vec![] // Vector vacío si no hay posts
                    }
                };
                
                // 🚀 INTENTAR GUARDAR (incluso si está vacío)
                match save_scraped_data_to_dynamo(
                    keyword.to_string(), 
                    "reddit".to_string(), 
                    scraped_posts.clone()
                ).await {
                    Ok(saved) => {
                        if saved {
                            saved_hashtags.push(format!("{}:reddit", keyword));
                            info!("✅ Reddit: {} guardado ({} posts)", keyword, scraped_posts.len());
                        } else {
                            warn!("⚠️ Reddit: {} NO guardado (posts vacíos)", keyword);
                        }
                    },
                    Err(e) => {
                        error!("❌ Reddit: Error guardando {}: {:?}", keyword, e);
                    }
                }
            }
        }
    }
    
    // 🐦 PROCESAR TWITTER (si existe)
    if let Some(twitter_array) = scraped_data.get("data")
        .and_then(|d| d.get("twitter"))
        .and_then(|t| t.as_array()) {
        
        info!("🐦 Procesando {} items de Twitter", twitter_array.len());
        
        for (index, item) in twitter_array.iter().enumerate() {
            if let Some(keyword) = item.get("keyword").and_then(|k| k.as_str()) {
                // 🔧 FIX: Manejar el Option correctamente para evitar lifetime issues
                let scraped_posts: Vec<ScrapedPost> = match item.get("posts").and_then(|p| p.as_array()) {
                    Some(posts_array) => {
                        info!("🐦 Twitter[{}]: {} con {} posts", index, keyword, posts_array.len());
                        
                        posts_array.iter()
                            .filter_map(|post| {
                                Some(ScrapedPost {
                                    comments: post.get("comments").and_then(|c| c.as_i64()).unwrap_or(0) as i32,
                                    followers: post.get("followers").and_then(|f| f.as_i64()).map(|f| f as i32),
                                    likes: post.get("likes").and_then(|l| l.as_i64()).unwrap_or(0) as i32,
                                    link: post.get("link").and_then(|l| l.as_str()).unwrap_or("").to_string(),
                                    time: post.get("time")?.as_str()?.to_string(),
                                    members: None,
                                    subreddit: None,
                                    title: None,
                                    vote: None,
                                })
                            })
                            .collect()
                    },
                    None => {
                        info!("🐦 Twitter[{}]: {} SIN posts (array vacío)", index, keyword);
                        vec![] // Vector vacío si no hay posts
                    }
                };
                
                // 🚀 INTENTAR GUARDAR
                match save_scraped_data_to_dynamo(
                    keyword.to_string(), 
                    "twitter".to_string(), 
                    scraped_posts.clone()
                ).await {
                    Ok(saved) => {
                        if saved {
                            saved_hashtags.push(format!("{}:twitter", keyword));
                            info!("✅ Twitter: {} guardado ({} posts)", keyword, scraped_posts.len());
                        } else {
                            warn!("⚠️ Twitter: {} NO guardado (posts vacíos)", keyword);
                        }
                    },
                    Err(e) => {
                        error!("❌ Twitter: Error guardando {}: {:?}", keyword, e);
                    }
                }
            }
        }
    }
    
    info!("🎯 Guardado completado. Total guardados: {}", saved_hashtags.len());
    info!("📋 Hashtags guardados: {:?}", saved_hashtags);
    
    saved_hashtags
}

// 🆕 FUNCIÓN PARA EXTRAER TODOS LOS HASHTAGS DE LOS DATOS SCRAPED
fn extract_all_hashtags_from_scraped_data(scraped_data: &serde_json::Value) -> Vec<String> {
    let mut all_hashtags = Vec::new();
    
    // Extraer de Instagram
    if let Some(instagram_array) = scraped_data.get("data")
        .and_then(|d| d.get("instagram"))
        .and_then(|i| i.as_array()) {
        
        for item in instagram_array {
            if let Some(keyword) = item.get("keyword").and_then(|k| k.as_str()) {
                if !all_hashtags.contains(&keyword.to_string()) {
                    all_hashtags.push(keyword.to_string());
                }
            }
        }
    }
    
    // Extraer de Reddit
    if let Some(reddit_array) = scraped_data.get("data")
        .and_then(|d| d.get("reddit"))
        .and_then(|r| r.as_array()) {
        
        for item in reddit_array {
            if let Some(keyword) = item.get("keyword").and_then(|k| k.as_str()) {
                if !all_hashtags.contains(&keyword.to_string()) {
                    all_hashtags.push(keyword.to_string());
                }
            }
        }
    }
    
    // Extraer de Twitter
    if let Some(twitter_array) = scraped_data.get("data")
        .and_then(|d| d.get("twitter"))
        .and_then(|t| t.as_array()) {
        
        for item in twitter_array {
            if let Some(keyword) = item.get("keyword").and_then(|k| k.as_str()) {
                if !all_hashtags.contains(&keyword.to_string()) {
                    all_hashtags.push(keyword.to_string());
                }
            }
        }
    }
    
    info!("🔍 Hashtags extraídos de datos scraped: {:?}", all_hashtags);
    all_hashtags
}

async fn enhance_trends_with_fallback(mut trends: serde_json::Value, hashtags: &[String]) -> serde_json::Value {
    // Si no podemos acceder a DynamoDB, devolver trends original sin modificar
    let config = aws_config::defaults(aws_config::BehaviorVersion::latest()).load().await;
    let client = aws_sdk_dynamodb::Client::new(&config);
    let table_name = "trendhash_hashtag_cache";
    
    // Solo mejorar Instagram y Reddit si están vacíos
    if let Some(data) = trends.get_mut("data") {
        // Mejorar Instagram
        if let Some(instagram) = data.get_mut("instagram").and_then(|v| v.as_array_mut()) {
            for item in instagram.iter_mut() {
                // ✅ PATRÓN CORRECTO: Primero keyword, después posts
                let keyword_opt = item.get("keyword").and_then(|k| k.as_str()).map(|s| s.to_string());
                
                if let (Some(keyword), Some(posts)) = (keyword_opt, item.get_mut("posts").and_then(|p| p.as_array_mut())) {
                    if posts.is_empty() && hashtags.contains(&keyword) {
                        if let Ok(fallback_data) = get_fallback_data(&client, table_name, &keyword, "instagram").await {
                            if let serde_json::Value::Array(posts_array) = fallback_data {
                                *posts = posts_array;
                                warn!("✅ Fallback aplicado para Instagram: {}", keyword);
                            }
                        }
                    }
                }
            }
        }
        
        // Mejorar Reddit (mismo patrón)
        if let Some(reddit) = data.get_mut("reddit").and_then(|v| v.as_array_mut()) {
            for item in reddit.iter_mut() {
                // ✅ PATRÓN CORRECTO: Primero keyword, después posts
                let keyword_opt = item.get("keyword").and_then(|k| k.as_str()).map(|s| s.to_string());
                
                if let (Some(keyword), Some(posts)) = (keyword_opt, item.get_mut("posts").and_then(|p| p.as_array_mut())) {
                    if posts.is_empty() && hashtags.contains(&keyword) {
                        if let Ok(fallback_data) = get_fallback_data(&client, table_name, &keyword, "reddit").await {
                            if let serde_json::Value::Array(posts_array) = fallback_data {
                                *posts = posts_array;
                                warn!("✅ Fallback aplicado para Reddit: {}", keyword);
                            }
                        }
                    }
                }
            }
        }
    }
    
    trends
}

async fn get_fallback_data(
    client: &aws_sdk_dynamodb::Client, 
    table_name: &str, 
    hashtag: &str, 
    platform: &str
) -> Result<serde_json::Value, Box<dyn std::error::Error>> {
    
    let pk = format!("HASHTAG#{}", hashtag);
    let sk = format!("DATA#{}", platform);
    
    let result = client.get_item()
        .table_name(table_name)
        .key("pk", AttributeValue::S(pk))
        .key("sk", AttributeValue::S(sk))
        .send()
        .await?;
    
    if let Some(item) = result.item {
        if let Some(posts_data) = item.get("posts_data") {
            if let AttributeValue::S(json_str) = posts_data {
                if let Ok(parsed) = serde_json::from_str::<serde_json::Value>(json_str) {
                    return Ok(parsed);
                }
            }
        }
    }
    
    Ok(serde_json::Value::Array(vec![])) // Devolver array vacío si no encuentra 
}

// 🆕 FUNCIÓN PARA PROCESAR CON ANALYTICS
async fn process_trends_with_analytics(
    trends: &serde_json::Value,
    hashtags: &[String]
) -> serde_json::Value {
    
    // Convertir trends a formato que entiende analytics
    let analytics_request = convert_trends_to_analytics_request(trends, hashtags);
    
    // Procesar con las fórmulas
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

fn convert_trends_to_analytics_request(
    trends: &serde_json::Value,
    hashtags: &[String]
) -> AnalyticsRequest {
    
    let mut instagram_data = Vec::new();
    let mut reddit_data = Vec::new();
    let mut twitter_data = Vec::new();
    
    // Extraer datos de Instagram
    if let Some(instagram_array) = trends.get("data").and_then(|d| d.get("instagram")).and_then(|i| i.as_array()) {
        for item in instagram_array {
            if let (Some(keyword), Some(posts)) = (
                item.get("keyword").and_then(|k| k.as_str()),
                item.get("posts").and_then(|p| p.as_array())
            ) {
                instagram_data.push(HashtagData {
                    keyword: keyword.to_string(),
                    posts: posts.clone(),
                });
            }
        }
    }
    
    // Extraer datos de Reddit
    if let Some(reddit_array) = trends.get("data").and_then(|d| d.get("reddit")).and_then(|r| r.as_array()) {
        for item in reddit_array {
            if let (Some(keyword), Some(posts)) = (
                item.get("keyword").and_then(|k| k.as_str()),
                item.get("posts").and_then(|p| p.as_array())
            ) {
                reddit_data.push(HashtagData {
                    keyword: keyword.to_string(),
                    posts: posts.clone(),
                });
            }
        }
    }
    
    // Extraer datos de Twitter
    if let Some(twitter_array) = trends.get("data").and_then(|d| d.get("twitter")).and_then(|t| t.as_array()) {
        for item in twitter_array {
            if let (Some(keyword), Some(posts)) = (
                item.get("keyword").and_then(|k| k.as_str()),
                item.get("posts").and_then(|p| p.as_array())
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

    // let sales_url = FLOW_CONFIG.get_sales_url(&format!("resource/{}", payload.resource_id));
    // let http_client = reqwest::Client::new();

    // let sales_response = http_client
    //     .get(&sales_url)
    //     .send()
    //     .await
    //     .map_err(|e| {
    //         warn!("Error fetching sales data: {}", e);
    //         error::ErrorInternalServerError("Failed to get sales data")
    //     })?;

    // let sales_data: serde_json::Value = sales_response.json().await.map_err(|e| {
    //     warn!("Invalid sales response: {}", e);
    //     error::ErrorInternalServerError("Invalid sales response")
    // })?;

    let sales = Database::get_resource_sales(payload.resource_id).await.to_web()?;

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
        warn!("Error generating chat response: {}", e);
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
        .map(|m| m.as_str().strip_prefix('#').unwrap_or(m.as_str()).to_string())
        .collect();

    let today = chrono::Utc::now().naive_utc().date();
    let six_months_ago = today
        .checked_sub_signed(chrono::Duration::days(180))
        .unwrap_or(today);

    let trends_payload = serde_json::json!({
        "query": sentence,
        "hashtags": hashtags, 
        "startdatetime": six_months_ago.to_string(),
        "enddatetime": today.to_string(),
        "language": "English"
    });

    let trends_url = FLOW_CONFIG.get_web_url("trends/get-trends");
    let http_client = reqwest::Client::new();
    let trends_response = http_client
        .post(&trends_url)
        .json(&trends_payload)
        .send()
        .await
        .map_err(|e| {
            warn!("Error fetching trends: {}", e);
            error::ErrorInternalServerError("Failed to get trends")
        })?;

    let trends: serde_json::Value = trends_response.json().await.map_err(|e| {
        warn!("Invalid trends response: {}", e);
        error::ErrorInternalServerError("Invalid trends response")
    })?;

    let all_hashtags = extract_all_hashtags_from_scraped_data(&trends);
    let saved_hashtags = save_all_scraped_data(&trends).await;
    let hashtags_for_calculations = if all_hashtags.is_empty() {
        vec![] 
    } else {
        all_hashtags.clone()
    };

    let enhanced_trends = enhance_trends_with_fallback(trends, &hashtags_for_calculations).await;
    let calculated_results = process_trends_with_analytics(&enhanced_trends, &hashtags_for_calculations).await;

    Ok(HttpResponse::Ok().json(serde_json::json!({
        "sentence": sentence,
        "resource_name": resource.name,
        "hashtags": hashtags_for_calculations, 
        "trends": enhanced_trends,        
        "calculated_results": calculated_results,  
        "sales": sales,
        "processing": {
            "status": "✅ CALCULATED",
            "message": "Datos procesados con fórmulas backend y guardados en DynamoDB",
            "backend_calculations": true,
            "scraped_data_saved": true,
            "total_saved": saved_hashtags.len(),
            "saved_hashtags": saved_hashtags
        }
    })))
}

//  🧪 ENDPOINT DE PRUEBA SIN AUTENTICACIÓN
#[post("/test-generate-prompt")]
async fn test_generate_prompt_from_flow(
    payload: web::Json<FlowRequest>,
) -> Result<impl Responder> {
    warn!("🧪 USANDO ENDPOINT DE PRUEBA - Solo para testing!");
    
    // Usar datos hardcodeados para simular usuario y recurso
    let user_id = 1; // Usuario de prueba
    
    // Simular datos del usuario (normalmente viene de la DB)
    let user_industry = "Music & Instruments";
    let user_company_size = "Small Business";
    let user_scope = "Regional";
    let user_branches = "3";
    let user_locations = "Austin, Dallas, Houston";
    
    // Simular datos del recurso (normalmente viene de la DB)
    let resource_type = "Product";
    let resource_name = "Stratocaster Electric Guitar";
    let resource_description = "High-quality electric guitar with vintage sound and modern playability";
    let resource_related_words = "music, rock, blues, vintage, amplifier";

    // Simular sales data (vacío para prueba)
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
        warn!("Error generating chat response: {}", e);
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
        .map(|m| m.as_str().strip_prefix('#').unwrap_or(m.as_str()).to_string())
        .collect();

    let trends = serde_json::json!({
        "data": {
            "instagram": [
                {
                    "keyword": "ElectricGuitar",
                    "posts": []  
                },
                {
                    "keyword": "RockMusic", 
                    "posts": []
                },
                {
                    "keyword": "VintageGuitars",
                    "posts": []
                },
                {
                    "keyword": "Reply", 
                    "posts": []
                },
                {
                    "keyword": "Mobilelive",
                    "posts": []
                },
                {
                    "keyword": "Sita",
                    "posts": []
                }
            ],
            "reddit": [
                {
                    "keyword": "ElectricGuitar",
                    "posts": []  
                },
                {
                    "keyword": "RockMusic", 
                    "posts": []
                },
                {
                    "keyword": "VintageGuitars",
                    "posts": []
                },
                {
                    "keyword": "Reply", // 🚀 INCLUIR DATOS QUE NORMALMENTE NO SE GUARDAN
                    "posts": []
                },
                {
                    "keyword": "Mobilelive",
                    "posts": []
                },
                {
                    "keyword": "Sita",
                    "posts": []
                }
            ],
            "twitter": []
        },
        "metadata": []
    });

    warn!("🔥 Usando datos de prueba con todos los hashtags incluidos");
    
    let all_hashtags = extract_all_hashtags_from_scraped_data(&trends);
    let saved_hashtags = save_all_scraped_data(&trends).await;
    let hashtags_for_calculations = all_hashtags.clone();
    let enhanced_trends = enhance_trends_with_fallback(trends, &hashtags_for_calculations).await;
    let calculated_results = process_trends_with_analytics(&enhanced_trends, &hashtags_for_calculations).await;

    Ok(HttpResponse::Ok().json(serde_json::json!({
        "status": "🧪 TEST MODE",
        "message": "Endpoint de prueba - datos simulados con TODOS los hashtags",
        "sentence": sentence,
        "hashtags": hashtags_for_calculations, // 🆕 USAR TODOS LOS HASHTAGS
        "trends": enhanced_trends,  
        "calculated_results": calculated_results,  
        "sales": sales_data,
        "debug": {
            "user_id": user_id,
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

#[post("/debug/check-scraped-data")]
async fn debug_check_scraped_data(body: web::Json<serde_json::Value>) -> Result<impl Responder> {
    let scraped_data = body.into_inner();
    
    info!("🔍 Iniciando análisis de datos scraped...");
    
    let mut debug_info = serde_json::json!({
        "status": "🔍 DEBUGGING",
        "found_hashtags": [],
        "instagram_analysis": {},
        "reddit_analysis": {},
        "twitter_analysis": {},
        "summary": {}
    });
    
    let mut all_found_hashtags = Vec::new();
    
    if let Some(instagram_array) = scraped_data.get("data")
        .and_then(|d| d.get("instagram"))
        .and_then(|i| i.as_array()) {
        
        let mut instagram_hashtags = Vec::new();
        for (index, item) in instagram_array.iter().enumerate() {
            if let Some(keyword) = item.get("keyword").and_then(|k| k.as_str()) {
                let posts_count = item.get("posts")
                    .and_then(|p| p.as_array())
                    .map(|arr| arr.len())
                    .unwrap_or(0);
                
                instagram_hashtags.push(serde_json::json!({
                    "index": index,
                    "keyword": keyword,
                    "posts_count": posts_count,
                    "has_posts": posts_count > 0,
                    "will_be_saved": posts_count > 0 // Solo se guardan los que tienen posts
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
    
    // 🔴 ANALIZAR REDDIT
    if let Some(reddit_array) = scraped_data.get("data")
        .and_then(|d| d.get("reddit"))
        .and_then(|r| r.as_array()) {
        
        let mut reddit_hashtags = Vec::new();
        for (index, item) in reddit_array.iter().enumerate() {
            if let Some(keyword) = item.get("keyword").and_then(|k| k.as_str()) {
                let posts_count = item.get("posts")
                    .and_then(|p| p.as_array())
                    .map(|arr| arr.len())
                    .unwrap_or(0);
                
                reddit_hashtags.push(serde_json::json!({
                    "index": index,
                    "keyword": keyword,
                    "posts_count": posts_count,
                    "has_posts": posts_count > 0,
                    "will_be_saved": posts_count > 0 // Solo se guardan los que tienen posts
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
    
    // 🐦 ANALIZAR TWITTER
    if let Some(twitter_array) = scraped_data.get("data")
        .and_then(|d| d.get("twitter"))
        .and_then(|t| t.as_array()) {
        
        let mut twitter_hashtags = Vec::new();
        for (index, item) in twitter_array.iter().enumerate() {
            if let Some(keyword) = item.get("keyword").and_then(|k| k.as_str()) {
                let posts_count = item.get("posts")
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
    
    info!("🎯 Análisis completado. Hashtags encontrados: {:?}", all_found_hashtags);
    
    Ok(HttpResponse::Ok().json(debug_info))
}


#[post("/debug/force-save-empty-hashtags")]
async fn debug_force_save_empty_hashtags(body: web::Json<serde_json::Value>) -> Result<impl Responder> {
    let scraped_data = body.into_inner();
    
    info!("🚀 FORZANDO guardado de hashtags vacíos para testing...");
    
    let mut force_saved = Vec::new();
    
    // Obtener todos los hashtags únicos
    let all_hashtags = extract_all_hashtags_from_scraped_data(&scraped_data);
    
    // Forzar guardado de cada hashtag (incluso vacíos)
    for hashtag in &all_hashtags {
        // Instagram
        match save_scraped_data_to_dynamo(
            hashtag.clone(), 
            "instagram".to_string(), 
            vec![] // Vector vacío
        ).await {
            Ok(_) => {
                force_saved.push(format!("{}:instagram", hashtag));
                info!("✅ Forzado guardado: {} (Instagram)", hashtag);
            },
            Err(e) => {
                error!("❌ Error forzando {}: {:?}", hashtag, e);
            }
        }
        
        // Reddit
        match save_scraped_data_to_dynamo(
            hashtag.clone(), 
            "reddit".to_string(), 
            vec![] // Vector vacío
        ).await {
            Ok(_) => {
                force_saved.push(format!("{}:reddit", hashtag));
                info!("✅ Forzado guardado: {} (Reddit)", hashtag);
            },
            Err(e) => {
                error!("❌ Error forzando {}: {:?}", hashtag, e);
            }
        }
    }
    
    Ok(HttpResponse::Ok().json(serde_json::json!({
        "status": "🚀 FORCE SAVE COMPLETED",
        "message": "Hashtags vacíos guardados forzadamente",
        "all_hashtags_found": all_hashtags,
        "force_saved": force_saved,
        "total_saved": force_saved.len(),
        "note": "Este endpoint fuerza el guardado incluso si los posts están vacíos"
    })))
}

pub fn routes() -> actix_web::Scope {
    web::scope("/flow")
        .service(test_generate_prompt_from_flow)  
        .service(debug_force_save_empty_hashtags) 
        .service(
            web::scope("/secure")
                .wrap(from_fn(middlewares::auth))
                .service(generate_prompt_from_flow)
        )
}