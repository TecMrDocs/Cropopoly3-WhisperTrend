use aws_config::BehaviorVersion;
use aws_sdk_dynamodb::Client;
use std::env;
use tracing::{info, warn};

pub struct DynamoClient {
    pub client: Client,
}

impl DynamoClient {
    pub async fn new() -> Self {
        let config = match env::var("DYNAMODB_ENDPOINT") {
            Ok(endpoint) => {
                info!("Using local DynamoDB endpoint: {}", endpoint);
                aws_config::defaults(BehaviorVersion::latest())
                    .endpoint_url(endpoint)
                    .load()
                    .await
            }
            Err(_) => {
                info!("Using AWS DynamoDB");
                aws_config::load_defaults(BehaviorVersion::latest()).await
            }
        };

        let client = Client::new(&config);
        Self { client }
    }

    pub fn get_table_name(&self, base_name: &str) -> String {
        let prefix = env::var("DYNAMODB_TABLE_PREFIX").unwrap_or_else(|_| "trendhash_".to_string());
        format!("{}{}", prefix, base_name)
    }
}