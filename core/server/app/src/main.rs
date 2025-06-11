// src/main.rs

mod cache;
use crate::cache::OtpCache;

use actix_cors::Cors;
use actix_files as fs;
use actix_web::{App, HttpServer, middleware::Logger, web};
use common::{Application, ApplicationConfig};
use config::Config;
use database::Database;
use tracing::info;

// Test module
pub mod test;

// Internal modules
mod common;
mod config;
mod controllers;
mod database;
mod models;
mod schema;
mod middlewares;
mod scraping;
mod nosql;

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

        // Initialize the in-memory OTP cache for 2FA
        let otp_cache = OtpCache::new();
        let otp_cache_data = web::Data::new(otp_cache);

        let server = HttpServer::new(move || {
            App::new()
                // Make the OTP cache available to your auth handlers
                .app_data(otp_cache_data.clone())

                // CORS + logging
                .wrap(Cors::permissive().supports_credentials())
                .wrap(Logger::default())

                // All your API v1 endpoints
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
                        .service(controllers::analysis::routes())
                        .service(nosql::routes())
                        .service(controllers::email::routes())
                )

                // Static file serving
                .service(
                    web::scope("")
                        .service(
                            fs::Files::new(
                                "/",
                                if Config::get_mode() == "prod" {
                                    "/usr/local/bin/web"
                                } else {
                                    "../../page/"
                                },
                            )
                            .show_files_listing()
                            .index_file("index.html"),
                        ),
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
