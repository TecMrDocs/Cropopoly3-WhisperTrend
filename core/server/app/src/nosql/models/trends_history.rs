/**
 * Modelo de Historial de Tendencias Temporales
 * 
 * Este archivo define la estructura para almacenar datos históricos de hashtags
 * organizados por fecha en DynamoDB. Incluye métricas diarias, desglose por plataforma
 * y scores de engagement/viralidad para análisis de tendencias temporales.
 * 
 * Autor: Lucio Arturo Reyes Castillo

 */

use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc, NaiveDate};

/**
 * Estructura principal para historial de tendencias de hashtags
 * Almacena datos temporales organizados por hashtag y fecha para análisis
 * de evolución de métricas y patrones de engagement a lo largo del tiempo
 */
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TrendsHistory {
    pub pk: String,           
    pub sk: String,           
    pub hashtag: String,
    pub date: NaiveDate,
    pub daily_metrics: serde_json::Value,
    pub platform_breakdown: serde_json::Value,
    pub engagement_score: f64,
    pub virality_score: f64,
    pub created_at: DateTime<Utc>,
}

impl TrendsHistory {
    /**
     * Constructor para crear nuevo registro de historial de tendencias
     * Inicializa la estructura con hashtag y fecha específica, configurando
     * claves de DynamoDB optimizadas para consultas de rango temporal
     * 
     * @param hashtag Hashtag del cual se almacena el historial
     * @param date Fecha específica del registro histórico
     * @return Nueva instancia de TrendsHistory con configuración inicial
     */
    pub fn new(hashtag: String, date: NaiveDate) -> Self {
        /**
         * Construcción de la estructura con claves de DynamoDB optimizadas
         * Utiliza partition key por hashtag y sort key por fecha
         * permitiendo consultas eficientes de rangos temporales específicos
         */
        Self {
            pk: format!("HASHTAG#{}", hashtag),
            sk: format!("DATE#{}", date.format("%Y-%m-%d")),
            hashtag,
            date,
            daily_metrics: serde_json::json!({}),
            platform_breakdown: serde_json::json!({}),
            engagement_score: 0.0,
            virality_score: 0.0,
            created_at: Utc::now(),
        }
    }

    /**
     * Método builder para configurar métricas y scores del historial
     * Permite asignar datos de análisis, desglose por plataforma y scores
     * calculados usando patrón fluent interface para construcción flexible
     * 
     * @param metrics Métricas diarias consolidadas en formato JSON
     * @param breakdown Desglose de datos por plataforma social
     * @param engagement Score de engagement calculado para el día
     * @param virality Score de viralidad calculado para el día
     * @return Instancia actualizada con todas las métricas configuradas
     */
    pub fn with_metrics(
        mut self, 
        metrics: serde_json::Value,
        breakdown: serde_json::Value,
        engagement: f64,
        virality: f64
    ) -> Self {
        /**
         * Asignación completa de métricas y scores calculados
         * Configura todos los datos de análisis temporal incluyendo
         * desglose detallado por plataforma y scores normalizados
         */
        self.daily_metrics = metrics;
        self.platform_breakdown = breakdown;
        self.engagement_score = engagement;
        self.virality_score = virality;
        self
    }
}