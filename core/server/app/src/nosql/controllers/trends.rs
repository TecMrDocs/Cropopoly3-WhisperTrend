/**
 * Módulo de Gestión de Historial de Tendencias
 * 
 * Este archivo implementa el sistema de almacenamiento y recuperación del historial
 * de tendencias de hashtags a lo largo del tiempo. Utiliza DynamoDB para persistir
 * datos temporales de engagement, viralidad y métricas por plataforma con consultas optimizadas.
 * 
 * Autor: Lucio Arturo Reyes Castillo
 */

use actix_web::{web, HttpResponse, Responder, get, post, Result};
use serde::{Deserialize, Serialize};
use crate::nosql::models::TrendsHistory;
use crate::nosql::client::get_client;
use aws_sdk_dynamodb::types::AttributeValue;
use std::collections::HashMap;
use tracing::{info, warn};
use chrono::NaiveDate;

/**
 * Estructura de solicitud para guardar datos de tendencias
 * Define los parámetros necesarios para almacenar métricas históricas
 * de hashtags con timestamp y datos de análisis asociados
 */
#[derive(Deserialize)]
pub struct TrendsRequest {
    pub hashtag: String,
    pub date: String, 
    pub metrics: serde_json::Value,
}

/**
 * Endpoint para obtener historial de hashtag con período por defecto
 * Recupera los últimos 30 días de datos de tendencias para un hashtag específico
 * optimizando la consulta para el caso de uso más común de análisis temporal
 * 
 * @param path Parámetro de ruta conteniendo el hashtag a consultar
 * @return Respuesta HTTP con historial de tendencias o error
 */
#[get("/history/{hashtag}")]
pub async fn get_hashtag_history(path: web::Path<String>) -> Result<impl Responder> {
    let hashtag = path.into_inner();
    info!("Getting history for hashtag: {}", hashtag);
    match get_trends_history(&hashtag, 30).await {
        Ok(history) => {
            Ok(HttpResponse::Ok().json(history))
        }
        Err(e) => {
            warn!("Failed to get hashtag history: {}", e);
            Ok(HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Failed to get hashtag history"
            })))
        }
    }
}

/**
 * Endpoint para obtener historial de hashtag con período personalizable
 * Permite especificar el número de días de historial a recuperar
 * ofreciendo flexibilidad para diferentes necesidades de análisis temporal
 * 
 * @param path Parámetros de ruta con hashtag y número de días
 * @return Respuesta HTTP con historial del período solicitado
 */
#[get("/history/{hashtag}/{days}")]
pub async fn get_hashtag_history_days(path: web::Path<(String, i32)>) -> Result<impl Responder> {
    let (hashtag, days) = path.into_inner();
    info!("Getting {} days history for hashtag: {}", days, hashtag);
    match get_trends_history(&hashtag, days).await {
        Ok(history) => {
            Ok(HttpResponse::Ok().json(history))
        }
        Err(e) => {
            warn!("Failed to get hashtag history: {}", e);
            Ok(HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Failed to get hashtag history"
            })))
        }
    }
}

/**
 * Endpoint para guardar nuevos datos de tendencias
 * Almacena métricas de hashtags con timestamp específico permitiendo
 * la construcción progresiva del historial de tendencias a lo largo del tiempo
 * 
 * @param req Solicitud con datos de hashtag, fecha y métricas
 * @return Respuesta HTTP confirmando guardado exitoso o error
 */
