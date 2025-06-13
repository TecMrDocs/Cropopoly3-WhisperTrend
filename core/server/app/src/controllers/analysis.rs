/**
 * Módulo de Análisis de Tendencias Digitales
 * 
 * Este archivo contiene los endpoints y lógica para generar análisis automatizados
 * de tendencias digitales basados en datos de redes sociales, hashtags y ventas.
 * Utiliza modelos de IA para procesar los datos y generar insights empresariales.
 * 
 * @author Julio Cesar Vivas Medina
 */

use actix_web::{post, get, web, HttpResponse, Responder};
use tracing::error;
use std::fs;
use rig::{
    completion::Prompt,
    providers,
};
use serde::{Deserialize, Serialize};

/**
 * Estructura para recibir solicitudes de análisis desde el frontend
 * Contiene el modelo de IA a utilizar y los datos a analizar
 */
#[derive(Deserialize)]
struct AnalysisRequest {
    model: String,
    analysis_data: serde_json::Value,
}

/**
 * Estructura de respuesta para los análisis generados
 * Incluye el contenido del análisis y el estado de guardado
 */
#[derive(Serialize)]
struct AnalysisResponse {
    analysis: String,
    saved: bool,
}

/**
 * Estructura que representa todos los datos del contexto de análisis
 * Contiene información de hashtags, tendencias, ventas y resultados calculados
 */
#[derive(Debug, Deserialize, Serialize)]
pub struct PromptContextData {
    pub sentence: String,
    pub hashtags: Vec<String>,
    pub trends: serde_json::Value,
    pub calculated_results: Option<serde_json::Value>,
    pub sales: Option<serde_json::Value>,
    pub resource_name: Option<String>,
    pub processing: Option<serde_json::Value>,
}

/**
 * Constantes de configuración para las rutas de archivos de análisis
 * Definen las ubicaciones donde se almacenan los diferentes tipos de análisis
 */
const NEW_ANALYSIS_PATH: &str = "src/data/new_analysis.md";
const OLD_ANALYSIS_PATH: &str = "src/data/old_analysis.md";
const DUMMY_ANALYSIS_PATH: &str = "src/data/response.md";

/**
 * Endpoint de prueba para verificar la recepción correcta de datos del contexto
 * Utilizado durante el desarrollo para validar la estructura de datos entrantes
 * 
 * @param body Datos del contexto de análisis enviados desde el frontend
 * @return Respuesta HTTP con los mismos datos recibidos para verificación
 */
#[post("/test-prompt-context")]
pub async fn test_prompt_context(body: web::Json<PromptContextData>) -> impl Responder {
    HttpResponse::Ok().json(&*body)
}

/**
 * Endpoint principal para generar análisis de tendencias digitales
 * Procesa los datos recibidos, construye un prompt estructurado y utiliza IA
 * para generar insights empresariales basados en los datos de redes sociales
 * 
 * @param body Solicitud que contiene el modelo de IA y los datos a analizar
 * @return Respuesta con el análisis generado y el estado de guardado
 */
#[post("")]
pub async fn handle_analysis(body: web::Json<AnalysisRequest>) -> impl Responder {
    // Construcción del prompt estructurado para el análisis
    // Define el formato y las secciones que debe incluir el análisis generado
    let mut prompt = String::from(
        "Eres un analista de datos senior especializado en análisis de tendencias digitales y marketing.\n\n\
         # 📊 Análisis de Tendencias Digitales\n\n\
         ## 🎯 Resumen Ejecutivo\n\
         - Proporciona un resumen de 100–150 palabras con los hallazgos clave.\n\n\
         ## 🔥 Hashtags Clave\n\
         - Indica los 3 hashtags con mejor desempeño y sus métricas principales.\n\n\
         ## 💡 Insights Destacados\n\
         - Extrae hasta 5 insights o patrones relevantes basados en los datos.\n\n\
         ## 📱 Detalle por Plataforma\n\
         ### Instagram\n\
         - Tasa de interacción, viralidad y hashtag top.\n\n\
         ### Reddit\n\
         - Tasa de interacción, viralidad y hashtag top.\n\n\
         ### Twitter/X\n\
         - Tasa de interacción, viralidad y hashtag top.\n\n\
         ## 💰 Análisis de Ventas\n\
         - Ventas totales, mes punta, tendencia y variación mensual.\n\n\
         ## 🔗 Correlaciones y Recomendaciones\n\
         - Relación redes vs ventas, hashtags con más impacto y recomendaciones estratégicas.\n\n\
         ## 📊 Datos Originales Proporcionados (JSON)\n\n"
    );

    // Serialización de los datos de análisis para incluir en el prompt
    // Convierte los datos JSON en formato legible para el modelo de IA
    let analysis_data_str = serde_json::to_string_pretty(&body.analysis_data)
        .unwrap_or_else(|_| "Error al serializar datos".to_string());
    
    prompt.push_str(&analysis_data_str);

    // Inicialización del cliente de IA con configuración específica
    // Configura el agente con el modelo solicitado y el contexto de análisis empresarial
    let client = providers::groq::Client::from_env();

    let agent = client
        .agent(body.model.as_str())
        .preamble("Eres un analista de datos senior: proporciona insights cuantitativos precisos, identifica patrones clave y sugiere estrategias basadas exclusivamente en los datos proporcionados.")
        .build();

    // Procesamiento del análisis con manejo de errores
    // Envía el prompt al modelo de IA y procesa la respuesta
    // Incluye lógica de respaldo y guardado de archivos
    match agent.prompt(&prompt).await {
        Ok(resp) => {
            let analysis_content = resp.to_string();
            
            // Sistema de respaldo para análisis anteriores
            // Crea una copia del análisis actual antes de sobrescribirlo
            if fs::metadata(NEW_ANALYSIS_PATH).is_ok() {
                let _ = fs::copy(NEW_ANALYSIS_PATH, OLD_ANALYSIS_PATH);
            }

            // Guardado del nuevo análisis en el sistema de archivos
            // Maneja errores de escritura de forma silenciosa
            let saved = fs::write(NEW_ANALYSIS_PATH, &analysis_content).is_ok();

            HttpResponse::Ok().json(AnalysisResponse {
                analysis: analysis_content,
                saved,
            })
        }
        Err(e) => {
            error!("Error al invocar IA: {}", e);
            HttpResponse::InternalServerError().json(AnalysisResponse {
                analysis: format!("Error al generar análisis: {}", e),
                saved: false,
            })
        }
    }
}

