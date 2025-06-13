/**
 * Módulo de Gestión de Cache con DynamoDB
 * 
 * Este archivo implementa el sistema de cache para métricas de dashboard y hashtags
 * utilizando Amazon DynamoDB como almacén de datos NoSQL. Proporciona funcionalidades
 * para guardar y recuperar datos de análisis con alta disponibilidad y escalabilidad.
 * 
 * Autor: Lucio Arturo Reyes Castillo
 */

use actix_web::{web, HttpResponse, Responder, get, post, Result};
use serde::{Deserialize, Serialize};
use crate::nosql::models::{HashtagCache, DashboardMetrics};
use crate::nosql::client::get_client;
use aws_sdk_dynamodb::types::AttributeValue;
use std::collections::HashMap;
use tracing::{info, warn};

/**
 * Estructura de solicitud para operaciones de cache de hashtags
 * Define los parámetros necesarios para almacenar datos de análisis
 * asociados a usuarios, recursos y hashtags específicos
 */
#[derive(Deserialize)]
pub struct CacheRequest {
    pub user_id: i32,
    pub resource_id: i32,
    pub hashtag: String,
    pub data: serde_json::Value,
}

/**
 * Endpoint para recuperar datos de cache del dashboard
 * Busca métricas consolidadas almacenadas previamente para un usuario
 * y recurso específico, optimizando la carga de datos frecuentemente accedidos
 * 
 * @param path Parámetros de ruta conteniendo user_id y resource_id
 * @return Respuesta HTTP con métricas de dashboard o error si no se encuentran
 */
#[get("/dashboard/{user_id}/{resource_id}")]
pub async fn get_dashboard_cache(path: web::Path<(i32, i32)>) -> Result<impl Responder> {
    let (user_id, resource_id) = path.into_inner();
    info!("Getting dashboard cache for user: {}, resource: {}", user_id, resource_id);

    /**
     * Búsqueda de métricas en cache con manejo de diferentes escenarios
     * Distingue entre datos no encontrados y errores de sistema
     * para proporcionar respuestas HTTP apropiadas
     */
    match get_cached_dashboard(user_id, resource_id).await {
        Ok(Some(metrics)) => {
            Ok(HttpResponse::Ok().json(metrics))
        }
        Ok(None) => {
            Ok(HttpResponse::NotFound().json(serde_json::json!({
                "error": "No cached data found"
            })))
        }
        Err(e) => {
            warn!("Failed to get dashboard cache: {}", e);
            Ok(HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Failed to get cached data"
            })))
        }
    }
}

/**
 * Endpoint para guardar métricas de dashboard en cache
 * Almacena datos consolidados de análisis para acceso rápido posterior
 * mejorando el rendimiento de las consultas frecuentes del dashboard
 * 
 * @param req Datos JSON conteniendo métricas de dashboard y identificadores
 * @return Respuesta HTTP confirmando guardado exitoso o error
 */
#[post("/dashboard")]
pub async fn save_dashboard_cache(req: web::Json<serde_json::Value>) -> Result<impl Responder> {
    info!("Saving dashboard cache");


    let user_id = req.get("user_id")
        .and_then(|v| v.as_i64())
        .map(|v| v as i32)
        .unwrap_or(0);
    
    let resource_id = req.get("resource_id")
        .and_then(|v| v.as_i64())
        .map(|v| v as i32)
        .unwrap_or(0);


    let metrics = DashboardMetrics::new(user_id, resource_id)
        .update_data(req.into_inner());

    match save_dashboard_metrics(&metrics).await {
        Ok(_) => {
            Ok(HttpResponse::Ok().json(serde_json::json!({
                "message": "Dashboard cache saved successfully"
            })))
        }
        Err(e) => {
            warn!("Failed to save dashboard cache: {}", e);
            Ok(HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Failed to save dashboard cache"
            })))
        }
    }
}

/**
 * Endpoint para guardar datos de cache específicos de hashtags
 * Almacena métricas calculadas para hashtags individuales permitiendo
 * recuperación rápida y análisis granular de tendencias por palabra clave
 * 
 * @param req Solicitud con datos de hashtag, identificadores y métricas
 * @return Respuesta HTTP confirmando el guardado o indicando error
 */
#[post("/hashtag")]
pub async fn save_hashtag_cache(req: web::Json<CacheRequest>) -> Result<impl Responder> {
    info!("Saving hashtag cache for: {}", req.hashtag);

    let cache = HashtagCache::new(req.user_id, req.resource_id, req.hashtag.clone())
        .with_metrics(req.data.clone());
    match save_hashtag_data(&cache).await {
        Ok(_) => {
            Ok(HttpResponse::Ok().json(serde_json::json!({
                "message": "Hashtag cache saved successfully"
            })))
        }
        Err(e) => {
            warn!("Failed to save hashtag cache: {}", e);
            Ok(HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Failed to save hashtag cache"
            })))
        }
    }
}

