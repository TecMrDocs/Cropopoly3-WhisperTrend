use actix_web::{post, get, web, HttpResponse, Responder};
use tracing::{info, warn};
use std::fs;
use rig::{
    completion::Prompt,
    providers::groq::Client,
};
use serde::Deserialize;

#[derive(Deserialize)]
struct ChatRequest {
    model: String,
}

#[post("")]
pub async fn handle_analysis(body: web::Json<ChatRequest>) -> impl Responder {
    info!("Generando interpretación del análisis...");

    // rutas de los JSON
    let files = [
        "/workspace/core/web/src/dataSets/data-x.json",
        "/workspace/core/web/src/dataSets/data-ventas.json",
        "/workspace/core/web/src/dataSets/data-reddit.json",
        "/workspace/core/web/src/dataSets/data-instagram.json",
    ];

    // prompt detallado
    let mut prompt = String::from(
        "Eres un analista de datos senior. A continuación tienes cuatro conjuntos de datos:\n\
        1) TikTok: seguimiento mensual de likes, reposts, comentarios, vistas y seguidores por hashtag.\n\
        2) Ventas: unidades vendidas, ingresos y precio promedio por mes para el Bolso Marianne.\n\
        3) Reddit: upVotes, comentarios, suscriptores y horas de actividad por hashtag.\n\
        4) Instagram: likes, comentarios, vistas, seguidores y compartidos por hashtag.\n\n\
        Con esta información:\n\
        - Describe las tendencias temporales más relevantes en cada plataforma.\n\
        - Compara el desempeño de los hashtags (#EcoFriendlyTest2, #SustainableFashion, #NuevosMateriales) a través de las redes.\n\
        - Señala correlaciones entre ventas y actividad en redes.\n\
        - Propón recomendaciones de estrategia de contenido y de producto.\n\n\
        Datos completos:\n"
    );

    for path in &files {
        match fs::read_to_string(path) {
            Ok(content) => {
                prompt.push_str(&format!("\n--- {} ---\n{}\n", path, content));
            }
            Err(e) => {
                warn!("No pude leer {}: {}", path, e);
            }
        }
    }

    // inicializar cliente de IA
    let client = Client::from_env();
    let agent = client
        .agent(body.model.as_str())
        .preamble("Eres un analista de datos senior: extrae insights cuantitativos y cualitativos, resalta hallazgos clave y sugiere estrategias basadas en los datos.")
        .build();

    // enviar prompt y devolver respuesta
    match agent.prompt(&prompt).await {
        Ok(resp) => HttpResponse::Ok().json(resp),
        Err(e) => {
            warn!("Error al invocar IA: {}", e);
            HttpResponse::InternalServerError().finish()
        }
    }
}

#[get("/dummy")]
pub async fn handle_dummy_analysis() -> impl Responder {
    info!("Devolviendo respuesta dummy de análisis");
    match fs::read_to_string("src/data/response.md") {
        Ok(content) => HttpResponse::Ok().body(content),
        Err(e) => {
            warn!("No pude leer response.md: {}", e);
            HttpResponse::InternalServerError().finish()
        }
    }
}

pub fn routes() -> actix_web::Scope {
    actix_web::Scope::new("/analysis")
        .service(handle_analysis)
        .service(handle_dummy_analysis)
}