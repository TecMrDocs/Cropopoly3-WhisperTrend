use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc, NaiveDate};

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