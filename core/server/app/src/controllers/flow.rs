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
        .map(|m| m.as_str().to_string())
        .collect();

    let today = chrono::Utc::now().naive_utc().date();
    let six_months_ago = today
        .checked_sub_signed(chrono::Duration::days(180))
        .unwrap_or(today);

    let trends_payload = serde_json::json!({
        "query": sentence,
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

    Ok(HttpResponse::Ok().json(serde_json::json!({
        "sentence": sentence,
        "hashtags": hashtags,
        "trends": trends
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
