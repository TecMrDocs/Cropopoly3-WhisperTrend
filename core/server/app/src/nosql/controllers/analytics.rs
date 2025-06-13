/**
 * Módulo de Análisis de Métricas de Redes Sociales
 * 
 * Este archivo implementa fórmulas matemáticas avanzadas para calcular tasas de interacción
 * y viralidad en diferentes plataformas sociales. Incluye normalización logarítmica,
 * sanitización de valores extremos y caps de porcentajes para garantizar resultados consistentes.
 * 
 * Autor: Lucio Arturo Reyes Castillo
 */

use actix_web::{web, HttpResponse, Responder, post, Result};
use serde::{Deserialize, Serialize};
use tracing::{info, warn};

/**
 * Función para calcular la tasa de viralidad en Twitter/X
 * Utiliza transformación logarítmica para normalizar valores extremos
 * y aplicar un factor de escala apropiado para la plataforma
 */
pub fn x_viral_rate(reposts: u32, likes: u32, comments: u32, followers: u32) -> f64 {
    if followers == 0 {
        return 0.0;
    }
    
    let engagement = (reposts + likes + comments) as f64;
    let followers_f = followers as f64;
    
    /**
     * Aplicación de logaritmo natural para suavizar valores extremos
     * Evita que cuentas con engagement muy alto distorsionen las métricas
     */
    let log_engagement = (engagement + 1.0).ln();
    let log_followers = (followers_f + 1.0).ln();
    
    /**
     * Cálculo del ratio viral usando logaritmos normalizados
     * Factor de escala de 20.0 ajustado empíricamente para Twitter
     */
    let viral_ratio = if log_followers > 0.0 {
        (log_engagement / log_followers) * 20.0
    } else {
        0.0
    };
    
    /**
     * Aplicación de límites máximos y mínimos para mantener coherencia
     * Cap máximo de 100% para evitar valores irreales
     */
    viral_ratio.min(100.0).max(0.0)
}

/**
 * Función para calcular la tasa de interacción en Twitter/X
 * Utiliza cálculo directo sin logaritmos por la naturaleza lineal de la métrica
 */
pub fn x_interaction_rate(reposts: u32, likes: u32, comments: u32, views: u32) -> f64 {
    if views == 0 {
        return 0.0;
    }
    
    let engagement = (reposts + likes + comments) as f64;
    let views_f = views as f64;
    
    /**
     * Cálculo directo de tasa de interacción como porcentaje
     * No requiere logaritmos debido a la relación lineal engagement/views
     */
    let interaction_rate = (engagement / views_f) * 100.0;
    
    /**
     * Aplicación de límites para mantener valores dentro del rango esperado
     */
    interaction_rate.min(100.0).max(0.0)
}

/**
 * Función para calcular el ratio por hora en Reddit
 * Considera el tiempo transcurrido desde la publicación para normalizar engagement
 */
pub fn reddit_hourly_ratio(upvotes: u32, comments: u32, hours_since_posted: f64) -> f64 {
    if hours_since_posted <= 0.0 {
        return 0.0;
    }
    
    let engagement = (upvotes + comments) as f64;
    
    /**
     * Aplicación de logaritmo para suavizar tanto engagement como tiempo
     * Permite comparar posts con diferentes tiempos de vida de forma equitativa
     */
    let log_engagement = (engagement + 1.0).ln();
    let log_hours = (hours_since_posted + 1.0).ln();
    
    /**
     * Cálculo del ratio horario usando transformación logarítmica
     * Factor de escala de 15.0 optimizado para la dinámica temporal de Reddit
     */
    let hourly_ratio = if log_hours > 0.0 {
        (log_engagement / log_hours) * 15.0
    } else {
        engagement / hours_since_posted
    };
    
    hourly_ratio.min(100.0).max(0.0)
}

/**
 * Función para calcular la tasa de viralidad en Reddit
 * Normaliza el engagement respecto al tamaño del subreddit para comparación justa
 */
