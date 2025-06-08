use crate::common::ApplicationConfig;
use derive_builder::Builder;
use lazy_static::lazy_static;
use serde::{Deserialize, Serialize};
use std::env;
use tracing::{Level, warn};

/// JWT Claims structure containing user ID and expiration time
#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub id: i32,
    pub exp: usize,
}

impl Claims {
    /// Creates a new Claims instance with the given user ID and auto-calculated expiration
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

        // Load environment variables with fallback to default values
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

        // Optional browserless WebSocket URL for scraping
        match env::var("BROWSERLESS_WS") {
            Ok(value) => config.browserless_ws = Some(value),
            Err(_) => {
                warn!("BROWSERLESS_WS is not set, using default value: {:?}", config.browserless_ws);
                config.browserless_ws = None
            },
        }
        
        // Instagram credentials for scraping
        config.instagram_username = env::var("INSTAGRAM_USERNAME").unwrap_or_else(|_| {
            warn!("INSTAGRAM_USERNAME is not set, using default value: {}", config.instagram_username);
            config.instagram_username
        });

        config.instagram_password = env::var("INSTAGRAM_PASSWORD").unwrap_or_else(|_| {
            warn!("INSTAGRAM_PASSWORD is not set, using default value: {}", config.instagram_password);
            config.instagram_password
        });

        // Twitter credentials for scraping
        config.twitter_username = env::var("TWITTER_USERNAME").unwrap_or_else(|_| {
            warn!("TWITTER_USERNAME is not set, using default value: {}", config.twitter_username);
            config.twitter_username
        });

        config.twitter_password = env::var("TWITTER_PASSWORD").unwrap_or_else(|_| {
            warn!("TWITTER_PASSWORD is not set, using default value: {}", config.twitter_password);
            config.twitter_password
        });

        config
    };
}

/// Main application configuration structure with default values
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
    #[builder(default = "1296000")] // 15 days in seconds
    pub token_expiration: usize,
    #[builder(default = "None")]
    pub browserless_ws: Option<String>,
    #[builder(default = "5")]
    pub workers_scraper: i64,
    #[builder(default = "String::from(\"\")")]
    pub instagram_username: String,
    #[builder(default = "String::from(\"\")")]
    pub instagram_password: String,
    #[builder(default = "String::from(\"\")")]
    pub twitter_username: String,
    #[builder(default = "String::from(\"\")")]
    pub twitter_password: String,
}

/// Implementation of common application configuration interface
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

/// Additional configuration methods specific to this application
impl Config {
    /// Returns the JWT secret key for token signing/verification
    pub fn get_secret_key() -> &'static str {
        &CONFIG.secret_key
    }

    /// Returns token expiration time in seconds
    fn get_token_expiration() -> usize {
        CONFIG.token_expiration
    }

    /// Returns optional browserless WebSocket URL for headless browser operations
    pub fn get_browserless_ws() -> Option<&'static str> {
        CONFIG.browserless_ws.as_deref()
    }

    /// Returns number of scraper worker threads
    pub fn get_workers_scraper() -> i64 {
        CONFIG.workers_scraper
    }

    /// Returns Instagram username for scraping operations
    pub fn get_instagram_username() -> &'static str {
        &CONFIG.instagram_username
    }

    /// Returns Instagram password for scraping operations
    pub fn get_instagram_password() -> &'static str {
        &CONFIG.instagram_password
    }

    /// Returns Twitter username for scraping operations
    pub fn get_twitter_username() -> &'static str {
        &CONFIG.twitter_username
    }

    /// Returns Twitter password for scraping operations
    pub fn get_twitter_password() -> &'static str {
        &CONFIG.twitter_password
    }
}
