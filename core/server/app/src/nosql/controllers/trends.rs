use actix_web::{web, HttpResponse, Responder, get, post, Result};
use serde::{Deserialize, Serialize};
use crate::nosql::models::TrendsHistory;
use crate::nosql::client::get_client;
use aws_sdk_dynamodb::types::AttributeValue;
use std::collections::HashMap;
use tracing::{info, warn};
use chrono::NaiveDate;

#[derive(Deserialize)]
pub struct TrendsRequest {
    pub hashtag: String,
    pub date: String, 
    pub metrics: serde_json::Value,
}

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

pub fn routes() -> actix_web::Scope {
    web::scope("/trends")
        .service(get_hashtag_history)
        .service(get_hashtag_history_days)
        .service(save_trends_data)
}