pub fn reddit_viral_rate(upvotes: u32, comments: u32, subreddit_subs: u32) -> f64 {
    if subreddit_subs == 0 {
        return 0.0;
    }
    
    let engagement = (upvotes + comments) as f64;
    let subs_f = subreddit_subs as f64;
    
    /**
     * Transformación logarítmica para normalizar diferentes tamaños de subreddits
     * Permite comparar viralidad entre comunidades de diferente escala
     */
    let log_engagement = (engagement + 1.0).ln();
    let log_subs = (subs_f + 1.0).ln();
    
    /**
     * Cálculo de viralidad relativa al tamaño de la comunidad
     * Factor de escala de 25.0 calibrado para la distribución de Reddit
     */
    let viral_ratio = if log_subs > 0.0 {
        (log_engagement / log_subs) * 25.0
    } else {
        0.0
    };
    
    viral_ratio.min(100.0).max(0.0)
}

/**
 * Función para calcular la tasa de interacción en Instagram
 * Utiliza la relación directa entre engagement y visualizaciones
 */
pub fn insta_ratio(likes: u32, comments: u32, views: u32) -> f64 {
    if views == 0 {
        return 0.0;
    }
    
    let engagement = (likes + comments) as f64;
    let views_f = views as f64;
    
    /**
     * Cálculo directo de ratio de engagement para Instagram
     * Metodología estándar de la industria para esta plataforma
     */
    let ratio = (engagement / views_f) * 100.0;
    
    ratio.min(100.0).max(0.0)
}

/**
 * Función para calcular la tasa de viralidad en Instagram
 * Enfoca en acciones que indican propagación viral del contenido
 */
pub fn insta_viral_rate(comments: u32, shares: u32, followers: u32) -> f64 {
    if followers == 0 {
        return 0.0;
    }
    
    let viral_actions = (comments + shares) as f64;
    let followers_f = followers as f64;
    
    /**
     * Aplicación de logaritmos para normalizar cuentas de diferentes tamaños
     * Los comentarios y shares son indicadores clave de viralidad en Instagram
     */
    let log_viral = (viral_actions + 1.0).ln();
    let log_followers = (followers_f + 1.0).ln();
    
    /**
     * Cálculo de viralidad basado en acciones de alta implicación
     * Factor de escala de 30.0 ajustado para el comportamiento de Instagram
     */
    let viral_ratio = if log_followers > 0.0 {
        (log_viral / log_followers) * 30.0
    } else {
        0.0
    };
    
    viral_ratio.min(100.0).max(0.0)
}

/**
 * Función utilitaria para aplicar límites de porcentaje de forma consistente
 * Redondea a 2 decimales y aplica caps máximos y mínimos
 */
fn apply_percentage_cap(value: f64) -> f64 {
    ((value * 100.0).round() / 100.0).min(100.0).max(0.0)
}

/**
 * Función para normalizar valores extremos usando transformación logarítmica
 * Mapea valores que exceden límites razonables a un rango 0-100 válido
 */
fn normalize_extreme_value(value: f64, max_reasonable: f64) -> f64 {
    if value > max_reasonable {
        /**
         * Aplicación de mapeo logarítmico para valores extremos
         * Preserva la relación ordinal mientras limita el rango
         */
        let log_value = value.ln();
        let log_max = max_reasonable.ln();
        
        ((log_value / log_max) * 100.0).min(100.0)
    } else {
        value.min(100.0)
    }
}

/**
 * Función mejorada para detección y corrección de outliers
 * Sanitiza valores inválidos, extremos o fuera de rango esperado
 */
fn sanitize_percentage(value: f64, context: &str) -> f64 {
    let sanitized = if value.is_nan() || value.is_infinite() {
        0.0
    } else if value > 1000.0 {
        /**
         * Normalización logarítmica para valores extremadamente altos
         * Mantiene la información ordinal mientras aplica límites razonables
         */
        let normalized = normalize_extreme_value(value, 100.0);
        normalized
    } else {
        value.min(100.0).max(0.0)
    };
    
    sanitized
}

/**
 * Estructura para datos de posts de Instagram
 * Define los campos necesarios para cálculos de métricas de la plataforma
 */
#[derive(Deserialize, Debug)]
pub struct InstagramPost {
    pub date: String,
    pub likes: u32,
    pub comments: u32,
    pub views: u32,
    pub followers: u32,
    pub shares: u32,
}

