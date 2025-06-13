/**
 * Modelo de Cache de Hashtags para Almacenamiento Temporal
 * 
 * Este archivo define la estructura para cache temporal de datos de hashtags
 * por plataforma social en DynamoDB. Incluye datos de Instagram, Reddit y Twitter
 * con métricas calculadas, TTL automático y gestión de ciclo de vida del cache.
 * 
 * Autor: Lucio Arturo Reyes Castillo
 * Contributor: Especialistas en optimización de cache
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

impl HashtagCache {
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
    pub fn new(user_id: i32, resource_id: i32, hashtag: String) -> Self {
        let now = Utc::now();
        
        /**
         * Configuración de TTL para expiración automática
         * Establece tiempo de vida de 24 horas (86400 segundos)
         * para balance entre rendimiento y actualidad de datos
         */
        let ttl = now.timestamp() + (24 * 60 * 60); 

        /**
         * Construcción de la estructura con claves de DynamoDB optimizadas
         * Incluye timestamp en sort key para ordenación cronológica
         * y configuración inicial de todos los campos opcionales
         */
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

    /**
     * Método builder para agregar datos de plataformas sociales
     * Permite configurar datos de Instagram, Reddit y Twitter de forma opcional
     * usando patrón fluent interface para construcción flexible del cache
     * 
     * @param instagram Datos opcionales de Instagram en formato JSON
     * @param reddit Datos opcionales de Reddit en formato JSON  
     * @param twitter Datos opcionales de Twitter en formato JSON
     * @return Instancia actualizada con datos de plataformas configurados
     */
    pub fn with_data(
        mut self,
        instagram: Option<serde_json::Value>,
        reddit: Option<serde_json::Value>,
        twitter: Option<serde_json::Value>,
    ) -> Self {
        /**
         * Asignación de datos por plataforma con manejo de opcionales
         * Permite cache parcial cuando no todas las plataformas
         * tienen datos disponibles para el hashtag específico
         */
        self.instagram_data = instagram;
        self.reddit_data = reddit;
        self.twitter_data = twitter;
        self
    }

    /**
     * Método builder para agregar métricas calculadas
     * Almacena resultados de análisis procesados evitando recálculos
     * costosos en consultas posteriores del mismo hashtag
     * 
     * @param metrics Métricas calculadas en formato JSON
     * @return Instancia actualizada con métricas de análisis incluidas
     */
    pub fn with_metrics(mut self, metrics: serde_json::Value) -> Self {
        /**
         * Configuración de métricas calculadas para cache hit
         * Permite reutilización de cálculos complejos de engagement,
         * viralidad y otras métricas derivadas sin reprocesamiento
         */
        self.calculated_metrics = Some(metrics);
        self
    }
}