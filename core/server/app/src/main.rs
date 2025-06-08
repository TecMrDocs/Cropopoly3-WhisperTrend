mod cache;                      // OTP cache module
use crate::cache::OtpCache;     // Tipo de cache para OTP

use actix_cors::Cors;           // CORS middleware
use actix_files as fs;          // Servir archivos estáticos
use actix_web::{               // Actix Web core
    App, 
    HttpServer, 
    middleware::{Logger, from_fn}, 
    web
};
use common::{Application, ApplicationConfig}; // Trait común de aplicación
use config::Config;            // Configuración de la aplicación
use database::Database;        // Inicialización de base de datos
use tracing::info;             // Logging estructurado

// Módulo de pruebas
pub mod test;

// Módulos internos de la aplicación
mod common;
mod config;
mod controllers;
mod database;
mod models;
mod schema;
mod middlewares;
mod scraping;
// mod nosql; // Rutas NoSQL opcionales

/// Estructura principal del servidor de la aplicación
struct AppServer;

impl Application for AppServer {
    /// Setup method to initialize the application
    /// - Inicializa la base de datos con pool y migraciones
    async fn setup(&self) -> anyhow::Result<()> {
        info!("Initializing the database...");
        Database::init(
            Config::get_max_pool_size(), 
            Config::get_with_migrations()
        )?;
        info!("Migrations applied successfully");
        Ok(())
    }

    /// Create and configure the HTTP server
    /// - Configura middlewares, CORS, logging y rutas
    async fn create_server(&self) -> anyhow::Result<()> {
        info!("Starting the server...");

        // Inicializamos el cache de OTP para 2FA
        let otp_cache = OtpCache::new();
        let otp_cache_data = web::Data::new(otp_cache);

        let server = HttpServer::new(move || {
            App::new()
                // Registrar OTP cache para controladores MFA
                .app_data(otp_cache_data.clone())

                // Enable CORS with permissive settings and credentials support
                .wrap(Cors::permissive().supports_credentials())
                // Add request logging middleware
                .wrap(Logger::default())

                // Configure API routes under /api/v1 scope
                .service(
                    web::scope("/api/v1")
                        // Authentication routes (incluye register, signin, MFA, check)
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
                        // Web-specific routes
                        .service(controllers::web::routes())
                        // Chat functionality routes
                        .service(controllers::chat::routes())
                        // Resource management routes
                        .service(controllers::recurso::routes())
                        // User management routes
                        .service(controllers::user::routes())
                        // Sales-related routes
                        .service(controllers::sale::routes())
                        // Admin panel routes
                        .service(controllers::admin::routes())
                        // Flow management routes
                        .service(controllers::flow::routes())
                        // .service(nosql::routes()) // Uncomment to enable NoSQL routes
                )

                // Configure static file serving
                .service(
                    web::scope("")
                        .service(
                            fs::Files::new(
                                "/", 
                                if Config::get_mode() == "prod" {
                                    "/usr/local/bin/web"  // Production path
                                } else {
                                    "../../page/"         // Development path
                                }
                            )
                            .show_files_listing()      // Enable directory listing
                            .index_file("index.html")  // Default index file
                        ),
                )
        });

        info!("Listening on http://{}", Config::get_addrs());
        // Bind server to configured address and start listening
        server.bind(Config::get_addrs())?.run().await?;
        Ok(())
    }
}

#[actix_web::main]
async fn main() -> anyhow::Result<()> {
    // Start the application server
    AppServer.start().await
}
