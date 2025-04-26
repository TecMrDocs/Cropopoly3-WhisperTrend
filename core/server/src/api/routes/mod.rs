mod user;
mod auth;
// use actix_web::middleware::from_fn;
use actix_web::web;

pub fn config_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/user")
            .service(web::resource("/")
            .route(web::get().to(user::get_users::get_users))
            .route(web::post().to(user::create_user::create_user))
        )
    );
    cfg.service(
        web::scope("/auth")
            .service(
                web::scope("/user")
            )
            .service(
                web::scope("/admin")
            )
    );
    
}