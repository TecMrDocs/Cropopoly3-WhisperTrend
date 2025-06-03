use actix_web::{
    web, HttpRequest, HttpResponse, Responder, Result, post, error, get, middleware::from_fn,
    HttpMessage,
};
use crate::{
    models::{User, Resource},
    middlewares,
    database::DbResponder,
};
use serde::Deserialize;
use tracing::warn;
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
    // Extraer user_id desde el token
    let user_id = req
        .extensions()
        .get::<i32>()
        .cloned()
        .ok_or_else(|| error::ErrorUnauthorized("Missing user id"))?;

    // Obtener usuario
    let user = User::get_by_id(user_id)
        .await
        .to_web()?
        .ok_or_else(|| error::ErrorNotFound("User not found"))?;

    // Obtener recurso
    let resource = Resource::get_by_id(payload.resource_id)
        .await
        .to_web()?
        .ok_or_else(|| error::ErrorNotFound("Resource not found"))?;

    // Construir prompt
    let prompt = format!(
        "Me dedico a la industria de {}. Tengo una {} con alcance {} y {} sucursales. \
Desarrollo mis operaciones en {}. Ofrezco un {} llamado {}. Consiste en: {}, y se asocia con: {}. \
Por favor escribe una sentencia en inglés que describa mi producto (procura no mencionar el nombre de mi producto) \
y mi empresa para realizar una búsqueda de noticias. También dame 3 hashtags en inglés que hayan sido populares, \
que pueda buscar en redes sociales y que se relacionen con mi empresa y con mi producto \
(procura que los hashtags no incluyan el nombre de mi producto). Separa la sentencia de los hashtags solo con el símbolo @.",
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

    // Cliente LLM de groq
    let client = providers::groq::Client::from_env();

    let agent = client
        .agent("deepseek-r1-distill-llama-70b")
        .preamble("You are an expert researcher")
        .build();

    let response = agent.prompt(&prompt).await.map_err(|e| {
        warn!("Error generating chat response: {}", e);
        error::ErrorInternalServerError("Error generating chat response")
    })?;

    Ok(HttpResponse::Ok().json(response))
}

pub fn routes() -> actix_web::Scope {
    web::scope("/flow")
        .service(
            web::scope("/secure")
                .wrap(from_fn(middlewares::auth))
                .service(generate_prompt_from_flow)
        )
}
