use actix_web::{
    web, HttpRequest, HttpResponse, Responder, Result, post, error, middleware::from_fn, HttpMessage,
};
use crate::{
    models::{User, Resource},
    middlewares,
    database::DbResponder,
    controllers::flow_config::FLOW_CONFIG,
};
use serde::Deserialize;
use tracing::warn;
use regex::Regex;
use rig::{
    completion::Prompt,
    providers,
};

#[derive(Deserialize)]
pub struct FlowRequest {
    resource_id: i32,
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

    let prompt = format!(
        "Me dedico a la industria de {}. Tengo una {} con alcance {} y {} sucursales. Desarrollo mis operaciones en {}. Ofrezco un {} llamado {}. Consiste en: {}, y se asocia con: {}. Por favor escribe una sentencia en inglés que describa mi producto (procura no mencionar el nombre de mi producto) y mi empresa para realizar una búsqueda de noticias. También dame 3 hashtags en inglés que hayan sido populares, que pueda buscar en redes sociales y que se relacionen con mi empresa y con mi producto (procura que los hashtags no incluyan el nombre de mi producto). Separa la sentencia de los hashtags solo con el símbolo @.",
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

    // RESPUESTA DEL CHAT
let content = response.trim();
let after_think = content.split("</think>").nth(1).unwrap_or(content).trim();
let parts: Vec<&str> = after_think.split('@').collect();

let sentence = parts.get(0).map(|s| s.trim()).unwrap_or("");
let hashtags_block = parts.get(1).map(|s| s.trim()).unwrap_or("");

// Regex para hashtags
let re = Regex::new(r"#\w+").unwrap();
let mut hashtags: Vec<String> = re
    .find_iter(hashtags_block)
    .map(|m| m.as_str().to_string())
    .collect();

// FECHAS PARA NOTICIAS
let today = chrono::Utc::now().naive_utc().date();
let yesterday = today.pred_opt().unwrap_or(today);
    let notices_payload = serde_json::json!({
        "query": sentence,
        "startdatetime": yesterday.to_string(),
        "enddatetime": today.to_string(),
        "language": "en"
    });

    let notices_url = FLOW_CONFIG.get_web_url("notices/get-notices");
    let client = reqwest::Client::new();
    let notices_response = client.post(&notices_url).json(&notices_payload).send().await.map_err(|e| {
        warn!("Error fetching notices: {}", e);
        error::ErrorInternalServerError("Failed to get notices")
    })?;

    let notices: serde_json::Value = notices_response.json().await.map_err(|e| {
        warn!("Invalid notices response: {}", e);
        error::ErrorInternalServerError("Invalid notices response")
    })?;

    let mut all_tags = hashtags.clone();
    if let Some(array) = notices.as_array() {
        for item in array.iter() {
            if let Some(tags) = item.get("tags") {
                if let Some(arr) = tags.as_array() {
                    for tag in arr.iter().filter_map(|v| v.as_str()) {
                        if tag.starts_with('#') && !all_tags.contains(&tag.to_string()) {
                            all_tags.push(tag.to_string());
                        }
                    }
                }
            }
        }
    }

    let mut reddit_posts = vec![];
    let mut instagram_posts = vec![];

    for tag in &all_tags {
        let reddit_url = FLOW_CONFIG.get_web_url(&format!("reddit/get-simple-posts/{}", tag.trim_start_matches('#')));
        if let Ok(res) = client.get(&reddit_url).send().await {
            if let Ok(json) = res.json::<serde_json::Value>().await {
                reddit_posts.push(json);
            }
        }

        let ig_url = FLOW_CONFIG.get_web_url(&format!("instagram/hashtag/{}", tag.trim_start_matches('#')));
        if let Ok(res) = client.get(&ig_url).send().await {
            if let Ok(json) = res.json::<serde_json::Value>().await {
                instagram_posts.push(json);
            }
        }
    }

    Ok(HttpResponse::Ok().json(serde_json::json!({
        "sentence": sentence,
        "hashtags": hashtags,
        "notices": notices,
        "reddit": reddit_posts,
        "instagram": instagram_posts
    })))
}

pub fn routes() -> actix_web::Scope {
    web::scope("/flow")
        .service(
            web::scope("/secure")
                .wrap(from_fn(middlewares::auth))
                .service(generate_prompt_from_flow)
        )
}
