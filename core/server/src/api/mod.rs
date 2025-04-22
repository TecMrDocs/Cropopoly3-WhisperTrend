pub mod routes;
use actix_web::web;

pub fn init_routes(cfg: &mut web::ServiceConfig) {
    routes::config_routes(cfg);
}