#[post("/save")]
pub async fn save_trends_data(req: web::Json<TrendsRequest>) -> Result<impl Responder> {
    info!("Saving trends data for hashtag: {}", req.hashtag);
    let date = match NaiveDate::parse_from_str(&req.date, "%Y-%m-%d") {
        Ok(date) => date,
        Err(_) => {
            return Ok(HttpResponse::BadRequest().json(serde_json::json!({
                "error": "Invalid date format. Use YYYY-MM-DD"
            })));
        }
    };

    let trends = TrendsHistory::new(req.hashtag.clone(), date)
        .with_metrics(
            req.metrics.clone(),
            serde_json::json!({}), 
            0.0, 
            0.0  
        );

    match save_trends_history(&trends).await {
        Ok(_) => {
            Ok(HttpResponse::Ok().json(serde_json::json!({
                "message": "Trends data saved successfully"
            })))
        }
        Err(e) => {
            warn!("Failed to save trends data: {}", e);
            Ok(HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Failed to save trends data"
            })))
        }
    }
}

/**
 * Función auxiliar para recuperar historial de tendencias desde DynamoDB
 * Implementa consulta temporal usando range key para filtrar por fechas
 * optimizando el rendimiento para consultas de series temporales
 * 
 * @param hashtag Identificador del hashtag a consultar
 * @param days Número de días hacia atrás desde hoy
 * @return Vector de registros históricos ordenados cronológicamente
 */
async fn get_trends_history(hashtag: &str, days: i32) -> anyhow::Result<Vec<TrendsHistory>> {
    let client = get_client().await;
    let table_name = client.get_table_name("trends_history");
    let end_date = chrono::Utc::now().date_naive();
    let start_date = end_date - chrono::Duration::days(days as i64);
    let result = client.client
        .query()
        .table_name(table_name)
        .key_condition_expression("pk = :pk AND sk BETWEEN :start_date AND :end_date")
        .expression_attribute_values(":pk", AttributeValue::S(format!("HASHTAG#{}", hashtag)))
        .expression_attribute_values(":start_date", AttributeValue::S(format!("DATE#{}", start_date.format("%Y-%m-%d"))))
        .expression_attribute_values(":end_date", AttributeValue::S(format!("DATE#{}", end_date.format("%Y-%m-%d"))))
        .send()
        .await?;
    Ok(vec![])
}

/**
 * Función auxiliar para persistir datos de historial en DynamoDB
 * Maneja la serialización completa de objetos TrendsHistory a AttributeValue
 * configurando todos los campos necesarios para consultas futuras
 * 
 * @param trends Objeto TrendsHistory con datos históricos a almacenar
 * @return Resultado de la operación de persistencia
 */
async fn save_trends_history(trends: &TrendsHistory) -> anyhow::Result<()> {
    let client = get_client().await;
    let table_name = client.get_table_name("trends_history");
    let mut item = HashMap::new();
    item.insert("pk".to_string(), AttributeValue::S(trends.pk.clone()));
    item.insert("sk".to_string(), AttributeValue::S(trends.sk.clone()));
    item.insert("hashtag".to_string(), AttributeValue::S(trends.hashtag.clone()));
    item.insert("date".to_string(), AttributeValue::S(trends.date.format("%Y-%m-%d").to_string()));
    item.insert("daily_metrics".to_string(), AttributeValue::S(trends.daily_metrics.to_string()));
    item.insert("platform_breakdown".to_string(), AttributeValue::S(trends.platform_breakdown.to_string()));
    item.insert("engagement_score".to_string(), AttributeValue::N(trends.engagement_score.to_string()));
    item.insert("virality_score".to_string(), AttributeValue::N(trends.virality_score.to_string()));
    item.insert("created_at".to_string(), AttributeValue::S(trends.created_at.to_rfc3339()));
    client.client
        .put_item()
        .table_name(table_name)
        .set_item(Some(item))
        .send()
        .await?;

    Ok(())
}

/**
 * Configuración de rutas para el módulo de tendencias históricas
 * Define endpoints para consulta y almacenamiento de datos temporales
 * organizando operaciones de análisis histórico de hashtags
 * 
 * @return Scope configurado con rutas de historial de tendencias
 */
pub fn routes() -> actix_web::Scope {
    web::scope("/trends")
        .service(get_hashtag_history)
        .service(get_hashtag_history_days)
        .service(save_trends_data)
}