use actix_cors::Cors;
use actix_files as fs;
use actix_web::{App, HttpServer, middleware::Logger, web};
use common::{Application, ApplicationConfig};
use config::Config;
use database::Database;
use tracing::info;

// Test module
pub mod test;

// Internal modules for application functionality
mod common;
mod config;
mod controllers;
mod database;
mod models;
mod schema;
mod middlewares;
mod scraping;
mod nosql;

// Main application server structure
struct AppServer;

// Implementation of the Application trait for AppServer
impl Application for AppServer {
    // Setup method to initialize the application
    async fn setup(&self) -> anyhow::Result<()> {
        info!("Initializing the database...");
        // Initialize database with connection pool and run migrations
        Database::init(Config::get_max_pool_size(), Config::get_with_migrations())?;
        info!("Migrations applied successfully");

        Ok(())
    }

    // Create and configure the HTTP server
    async fn create_server(&self) -> anyhow::Result<()> {
        info!("Starting the server...");
        // Create HTTP server with middleware and route configuration
        let server = HttpServer::new(move || {
            App::new()
                // Enable CORS with permissive settings and credentials support
                .wrap(Cors::permissive().supports_credentials())
                // Add request logging middleware
                .wrap(Logger::default())
                // Configure API routes under /api/v1 scope
                .service(
                    web::scope("/api/v1")
                        .service(controllers::auth::routes())      // Authentication routes
                        .service(controllers::web::routes())       // Web-specific routes
                        .service(controllers::chat::routes())      // Chat functionality routes
                        .service(controllers::recurso::routes())   // Resource management routes
                        .service(controllers::user::routes())      // User management routes
                        .service(controllers::sale::routes())      // Sales-related routes
                        .service(controllers::admin::routes())     // Admin panel routes
                        .service(controllers::flow::routes())      // Flow management routes
                        .service(nosql::routes())
                        .service(controllers::email::routes())    // Email handling routes
                )
                // Configure static file serving
                .service(
                    web::scope("")
                        .service(
                            fs::Files::new("/", {
                                // Serve static files from different paths based on environment
                                if Config::get_mode() == "prod" {
                                    "/usr/local/bin/web"  // Production path
                                } else {
                                    "../../page/"         // Development path
                                }
                            })
                                .show_files_listing()      // Enable directory listing
                                .index_file("index.html"), // Set default index file
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
