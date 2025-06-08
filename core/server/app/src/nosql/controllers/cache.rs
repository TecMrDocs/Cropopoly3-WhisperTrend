use actix_web::{web, HttpResponse, Responder, get, post, Result};
use serde::{Deserialize, Serialize};
use crate::nosql::models::{HashtagCache, DashboardMetrics};
use crate::nosql::client::get_client;
use aws_sdk_dynamodb::types::AttributeValue;
use std::collections::HashMap;
use tracing::{info, warn};

#[derive(Deserialize)]
pub struct CacheRequest {
    pub user_id: i32,
    pub resource_id: i32,
    pub hashtag: String,
    pub data: serde_json::Value,
}

#[get("/dashboard/{user_id}/{resource_id}")]
pub async fn get_dashboard_cache(path: web::Path<(i32, i32)>) -> Result<impl Responder> {
    let (user_id, resource_id) = path.into_inner();
    info!("Getting dashboard cache for user: {}, resource: {}", user_id, resource_id);

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

#[post("/dashboard")]
pub async fn save_dashboard_cache(req: web::Json<serde_json::Value>) -> Result<impl Responder> {
    info!("Saving dashboard cache");

    // Extraer user_id y resource_id del JSON
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

    client.client
        .put_item()
        .table_name(table_name)
        .set_item(Some(item))
        .send()
        .await?;

    Ok(())
}

async fn save_hashtag_data(cache: &HashtagCache) -> anyhow::Result<()> {
    let client = get_client().await;
    let table_name = client.get_table_name("hashtag_cache");

    let mut item = HashMap::new();
    item.insert("pk".to_string(), AttributeValue::S(cache.pk.clone()));
    item.insert("sk".to_string(), AttributeValue::S(cache.sk.clone()));
    item.insert("hashtag".to_string(), AttributeValue::S(cache.hashtag.clone()));
    item.insert("user_id".to_string(), AttributeValue::N(cache.user_id.to_string()));
    item.insert("resource_id".to_string(), AttributeValue::N(cache.resource_id.to_string()));
    item.insert("ttl".to_string(), AttributeValue::N(cache.ttl.to_string()));
    item.insert("created_at".to_string(), AttributeValue::S(cache.created_at.to_rfc3339()));

    if let Some(metrics) = &cache.calculated_metrics {
        item.insert("calculated_metrics".to_string(), AttributeValue::S(metrics.to_string()));
    }

    client.client
        .put_item()
        .table_name(table_name)
        .set_item(Some(item))
        .send()
        .await?;

    Ok(())
}

pub fn routes() -> actix_web::Scope {
    web::scope("/cache")
        .service(get_dashboard_cache)
        .service(save_dashboard_cache)
        .service(save_hashtag_cache)
}