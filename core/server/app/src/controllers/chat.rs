use actix_web::{HttpResponse, Responder, post, web};
use rig::{
    completion::Prompt,
    providers::{self, groq::DEEPSEEK_R1_DISTILL_LLAMA_70B},
};
use serde::Deserialize;
use tracing::warn;

#[derive(Deserialize)]
struct ChatRequest {
    message: String,
}

#[post("")]
pub async fn handle_chat(body: web::Json<ChatRequest>) -> impl Responder {
    let client = providers::groq::Client::from_env();

    let comedian_agent = client
        .agent(DEEPSEEK_R1_DISTILL_LLAMA_70B)
        .preamble("You are an expert researcher")
        .build();

    match comedian_agent.prompt(&body.message).await {
        Ok(response) => HttpResponse::Ok().json(response),
        Err(e) => {
            warn!("Error: {}", e);
            HttpResponse::InternalServerError().finish()
        }
    }
}

pub fn routes() -> actix_web::Scope {
    actix_web::Scope::new("/chat")
      .service(handle_chat)
}
