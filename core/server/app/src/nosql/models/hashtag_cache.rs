/**
 * Modelo de Cache de Hashtags para Almacenamiento Temporal
 * 
 * Este archivo define la estructura para cache temporal de datos de hashtags
 * por plataforma social en DynamoDB. Incluye datos de Instagram, Reddit y Twitter
 * con métricas calculadas, TTL automático y gestión de ciclo de vida del cache.
 * 
 * Autor: Lucio Arturo Reyes Castillo
 */

use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use uuid::Uuid;

/**
 * Estructura principal para cache temporal de datos de hashtags
 * Almacena información de múltiples plataformas sociales con expiración automática
 * optimizando el rendimiento de consultas repetitivas de análisis de tendencias
 */
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HashtagCache {
    pub pk: String,           
    pub sk: String,           
    pub hashtag: String,
    pub user_id: i32,
    pub resource_id: i32,
    pub instagram_data: Option<serde_json::Value>,
    pub reddit_data: Option<serde_json::Value>,
    pub twitter_data: Option<serde_json::Value>,
    pub calculated_metrics: Option<serde_json::Value>,
    pub created_at: DateTime<Utc>,
    pub ttl: i64,             
}

/**
 * Constructor para crear nuevo cache de hashtag
 * Inicializa la estructura con identificadores de usuario y recurso,
 * configurando TTL de 24 horas y timestamp de creación para gestión automática
 * 
 * @param user_id Identificador del usuario propietario del cache
 * @param resource_id Identificador del recurso asociado
 * @param hashtag Hashtag a cachear con sus datos de plataformas
 * @return Nueva instancia de HashtagCache con configuración inicial
 */

impl HashtagCache {

    pub fn new(user_id: i32, resource_id: i32, hashtag: String) -> Self {
        let now = Utc::now();
        let ttl = now.timestamp() + (24 * 60 * 60); 
        Self {
            pk: format!("USER#{}", user_id),
            sk: format!("HASHTAG#{}#{}", hashtag, now.timestamp()),
            hashtag,
            user_id,
            resource_id,
            instagram_data: None,
            reddit_data: None,
            twitter_data: None,
            calculated_metrics: None,
            created_at: now,
            ttl,
        }
    }
    pub fn with_data(
        mut self,
        instagram: Option<serde_json::Value>,
        reddit: Option<serde_json::Value>,
        twitter: Option<serde_json::Value>,
    ) -> Self {
        self.instagram_data = instagram;
        self.reddit_data = reddit;
        self.twitter_data = twitter;
        self
    }

    pub fn with_metrics(mut self, metrics: serde_json::Value) -> Self {
        self.calculated_metrics = Some(metrics);
        self
    }
}