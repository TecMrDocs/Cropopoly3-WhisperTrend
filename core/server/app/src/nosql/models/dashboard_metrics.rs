use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DashboardMetrics {
    pub pk: String,           // USER#{user_id}
    pub sk: String,           // DASHBOARD#{resource_id}
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
    pub fn new(user_id: i32, resource_id: i32) -> Self {
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

    pub fn update_data(mut self, data: serde_json::Value) -> Self {
        self.consolidated_data = data;
        self.last_updated = Utc::now();
        self
    }
}