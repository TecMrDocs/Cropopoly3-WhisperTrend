#[actix_web::main]
async fn main() {
    dotenvy::dotenv().ok();
    env_logger::init();
    if let Err(e) = server::run().await {
        eprintln!("Failed to run the service: {}", e);
        std::process::exit(1);
    }
}