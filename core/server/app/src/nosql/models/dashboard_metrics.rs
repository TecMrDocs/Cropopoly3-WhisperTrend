/**
 * Modelo de Métricas de Dashboard para Cache NoSQL
 * 
 * Este archivo define la estructura para almacenar métricas consolidadas de dashboard
 * en DynamoDB, incluyendo datos analíticos, insights generados, recomendaciones
 * y resúmenes de rendimiento con versionado y seguimiento temporal.
 * 
 * Autor: Lucio Arturo Reyes Castillo
 */

use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

/**
 * Estructura principal para métricas consolidadas de dashboard
 * Almacena todos los datos necesarios para renderizar dashboards de análisis
 * con información de tendencias, insights y recomendaciones organizadas por usuario
 */
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DashboardMetrics {
    pub pk: String,           
    pub sk: String,           
    pub user_id: i32,
    pub resource_id: i32,
    pub consolidated_data: serde_json::Value,
    pub insights: Vec<serde_json::Value>,
    pub recommendations: Vec<String>,
    pub performance_summary: serde_json::Value,
    pub last_updated: DateTime<Utc>,
    pub version: String,
}

impl DashboardMetrics {
    /**
     * Constructor para crear nuevas métricas de dashboard
     * Inicializa la estructura con identificadores de usuario y recurso,
     * configurando claves de DynamoDB y valores por defecto para todos los campos
     * 
     * @param user_id Identificador del usuario propietario del dashboard
     * @param resource_id Identificador del recurso analizado
     * @return Nueva instancia de DashboardMetrics con configuración inicial
     */
    pub fn new(user_id: i32, resource_id: i32) -> Self {
        /**
         * Construcción de la estructura con configuración inicial completa
         * Establece claves de partición y ordenamiento para DynamoDB,
         * inicializa colecciones vacías y configura timestamp actual
         */
        Self {
            pk: format!("USER#{}", user_id),
            sk: format!("DASHBOARD#{}", resource_id),
            user_id,
            resource_id,
            consolidated_data: serde_json::json!({}),
            insights: vec![],
            recommendations: vec![],
            performance_summary: serde_json::json!({}),
            last_updated: Utc::now(),
            version: "1.0".to_string(),
        }
    }

    /**
     * Método para actualizar datos consolidados del dashboard
     * Reemplaza los datos existentes con nueva información y actualiza
     * el timestamp de modificación para seguimiento de cambios
     * 
     * @param data Nuevos datos consolidados en formato JSON
     * @return Instancia actualizada de DashboardMetrics con timestamp renovado
     */
    pub fn update_data(mut self, data: serde_json::Value) -> Self {
        /**
         * Actualización de datos con timestamp automático
         * Reemplaza el contenido consolidado y marca el momento
         * de la actualización para auditoría y cache invalidation
         */
        self.consolidated_data = data;
        self.last_updated = Utc::now();
        self
    }
}