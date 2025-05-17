use crate::config::Config;
use tracing::Level;
use tracing_subscriber;

#[allow(dead_code)]
pub trait ApplicationConfig {
    fn get_addrs() -> String;

    fn get_max_level_log() -> Level;

    fn get_mode() -> &'static str;

    fn get_port() -> &'static str;

    fn get_host() -> &'static str;

    fn get_max_pool_size() -> u32;

    fn get_with_migrations() -> bool;
}

pub trait Application {
    fn initialize_logging(&self) -> anyhow::Result<()> {
        env_logger::init();

        let subscriber = tracing_subscriber::fmt()
            .with_max_level(Config::get_max_level_log())
            .with_span_events(tracing_subscriber::fmt::format::FmtSpan::CLOSE)
            .finish();

        tracing::subscriber::set_global_default(subscriber)?;
        Ok(())
    }

    fn initialize(&self) -> anyhow::Result<()> {
        self.initialize_logging()
    }

    async fn setup(&self) -> anyhow::Result<()>;

    async fn create_server(&self) -> anyhow::Result<()>;

    async fn start(&self) -> anyhow::Result<()> {
        dotenv::dotenv().ok();
        self.initialize()?;
        self.setup().await?;
        self.create_server().await
    }
}
