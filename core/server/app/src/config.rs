use crate::common::ApplicationConfig;
use derive_builder::Builder;
use lazy_static::lazy_static;
use serde::{Deserialize, Serialize};
use std::env;
use tracing::{Level, warn};

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub id: i32,
    pub exp: usize,
}

impl Claims {
    pub fn new(id: i32) -> Self {
        Self {
            id,
            exp: (chrono::Utc::now().timestamp() as usize) + Config::get_token_expiration(),
        }
    }
}

lazy_static! {
    pub static ref CONFIG: Config = {
        let mut config = ConfigBuilder::default().build().unwrap();

        config.mode = env::var("MODE").unwrap_or_else(|_| {
            warn!("MODE is not set, using default value: {}", config.mode);
            config.mode
        });

        config.port = env::var("PORT").unwrap_or_else(|_| {
            warn!("PORT is not set, using default value: {}", config.port);
            config.port
        });

        config.host = env::var("HOST").unwrap_or_else(|_| {
            warn!("HOST is not set, using default value: {}", config.host);
            config.host
        });

        config.secret_key = env::var("SECRET_KEY").unwrap_or_else(|_| {
            warn!(
                "SECRET_KEY is not set, using default value: {}",
                config.secret_key
            );
            config.secret_key
        });

        config
    };
}

#[derive(Builder, Debug)]
pub struct Config {
    #[builder(default = "Level::DEBUG")]
    pub max_level_log: Level,
    #[builder(default = "String::from(\"dev\")")]
    pub mode: String,
    #[builder(default = "String::from(\"8080\")")]
    pub port: String,
    #[builder(default = "String::from(\"0.0.0.0\")")]
    pub host: String,
    #[builder(default = "8")]
    pub max_pool_size: u32,
    #[builder(default = "true")]
    pub with_migrations: bool,
    #[builder(default = "String::from(\"secret\")")]
    pub secret_key: String,
    #[builder(default = "1296000")] // 15 days
    pub token_expiration: usize,
}

impl ApplicationConfig for Config {
    fn get_addrs() -> String {
        format!("{}:{}", CONFIG.host, CONFIG.port)
    }

    fn get_max_level_log() -> Level {
        CONFIG.max_level_log
    }

    fn get_mode() -> &'static str {
        &CONFIG.mode
    }

    fn get_port() -> &'static str {
        &CONFIG.port
    }

    fn get_host() -> &'static str {
        &CONFIG.host
    }

    fn get_max_pool_size() -> u32 {
        CONFIG.max_pool_size
    }

    fn get_with_migrations() -> bool {
        CONFIG.with_migrations
    }
}

impl Config {
    pub fn get_secret_key() -> &'static str {
        &CONFIG.secret_key
    }

    fn get_token_expiration() -> usize {
        CONFIG.token_expiration
    }
}
