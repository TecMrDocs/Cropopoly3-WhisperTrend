use actix_web::{web, HttpResponse, Responder, get, post, Result};
use serde::{Deserialize, Serialize};
use crate::nosql::models::AnalysisResult;
use crate::nosql::client::get_client;
use aws_sdk_dynamodb::types::AttributeValue;
use std::collections::HashMap;
use tracing::{info, warn};

#[derive(Deserialize)]
pub struct AnalysisRequest {
    pub user_id: i32,
    pub resource_id: i32,
    pub hashtags: Vec<String>,
}

#[derive(Serialize)]
pub struct AnalysisResponse {
    pub analysis_id: String,
    pub status: String,
    pub message: String,
}

#[post("/start-analysis")]
pub async fn start_analysis(req: web::Json<AnalysisRequest>) -> Result<impl Responder> {
    info!("Starting new analysis for user: {}", req.user_id);
    
    let analysis = AnalysisResult::new(
        req.user_id,
        req.resource_id,
        req.hashtags.clone()
    );

    match save_analysis_result(&analysis).await {
        Ok(_) => {
            info!("Analysis {} started successfully", analysis.analysis_id);
            Ok(HttpResponse::Ok().json(AnalysisResponse {
                analysis_id: analysis.analysis_id,
                status: "processing".to_string(),
                message: "Analysis started successfully".to_string(),
            }))
        }
        Err(e) => {
            warn!("Failed to start analysis: {}", e);
            Ok(HttpResponse::InternalServerError().json(AnalysisResponse {
                analysis_id: "".to_string(),
                status: "error".to_string(),
                message: "Failed to start analysis".to_string(),
            }))
        }
    }
}

#[get("/status/{analysis_id}")]
pub async fn get_analysis_status(path: web::Path<String>) -> Result<impl Responder> {
    let analysis_id = path.into_inner();
    info!("Getting status for analysis: {}", analysis_id);

    match get_analysis_result(&analysis_id).await {
        Ok(Some(analysis)) => {
            Ok(HttpResponse::Ok().json(analysis))
        }
        Ok(None) => {
            Ok(HttpResponse::NotFound().json(serde_json::json!({
                "error": "Analysis not found"
            })))
        }
        Err(e) => {
            warn!("Failed to get analysis status: {}", e);
            Ok(HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Failed to get analysis status"
            })))
        }
    }
}

// Helper functions
async fn save_analysis_result(analysis: &AnalysisResult) -> anyhow::Result<()> {
    let client = get_client().await;
    let table_name = client.get_table_name("analysis_results");

    let mut item = HashMap::new();
    item.insert("pk".to_string(), AttributeValue::S(analysis.pk.clone()));
    item.insert("sk".to_string(), AttributeValue::S(analysis.sk.clone()));
    item.insert("analysis_id".to_string(), AttributeValue::S(analysis.analysis_id.clone()));
    item.insert("user_id".to_string(), AttributeValue::N(analysis.user_id.to_string()));
    item.insert("resource_id".to_string(), AttributeValue::N(analysis.resource_id.to_string()));
    item.insert("status".to_string(), AttributeValue::S(analysis.status.clone()));
    item.insert("created_at".to_string(), AttributeValue::S(analysis.created_at.to_rfc3339()));

    client.client
        .put_item()
        .table_name(table_name)
        .set_item(Some(item))
        .send()
        .await?;

    Ok(())
}

async fn get_analysis_result(analysis_id: &str) -> anyhow::Result<Option<AnalysisResult>> {
    let client = get_client().await;
    let table_name = client.get_table_name("analysis_results");

    let result = client.client
        .query()
        .table_name(table_name)
        .key_condition_expression("pk = :pk")
        .expression_attribute_values(":pk", AttributeValue::S(format!("ANALYSIS#{}", analysis_id)))
        .send()
        .await?;

    if let Some(items) = result.items {
        if let Some(item) = items.first() {
            // Aquí harías el parsing del item a AnalysisResult
            // Por simplicidad, devolvemos None por ahora
            return Ok(None);
        }
    }

    Ok(None)
}

pub fn routes() -> actix_web::Scope {
    web::scope("/analytics")
        .service(start_analysis)
        .service(get_analysis_status)
}