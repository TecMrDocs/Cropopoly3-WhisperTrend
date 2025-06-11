use actix_web::{post, get, web, HttpResponse, Responder};
use tracing::{info, warn};
use std::fs;
use rig::{
    completion::Prompt,
    providers::groq::Client,
};
use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
struct AnalysisRequest {
    model: String,
    analysis_data: serde_json::Value,
}

#[derive(Serialize)]
struct AnalysisResponse {
    analysis: String,
    saved: bool,
}

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

// 🆕 CONSTANTES DE RUTAS CORREGIDAS
const DATA_DIR: &str = "src/data";
const NEW_ANALYSIS_PATH: &str = "src/data/new_analysis.md";
const OLD_ANALYSIS_PATH: &str = "src/data/old_analysis.md";
const DUMMY_ANALYSIS_PATH: &str = "src/data/response.md";

// Endpoint de prueba para verificar recepción de datos
#[post("/test-prompt-context")]
pub async fn test_prompt_context(body: web::Json<PromptContextData>) -> impl Responder {
    info!("📡 [TEST] Datos recibidos del PromptContext:");
    info!("📡 [TEST] sentence: {}", body.sentence);
    info!("📡 [TEST] hashtags: {:?}", body.hashtags);
    info!("📡 [TEST] resource_name: {:?}", body.resource_name);
    
    if let Some(ref calc_results) = body.calculated_results {
        info!("📡 [TEST] calculated_results presentes: {}", calc_results);
    } else {
        info!("📡 [TEST] No hay calculated_results");
    }

    // Responder con los mismos datos recibidos
    HttpResponse::Ok().json(&*body)
}

#[post("")]
pub async fn handle_analysis(body: web::Json<AnalysisRequest>) -> impl Responder {
    info!("Generando análisis con datos del contexto...");

    // Crear el prompt mejorado basado en la estructura del JSON
    let mut prompt = String::from(
        "Eres un analista de datos senior especializado en análisis de tendencias digitales y marketing.\n\n\
        CONTEXTO: Tienes acceso a datos completos de un producto/servicio que incluye:\n\
        - Datos de redes sociales (Instagram, Reddit, Twitter) con métricas calculadas\n\
        - Datos de ventas por períodos\n\
        - Hashtags relevantes y su rendimiento\n\
        - Metadatos de noticias relacionadas\n\n\
        ESTRUCTURA DE RESPUESTA REQUERIDA:\n\
        # 📊 ANÁLISIS DE TENDENCIAS DIGITALES\n\n\
        ## 🎯 RESUMEN EJECUTIVO\n\
        [Resumen de 100-150 palabras con los hallazgos más importantes]\n\n\
        ## 📱 ANÁLISIS DE REDES SOCIALES\n\
        ### Instagram\n\
        - Tasa de interacción promedio: [valor]%\n\
        - Tasa de viralidad promedio: [valor]%\n\
        - Hashtag mejor performante: [nombre]\n\n\
        ### Reddit\n\
        - Tasa de interacción promedio: [valor]%\n\
        - Tasa de viralidad promedio: [valor]%\n\
        - Hashtag mejor performante: [nombre]\n\n\
        ### Twitter/X\n\
        - Tasa de interacción promedio: [valor]%\n\
        - Tasa de viralidad promedio: [valor]%\n\
        - Hashtag mejor performante: [nombre]\n\n\
        ## 💰 ANÁLISIS DE VENTAS\n\
        - Ventas totales período: [número] unidades\n\
        - Mes con mayores ventas: [mes/año] ([número] unidades)\n\
        - Tendencia general: [creciente/decreciente/estable]\n\
        - Variación mensual promedio: [porcentaje]%\n\n\
        ## 🔗 CORRELACIONES CLAVE\n\
        - Correlación redes sociales vs ventas: [análisis]\n\
        - Hashtags con mayor impacto en ventas: [lista]\n\
        - Períodos de alta actividad digital y ventas: [análisis]\n\n\
        ## 📈 RECOMENDACIONES ESTRATÉGICAS\n\
        1. **Optimización de hashtags**: [recomendación específica]\n\
        2. **Estrategia de contenido**: [recomendación específica]\n\
        3. **Timing de campañas**: [recomendación específica]\n\
        4. **Enfoque de plataformas**: [recomendación específica]\n\
        5. **Métricas a monitorear**: [recomendación específica]\n\n\
        ## 📊 DATOS CLAVE UTILIZADOS\n\
        - Producto/Servicio: {resource_name}\n\
        - Total de hashtags analizados: {total_hashtags}\n\
        - Período de análisis: {date_range}\n\
        - Fuente de datos: {data_source}\n\n\
        INSTRUCCIONES:\n\
        - Usa ÚNICAMENTE los datos proporcionados\n\
        - Incluye números específicos y porcentajes exactos\n\
        - Mantén un tono profesional pero accesible\n\
        - Máximo 1000 palabras\n\
        - Si algún dato está vacío o es 0, omíte esa información'\n\n\
        DATOS COMPLETOS A ANALIZAR:\n"
    );

    // Agregar los datos del análisis al prompt
    let analysis_data_str = serde_json::to_string_pretty(&body.analysis_data)
        .unwrap_or_else(|_| "Error al serializar datos".to_string());
    
    prompt.push_str(&analysis_data_str);

    // Inicializar cliente de IA
    let client = Client::from_env();    
    let agent = client
        .agent(body.model.as_str())
        .preamble("Eres un analista de datos senior: proporciona insights cuantitativos precisos, identifica patrones clave y sugiere estrategias basadas exclusivamente en los datos proporcionados.")
        .build();

    // Enviar prompt y obtener respuesta
    match agent.prompt(&prompt).await {
        Ok(resp) => {
            let analysis_content = resp.to_string();
            
            // 🔧 RUTAS CORREGIDAS - Crear backup del análisis anterior
            if fs::metadata(NEW_ANALYSIS_PATH).is_ok() {
                if let Err(e) = fs::copy(NEW_ANALYSIS_PATH, OLD_ANALYSIS_PATH) {
                    warn!("Error al crear backup del análisis anterior: {}", e);
                } else {
                    info!("✅ Backup creado: {} -> {}", NEW_ANALYSIS_PATH, OLD_ANALYSIS_PATH);
                }
            }
            
            // Guardar nuevo análisis
            let saved = match fs::write(NEW_ANALYSIS_PATH, &analysis_content) {
                Ok(_) => {
                    info!("✅ Análisis guardado en {}", NEW_ANALYSIS_PATH);
                    true
                }
                Err(e) => {
                    warn!("❌ Error al guardar análisis en {}: {}", NEW_ANALYSIS_PATH, e);
                    false
                }
            };

            HttpResponse::Ok().json(AnalysisResponse {
                analysis: analysis_content,
                saved,
            })
        }
        Err(e) => {
            warn!("Error al invocar IA: {}", e);
            HttpResponse::InternalServerError().json(AnalysisResponse {
                analysis: format!("Error al generar análisis: {}", e),
                saved: false,
            })
        }
    }
}