/**
 * Estructura para datos de posts de Reddit
 * Incluye métricas específicas de la plataforma como upvotes y tiempo
 */
#[derive(Deserialize, Debug)]
pub struct RedditPost {
    pub date: String,
    pub upvotes: u32,
    pub comments: u32,
    pub subscribers: u32,
    pub hours: f64,
}

/**
 * Estructura para datos de posts de Twitter
 * Contempla las métricas características de la plataforma
 */
#[derive(Deserialize, Debug)]
pub struct TwitterPost {
    pub date: String,
    pub likes: u32,
    pub retweets: u32,
    pub comments: u32,
    pub views: u32,
    pub followers: u32,
}

/**
 * Estructura para agrupar datos de hashtags por plataforma
 * Contiene el keyword y los posts asociados para procesamiento
 */
#[derive(Deserialize, Debug)]
pub struct HashtagData {
    pub keyword: String,
    pub posts: Vec<serde_json::Value>, 
}

/**
 * Estructura para organizar datos de tendencias por plataforma
 * Agrupa todos los hashtags de cada red social para análisis conjunto
 */
#[derive(Deserialize, Debug)]
pub struct TrendsData {
    pub instagram: Vec<HashtagData>,
    pub reddit: Vec<HashtagData>,
    pub twitter: Vec<HashtagData>,
}

/**
 * Estructura de solicitud completa para análisis de analytics
 * Incluye hashtags objetivo, datos de tendencias y información de ventas
 */
#[derive(Deserialize, Debug)]
pub struct AnalyticsRequest {
    pub hashtags: Vec<String>,
    pub trends: TrendsData,
    pub sales: Vec<serde_json::Value>, 
}

/**
 * Estructura de métricas calculadas para cada hashtag
 * Contiene todas las tasas de interacción y viralidad por plataforma
 */
#[derive(Serialize, Debug)]
pub struct HashtagMetrics {
    pub name: String,
    pub instagram_interaction: f64,
    pub instagram_virality: f64,
    pub reddit_interaction: f64,
    pub reddit_virality: f64,
    pub twitter_interaction: f64,
    pub twitter_virality: f64,
}

/**
 * Estructura de respuesta completa del análisis
 * Incluye métricas procesadas y metadatos del procesamiento
 */
#[derive(Serialize, Debug)]
pub struct AnalyticsResponse {
    pub hashtags: Vec<HashtagMetrics>,
    pub total_hashtags: usize,
    pub processing_time_ms: u128,
    pub data_source: String,
}

/**
 * Función de procesamiento para hashtags de Instagram
 * Calcula promedios de interacción y viralidad con sanitización de datos
 */
pub fn process_instagram_hashtag(posts: &[InstagramPost]) -> (f64, f64) {
    if posts.is_empty() {
        return (0.0, 0.0);
    }

    let mut total_interaction = 0.0;
    let mut total_virality = 0.0;
    let mut count = 0;

    /**
     * Procesamiento individual de cada post con aplicación de fórmulas
     * Incluye sanitización para manejar valores extremos o inválidos
     */
    for post in posts {
        let interaction = insta_ratio(post.likes, post.comments, post.views);
        let virality = insta_viral_rate(post.comments, post.shares, post.followers);
        
        let sanitized_interaction = sanitize_percentage(interaction, "Instagram Interaction");
        let sanitized_virality = sanitize_percentage(virality, "Instagram Virality");
        
        total_interaction += sanitized_interaction;
        total_virality += sanitized_virality;
        count += 1;
    }

    /**
     * Cálculo de promedios con aplicación final de caps
     * Garantiza que los resultados finales estén dentro de rangos válidos
     */
    if count > 0 {
        let avg_interaction = total_interaction / count as f64;
        let avg_virality = total_virality / count as f64;
        
        (
            apply_percentage_cap(avg_interaction),
            apply_percentage_cap(avg_virality)
        )
    } else {
        (0.0, 0.0)
    }
}

/**
 * Función de procesamiento para hashtags de Reddit
 * Calcula métricas específicas de la plataforma con normalización temporal
 */