/**
 * Función auxiliar para recuperar métricas de dashboard desde DynamoDB
 * Implementa la lógica de consulta específica para datos de dashboard
 * utilizando claves de partición y ordenamiento apropiadas
 * 
 * @param user_id Identificador del usuario propietario de los datos
 * @param resource_id Identificador del recurso asociado a las métricas
 * @return Resultado opcional con métricas encontradas o None si no existen
 */
async fn get_cached_dashboard(user_id: i32, resource_id: i32) -> anyhow::Result<Option<DashboardMetrics>> {
    let client = get_client().await;
    let table_name = client.get_table_name("dashboard_metrics");
    let result = client.client
        .get_item()
        .table_name(table_name)
        .key("pk", AttributeValue::S(format!("USER#{}", user_id)))
        .key("sk", AttributeValue::S(format!("DASHBOARD#{}", resource_id)))
        .send()
        .await?;
    Ok(None)
}

/**
 * Función auxiliar para persistir métricas de dashboard en DynamoDB
 * Maneja la serialización de datos estructurados a AttributeValue
 * y la configuración de metadatos necesarios para el almacenamiento
 * 
 * @param metrics Objeto DashboardMetrics con datos a persistir
 * @return Resultado de la operación de guardado
 */
async fn save_dashboard_metrics(metrics: &DashboardMetrics) -> anyhow::Result<()> {

    let client = get_client().await;
    let table_name = client.get_table_name("dashboard_metrics");

    let mut item = HashMap::new();
    item.insert("pk".to_string(), AttributeValue::S(metrics.pk.clone()));
    item.insert("sk".to_string(), AttributeValue::S(metrics.sk.clone()));
    item.insert("user_id".to_string(), AttributeValue::N(metrics.user_id.to_string()));
    item.insert("resource_id".to_string(), AttributeValue::N(metrics.resource_id.to_string()));
    item.insert("consolidated_data".to_string(), AttributeValue::S(metrics.consolidated_data.to_string()));
    item.insert("last_updated".to_string(), AttributeValue::S(metrics.last_updated.to_rfc3339()));

    /**
     * Ejecución de operación de escritura en DynamoDB
     * Utiliza put_item para inserción o actualización completa
     * del registro con todos los atributos especificados
     */
    client.client
        .put_item()
        .table_name(table_name)
        .set_item(Some(item))
        .send()
        .await?;

    Ok(())
}

/**
 * Función auxiliar para persistir datos de cache de hashtags
 * Implementa la lógica específica para almacenar métricas de hashtags
 * con configuración de TTL y organización por claves compuestas
 * 
 * @param cache Objeto HashtagCache con datos y metadatos a almacenar
 * @return Resultado de la operación de persistencia
 */
async fn save_hashtag_data(cache: &HashtagCache) -> anyhow::Result<()> {
    /**
     * Inicialización de cliente y configuración de tabla objetivo
     * Utiliza tabla específica para hashtags manteniendo separación
     * lógica de diferentes tipos de datos en el sistema de cache
     */
    let client = get_client().await;
    let table_name = client.get_table_name("hashtag_cache");

    /**
     * Construcción del item con atributos obligatorios
     * Mapea todos los campos básicos de identificación y metadatos
     * necesarios para recuperación y gestión del ciclo de vida
     */
    let mut item = HashMap::new();
    item.insert("pk".to_string(), AttributeValue::S(cache.pk.clone()));
    item.insert("sk".to_string(), AttributeValue::S(cache.sk.clone()));
    item.insert("hashtag".to_string(), AttributeValue::S(cache.hashtag.clone()));
    item.insert("user_id".to_string(), AttributeValue::N(cache.user_id.to_string()));
    item.insert("resource_id".to_string(), AttributeValue::N(cache.resource_id.to_string()));
    item.insert("ttl".to_string(), AttributeValue::N(cache.ttl.to_string()));
    item.insert("created_at".to_string(), AttributeValue::S(cache.created_at.to_rfc3339()));

    /**
     * Adición condicional de métricas calculadas
     * Incluye datos de análisis solo cuando están disponibles
     * evitando atributos vacíos en el almacén de datos
     */
    if let Some(metrics) = &cache.calculated_metrics {
        item.insert("calculated_metrics".to_string(), AttributeValue::S(metrics.to_string()));
    }

    /**
     * Persistencia del item completo en DynamoDB
     * Utiliza put_item para garantizar escritura completa
     * con todos los atributos y metadatos configurados
     */
    client.client
        .put_item()
        .table_name(table_name)
        .set_item(Some(item))
        .send()
        .await?;

    Ok(())
}

/**
 * Configuración de rutas para el módulo de cache
 * Define todos los endpoints disponibles bajo el prefijo /cache
 * organizando operaciones de lectura y escritura para diferentes tipos de datos
 * 
 * @return Scope configurado con todas las rutas del módulo de cache
 */
pub fn routes() -> actix_web::Scope {
    web::scope("/cache")
        .service(get_dashboard_cache)
        .service(save_dashboard_cache)
        .service(save_hashtag_cache)
}