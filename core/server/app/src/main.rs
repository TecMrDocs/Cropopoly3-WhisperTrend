// core/server/app/src/main.rs
mod cache;
use crate::cache::OtpCache; // aqui importamos OtpCache que es un tipo de dato definido en cache.rs

use actix_cors::Cors;
use actix_web::{App, HttpServer, middleware::Logger, middleware::from_fn, web};
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
        // inicializamos el cache de OTP
        let otp_cache = OtpCache::new();
        let otp_cache_data = web::Data::new(otp_cache);   // wrap once
        let server = HttpServer::new(move || {
            App::new()
                .app_data(otp_cache_data.clone()) // Clonamos el cache para cada instancia de la app
                .wrap(Cors::permissive().supports_credentials())
                .wrap(Logger::default())
                .service(
                    web::scope("/api/v1")
                        .service(
                            web::scope("/auth")
                                .service(controllers::auth::register)
                                .service(controllers::auth::signin)  
                                .service(controllers::auth_mfa::verify_mfa)
                                .service(
                                    web::scope("/check")
                                        .wrap(from_fn(middlewares::auth))
                                        .service(controllers::auth::check),
                                ),
                        )
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