#[get("/dummy")]
pub async fn handle_dummy_analysis() -> impl Responder {
    info!("📄 Devolviendo respuesta dummy de análisis desde: {}", DUMMY_ANALYSIS_PATH);
    match fs::read_to_string(DUMMY_ANALYSIS_PATH) {
        Ok(content) => {
            info!("✅ Archivo dummy leído correctamente");
            HttpResponse::Ok().body(content)
        }
        Err(e) => {
            warn!("❌ No pude leer {}: {}", DUMMY_ANALYSIS_PATH, e);
            
            // Si no existe, crear uno por defecto
            let default_content = "# 📋 Análisis Dummy\n\nEste es un análisis de demostración.\nEl archivo original no se encontró, por lo que se generó este contenido por defecto.";
            
            if let Err(create_err) = fs::write(DUMMY_ANALYSIS_PATH, default_content) {
                warn!("❌ Error creando archivo dummy: {}", create_err);
                HttpResponse::InternalServerError().body("Error al acceder al análisis dummy")
            } else {
                info!("✅ Archivo dummy creado");
                HttpResponse::Ok().body(default_content)
            }
        }
    }
}

#[get("/latest")]
pub async fn handle_latest_analysis() -> impl Responder {
    info!("📊 Devolviendo último análisis desde: {}", NEW_ANALYSIS_PATH);
    match fs::read_to_string(NEW_ANALYSIS_PATH) {
        Ok(content) => {
            info!("✅ Último análisis leído correctamente");
            HttpResponse::Ok().body(content)
        }
        Err(e) => {
            warn!("❌ No pude leer {}: {}", NEW_ANALYSIS_PATH, e);
            HttpResponse::NotFound().body("No hay análisis reciente disponible")
        }
    }
}

#[get("/previous")]
pub async fn handle_previous_analysis() -> impl Responder {
    info!("📋 Devolviendo análisis anterior desde: {}", OLD_ANALYSIS_PATH);
    match fs::read_to_string(OLD_ANALYSIS_PATH) {
        Ok(content) => {
            info!("✅ Análisis anterior leído correctamente");
            HttpResponse::Ok().body(content)
        }
        Err(e) => {
            warn!("❌ No pude leer {}: {}", OLD_ANALYSIS_PATH, e);
            
            // Si no existe, crear uno por defecto
            let default_content = "# 📋 Análisis Anterior\n\nNo hay análisis anterior disponible.\nEste es el primer análisis generado en el sistema.";
            
            if let Err(create_err) = fs::write(OLD_ANALYSIS_PATH, default_content) {
                warn!("❌ Error creando archivo de análisis anterior: {}", create_err);
                HttpResponse::NotFound().body("No hay análisis anterior disponible")
            } else {
                info!("✅ Archivo de análisis anterior creado");
                HttpResponse::Ok().body(default_content)
            }
        }
    }
}

pub fn routes() -> actix_web::Scope {
    actix_web::Scope::new("/analysis")
        .service(handle_analysis)
        .service(handle_dummy_analysis)
        .service(handle_latest_analysis)
        .service(handle_previous_analysis)
        .service(test_prompt_context)
}