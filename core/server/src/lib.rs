mod api;
mod database;
mod config;
mod models;
mod schema;
mod middleware;
mod utils;

use actix_cors::Cors;
use actix_web::{App, HttpServer, web};

pub async fn api_run() -> std::io::Result<()> {
    let database = database::DataBase::new();

    HttpServer::new(move || {
        let cors = Cors::permissive()
            .allow_any_origin()
            .allow_any_method()
            .allow_any_header()
            .supports_credentials();

        App::new()
            .wrap(cors)
            .app_data(web::Data::new(database.clone()))
            .configure(api::init_routes)
    })
    .bind(("0.0.0.0", 8080))?
    .run()
    .await
}

pub async fn run() -> Result<(), Box<dyn std::error::Error>> {
    if let Err(e) = api_run().await {
        eprintln!("Error running API server: {}", e);
        return Err(Box::new(e));
    }

    Ok(())
}