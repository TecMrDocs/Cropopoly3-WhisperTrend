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
    pub fn new(hashtag: String, date: NaiveDate) -> Self {

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
    pub fn with_metrics(
        mut self, 
        metrics: serde_json::Value,
        breakdown: serde_json::Value,
        engagement: f64,
        virality: f64
    ) -> Self {

        self.daily_metrics = metrics;
        self.platform_breakdown = breakdown;
        self.engagement_score = engagement;
        self.virality_score = virality;
        self
    }
}