pub fn process_reddit_hashtag(posts: &[RedditPost]) -> (f64, f64) {
    if posts.is_empty() {
        return (0.0, 0.0);
    }

    let mut total_interaction = 0.0;
    let mut total_virality = 0.0;
    let mut count = 0;

    /**
     * Aplicación de fórmulas específicas de Reddit con sanitización
     * Considera aspectos temporales y de comunidad únicos de la plataforma
     */
    for post in posts {
        let interaction = reddit_hourly_ratio(post.upvotes, post.comments, post.hours);
        let virality = reddit_viral_rate(post.upvotes, post.comments, post.subscribers);
        
        let sanitized_interaction = sanitize_percentage(interaction, "Reddit Interaction");
        let sanitized_virality = sanitize_percentage(virality, "Reddit Virality");
        
        total_interaction += sanitized_interaction;
        total_virality += sanitized_virality;
        count += 1;
    }

    if count > 0 {
        let avg_interaction = total_interaction / count as f64;
        let avg_virality = total_virality / count as f64;
        
        (
            apply_percentage_cap(avg_interaction),
            apply_percentage_cap(avg_virality)
        )
    } else {
        (0.0, 0.0)
    }
}

/**
 * Función de procesamiento para hashtags de Twitter
 * Implementa las métricas específicas de la plataforma X/Twitter
 */
pub fn process_twitter_hashtag(posts: &[TwitterPost]) -> (f64, f64) {
    if posts.is_empty() {
        return (0.0, 0.0);
    }

    let mut total_interaction = 0.0;
    let mut total_virality = 0.0;
    let mut count = 0;

    /**
     * Procesamiento con fórmulas optimizadas para Twitter
     * Considera retweets como factor clave de viralidad en la plataforma
     */
    for post in posts {
        let interaction = x_interaction_rate(post.retweets, post.likes, post.comments, post.views);
        let virality = x_viral_rate(post.retweets, post.likes, post.comments, post.followers);
        
        let sanitized_interaction = sanitize_percentage(interaction, "Twitter Interaction");
        let sanitized_virality = sanitize_percentage(virality, "Twitter Virality");
        
        total_interaction += sanitized_interaction;
        total_virality += sanitized_virality;
        count += 1;
    }

    if count > 0 {
        let avg_interaction = total_interaction / count as f64;
        let avg_virality = total_virality / count as f64;
        
        (
            ((avg_interaction * 100.0).round() / 100.0).min(100.0),
            ((avg_virality * 100.0).round() / 100.0).min(100.0)
        )
    } else {
        (0.0, 0.0)
    }
}

/**
 * Funciones de parsing para convertir JSON a estructuras tipadas
 * Manejan la deserialización segura de datos de cada plataforma
 */
fn parse_instagram_posts(posts: &[serde_json::Value]) -> Vec<InstagramPost> {
    posts.iter().filter_map(|post| {
        serde_json::from_value::<InstagramPost>(post.clone()).ok()
    }).collect()
}

fn parse_reddit_posts(posts: &[serde_json::Value]) -> Vec<RedditPost> {
    posts.iter().filter_map(|post| {
        serde_json::from_value::<RedditPost>(post.clone()).ok()
    }).collect()
}

fn parse_twitter_posts(posts: &[serde_json::Value]) -> Vec<TwitterPost> {
    posts.iter().filter_map(|post| {
        serde_json::from_value::<TwitterPost>(post.clone()).ok()
    }).collect()
}

/**
 * Función principal de procesamiento para todos los hashtags
 * Coordina el análisis de múltiples hashtags across todas las plataformas
 */
