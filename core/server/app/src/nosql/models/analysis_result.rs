/**
 * Modelo de Resultado de Análisis para Almacenamiento NoSQL
 * 
 * Este archivo define la estructura principal para almacenar resultados de análisis
 * de tendencias y correlaciones en DynamoDB. Incluye metadatos de procesamiento,
 * datos de hashtags analizados y insights generados por IA con seguimiento temporal.
 * 
 * Autor: Lucio Arturo Reyes Castillo
 */

use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

/**
 * Estructura principal para resultados de análisis de tendencias
 * Representa un análisis completo con todos sus metadatos, datos procesados
 * y resultados de IA, diseñada para almacenamiento eficiente en DynamoDB
 */
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnalysisResult {
    pub pk: String,           
    pub sk: String,           
    pub analysis_id: String,
    pub user_id: i32,
    pub resource_id: i32,
    pub hashtags_analyzed: Vec<String>,
    pub trends_data: serde_json::Value,
    pub correlation_data: serde_json::Value,
    pub ai_insights: Option<String>,
    pub status: String,       
    pub created_at: DateTime<Utc>,
    pub completed_at: Option<DateTime<Utc>>,
}

/*
 * Constructor para crear un nuevo resultado de análisis
 * Inicializa la estructura con identificadores únicos, timestamps
 * y estado inicial de procesamiento para seguimiento del progreso
 * 
 * @param user_id Identificador del usuario propietario del análisis
 * @param resource_id Identificador del recurso analizado
 * @param hashtags Vector de hashtags incluidos en el análisis
 * @return Nueva instancia de AnalysisResult con datos inicializados
 */
impl AnalysisResult {

    pub fn new(user_id: i32, resource_id: i32, hashtags: Vec<String>) -> Self {
        let analysis_id = uuid::Uuid::new_v4().to_string();
        let now = Utc::now();
        Self {
            pk: format!("ANALYSIS#{}", analysis_id),
            sk: format!("RESULT#{}", now.timestamp()),
            analysis_id,
            user_id,
            resource_id,
            hashtags_analyzed: hashtags,
            trends_data: serde_json::json!({}),
            correlation_data: serde_json::json!({}),
            ai_insights: None,
            status: "processing".to_string(),
            created_at: now,
            completed_at: None,
        }
    }
}