/**
 * Endpoint para servir análisis de demostración
 * Proporciona contenido estático cuando no hay análisis reales disponibles
 * Incluye creación automática de archivo si no existe
 * 
 * @return Respuesta HTTP con el contenido del análisis dummy
 */
#[get("/dummy")]
pub async fn handle_dummy_analysis() -> impl Responder {

    // Lectura del archivo de análisis dummy con manejo de errores
    // Si el archivo no existe, crea uno por defecto automáticamente
    match fs::read_to_string(DUMMY_ANALYSIS_PATH) {
        Ok(content) => {
            HttpResponse::Ok().body(content)
        }
        Err(_) => {
            // Contenido por defecto para análisis dummy
            // Se utiliza cuando el archivo original no está disponible
            let default_content = "# 📋 Análisis Dummy\n\nEste es un análisis de demostración.\nEl archivo original no se encontró, por lo que se generó este contenido por defecto.";
            
            // Creación automática del archivo dummy con contenido por defecto
            // Maneja errores de escritura y proporciona respuesta apropiada
            match fs::write(DUMMY_ANALYSIS_PATH, default_content) {
                Ok(_) => HttpResponse::Ok().body(default_content),
                Err(_) => HttpResponse::InternalServerError().body("Error al acceder al análisis dummy")
            }
        }
    }
}

/**
 * Endpoint para obtener el análisis más reciente generado
 * Sirve el último análisis creado por el sistema de IA
 * 
 * @return Respuesta HTTP con el contenido del análisis más reciente
 */
#[get("/latest")]
pub async fn handle_latest_analysis() -> impl Responder {
    
    // Lectura del archivo de análisis más reciente
    // Maneja casos donde el archivo no existe o no es accesible
    match fs::read_to_string(NEW_ANALYSIS_PATH) {
        Ok(content) => HttpResponse::Ok().body(content),
        Err(_) => HttpResponse::NotFound().body("No hay análisis reciente disponible")
    }
}

/**
 * Endpoint para obtener el análisis anterior al actual
 * Proporciona acceso al análisis previo para comparaciones históricas
 * Incluye creación automática si es el primer análisis del sistema
 * 
 * @return Respuesta HTTP con el contenido del análisis anterior
 */
#[get("/previous")]
pub async fn handle_previous_analysis() -> impl Responder {
    
    // Lectura del archivo de análisis anterior con fallback
    // Si no existe análisis anterior, crea un mensaje informativo por defecto
    match fs::read_to_string(OLD_ANALYSIS_PATH) {
        Ok(content) => {
            HttpResponse::Ok().body(content)
        }
        Err(_) => {
            // Contenido por defecto para cuando no hay análisis anterior
            // Informa al usuario que este es el primer análisis del sistema
            let default_content = "# 📋 Análisis Anterior\n\nNo hay análisis anterior disponible.\nEste es el primer análisis generado en el sistema.";
            
            
            // Creación del archivo de análisis anterior con contenido informativo
            // Maneja errores de escritura y proporciona respuesta apropiada
            match fs::write(OLD_ANALYSIS_PATH, default_content) {
                Ok(_) => HttpResponse::Ok().body(default_content),
                Err(_) => HttpResponse::NotFound().body("No hay análisis anterior disponible")
            }
        }
    }
}

/**
 * Configuración de rutas para el módulo de análisis
 * Define todos los endpoints disponibles bajo el prefijo /analysis
 * Incluye endpoints para generación, consulta y testing de análisis
 * 
 * @return Scope configurado con todas las rutas del módulo
 */
pub fn routes() -> actix_web::Scope {
    actix_web::Scope::new("/analysis")
        .service(handle_analysis)
        .service(handle_dummy_analysis)
        .service(handle_latest_analysis)
        .service(handle_previous_analysis)
        .service(test_prompt_context)
}