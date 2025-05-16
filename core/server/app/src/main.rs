use actix_cors::Cors;
use actix_web::{App, HttpServer, middleware::Logger, web};
use common::{Application, Config, ConfigBuilder};
use database::Database;
use tracing::info;

mod common;
mod controllers;
mod database;
mod models;
mod schema;

struct AppServer;

impl Application for AppServer {
    async fn setup(&self, config: &Config) -> anyhow::Result<()> {
        Database::init(config.max_pool_size, config.with_migrations)
    }

    async fn create_server(&self, config: &Config) -> anyhow::Result<()> {
        info!("Starting the server...");
        let server = HttpServer::new(move || {
            App::new()
                .wrap(Cors::permissive().supports_credentials())
                .wrap(Logger::default())
                .service(web::scope("/api/v1")
                    .service(controllers::user::routes())
                )
        });

        info!("Listening on http://{}", config.get_addrs());
        server.bind(config.get_addrs())?.run().await?;

        Ok(())
    }
}

#[actix_web::main]
async fn main() -> anyhow::Result<()> {
    let mut config = ConfigBuilder::default().build()?;
    AppServer.start(&mut config).await
}
