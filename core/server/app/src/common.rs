use derive_builder::Builder;
use std::env;
use tracing::{Level, warn};
use tracing_subscriber;

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
}

impl Config {
    pub fn get_addrs(&self) -> String {
        format!("{}:{}", self.host, self.port)
    }
}

pub trait Application {
    fn initialize_logging(&self, config: &Config) -> anyhow::Result<()> {
        env_logger::init();

        let subscriber = tracing_subscriber::fmt()
            .with_max_level(config.max_level_log)
            .with_span_events(tracing_subscriber::fmt::format::FmtSpan::CLOSE)
            .finish();

        tracing::subscriber::set_global_default(subscriber)?;
        Ok(())
    }

    fn load_env(&self, config: &mut Config) -> anyhow::Result<()> {
        dotenv::dotenv().ok();

        config.mode = env::var("MODE").unwrap_or_else(|_| {
            warn!("MODE is not set, using default value: {}", config.mode);
            config.mode.clone()
        });

        config.port = env::var("PORT").unwrap_or_else(|_| {
            warn!("PORT is not set, using default value: {}", config.port);
            config.port.clone()
        });

        config.host = env::var("HOST").unwrap_or_else(|_| {
            warn!("HOST is not set, using default value: {}", config.host);
            config.host.clone()
        });

        Ok(())
    }

    fn initialize(&self, config: &Config) -> anyhow::Result<()> {
        self.initialize_logging(config)
    }

    fn connect(&self, _config: &Config) -> anyhow::Result<()> {
        Ok(())
    }

    async fn create_server(&self, config: &Config) -> anyhow::Result<()>;

    async fn start(&self, config: &mut Config) -> anyhow::Result<()> {
        self.load_env(config)?;
        self.initialize(config)?;
        self.connect(config)?;
        self.create_server(config).await
    }
}
