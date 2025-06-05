use actix_cors::Cors;
use actix_web::{App, HttpServer, middleware::Logger, web};
use common::{Application, ApplicationConfig};
use config::Config;
use database::Database;
use tracing::info;
pub mod test;


mod common;
mod config;
mod controllers;
mod database;
mod models;
mod schema;
mod middlewares;
mod scraping;

struct AppServer;

impl Application for AppServer {
    async fn setup(&self) -> anyhow::Result<()> {
        info!("Initializing the database...");
        Database::init(Config::get_max_pool_size(), Config::get_with_migrations())?;
        info!("Migrations applied successfully");

        Ok(())
    }

    async fn create_server(&self) -> anyhow::Result<()> {
        info!("Starting the server...");
        let server = HttpServer::new(move || {
            App::new()
                .wrap(Cors::permissive().supports_credentials())
                .wrap(Logger::default())
                .service(
                    web::scope("/api/v1")
                        .service(controllers::auth::routes())
                        .service(controllers::web::routes())
                        .service(controllers::chat::routes())
                        .service(controllers::recurso::routes())
                        .service(controllers::user::routes())
                        .service(controllers::sale::routes())
                        .service(controllers::admin::routes())
                        .service(controllers::flow::routes())
                )
        });

        info!("Listening on http://{}", Config::get_addrs());
        server.bind(Config::get_addrs())?.run().await?;

        Ok(())
    }
}

#[actix_web::main]
async fn main() -> anyhow::Result<()> {
    AppServer.start().await
}
