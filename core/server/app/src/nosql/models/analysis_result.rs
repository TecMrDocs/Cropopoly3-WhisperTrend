use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

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