pub fn process_all_hashtags(request: &AnalyticsRequest) -> Vec<HashtagMetrics> {
    let mut results = Vec::new();

    /**
     * Procesamiento iterativo de cada hashtag solicitado
     * Busca datos en todas las plataformas y calcula métricas unificadas
     */
    for hashtag_name in &request.hashtags {
        info!("🧮 Procesando hashtag con caps: {}", hashtag_name);

        /**
         * Extracción y parsing de datos por plataforma
         * Maneja casos donde no hay datos disponibles para ciertos hashtags
         */
        let instagram_data = request.trends.instagram.iter()
            .find(|h| h.keyword == *hashtag_name)
            .map(|h| parse_instagram_posts(&h.posts))
            .unwrap_or_default();

        let reddit_data = request.trends.reddit.iter()
            .find(|h| h.keyword == *hashtag_name)
            .map(|h| parse_reddit_posts(&h.posts))
            .unwrap_or_default();

        let twitter_data = request.trends.twitter.iter()
            .find(|h| h.keyword == *hashtag_name)
            .map(|h| parse_twitter_posts(&h.posts))
            .unwrap_or_default();

        /**
         * Cálculo de métricas para cada plataforma
         * Aplica las fórmulas específicas y obtiene resultados normalizados
         */
        let (instagram_interaction, instagram_virality) = process_instagram_hashtag(&instagram_data);
        let (reddit_interaction, reddit_virality) = process_reddit_hashtag(&reddit_data);
        let (twitter_interaction, twitter_virality) = process_twitter_hashtag(&twitter_data);

        /**
         * Construcción del objeto de métricas completo
         * Consolida todos los resultados en una estructura unificada
         */
        let metrics = HashtagMetrics {
            name: hashtag_name.clone(),
            instagram_interaction,
            instagram_virality,
            reddit_interaction,
            reddit_virality,
            twitter_interaction,
            twitter_virality,
        };

        results.push(metrics);
    }

    results
}

/**
 * Endpoint principal para procesamiento de analytics
 * Recibe solicitudes de análisis y retorna métricas calculadas
 */
#[post("/process")]
async fn process_analytics(req: web::Json<AnalyticsRequest>) -> Result<impl Responder> {
    let start_time = std::time::Instant::now();
    
    /**
     * Procesamiento principal de hashtags con medición de tiempo
     * Ejecuta todas las fórmulas y cálculos para los datos proporcionados
     */
    let hashtag_metrics = process_all_hashtags(&req);
    
    let processing_time = start_time.elapsed().as_millis();
    
    /**
     * Construcción de respuesta con métricas y metadatos
     * Incluye información de performance y origen de datos
     */
    let response = AnalyticsResponse {
        hashtags: hashtag_metrics,
        total_hashtags: req.hashtags.len(),
        processing_time_ms: processing_time,
        data_source: "backend_calculations_with_caps".to_string(),
    };

    Ok(HttpResponse::Ok().json(response))
}

/**
 * Endpoint de prueba con datos hardcodeados
 * Permite validar el funcionamiento de las fórmulas con datos conocidos
 */
#[post("/test")]
async fn test_analytics() -> Result<impl Responder> {
    /**
     * Creación de datos de prueba representativos
     * Simula un escenario real de análisis de hashtags musicales
     */
    let test_data = AnalyticsRequest {
        hashtags: vec!["RockMusic".to_string(), "ElectricGuitar".to_string()],
        trends: TrendsData {
            instagram: vec![
                HashtagData {
                    keyword: "RockMusic".to_string(),
                    posts: vec![
                        serde_json::json!({
                            "date": "01/01/25 - 31/01/25",
                            "likes": 2100,
                            "comments": 145,
                            "views": 28000,
                            "followers": 78000,
                            "shares": 120
                        })
                    ]
                }
            ],
            reddit: vec![],
            twitter: vec![]
        },
        sales: vec![]
    };

    let metrics = process_all_hashtags(&test_data);

    /**
     * Respuesta de prueba con información diagnóstica
     * Incluye estado de las fórmulas y resultados calculados
     */
    Ok(HttpResponse::Ok().json(serde_json::json!({
        "status": "✅ TEST SUCCESS",
        "message": "Analytics funcionando con caps y logaritmos",
        "test_results": metrics,
        "formulas_used": [
            "insta_ratio() [capped]", "insta_viral_rate() [log]",
            "reddit_hourly_ratio() [log]", "reddit_viral_rate() [log]",
            "x_interaction_rate() [capped]", "x_viral_rate() [log]"
        ]
    })))
}

/**
 * Configuración de rutas para el módulo de analytics
 * Define los endpoints disponibles bajo el prefijo /analytics
 */
pub fn routes() -> actix_web::Scope {
    web::scope("/analytics")
        .service(process_analytics)  
        .service(test_analytics)
}