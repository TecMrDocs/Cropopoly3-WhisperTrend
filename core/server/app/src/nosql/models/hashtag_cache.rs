use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HashtagCache {
    pub pk: String,           // USER#{user_id}
    pub sk: String,           // HASHTAG#{hashtag}#{timestamp}
    pub hashtag: String,
    pub user_id: i32,
    pub resource_id: i32,
    pub instagram_data: Option<serde_json::Value>,
    pub reddit_data: Option<serde_json::Value>,
    pub twitter_data: Option<serde_json::Value>,
    pub calculated_metrics: Option<serde_json::Value>,
    pub created_at: DateTime<Utc>,
    pub ttl: i64,             // TTL para auto-delete
}

impl HashtagCache {
    pub fn new(user_id: i32, resource_id: i32, hashtag: String) -> Self {
        let now = Utc::now();
        let ttl = now.timestamp() + (24 * 60 * 60); // 24 horas

        Self {
            pk: format!("USER#{}", user_id),
            sk: format!("HASHTAG#{}#{}", hashtag, now.timestamp()),
            hashtag,
            user_id,
            resource_id,
            instagram_data: None,
            reddit_data: None,
            twitter_data: None,
            calculated_metrics: None,
            created_at: now,
            ttl,
        }
    }

    pub fn with_data(
        mut self,
        instagram: Option<serde_json::Value>,
        reddit: Option<serde_json::Value>,
        twitter: Option<serde_json::Value>,
    ) -> Self {
        self.instagram_data = instagram;
        self.reddit_data = reddit;
        self.twitter_data = twitter;
        self
    }

    pub fn with_metrics(mut self, metrics: serde_json::Value) -> Self {
        self.calculated_metrics = Some(metrics);
        self
    }
}