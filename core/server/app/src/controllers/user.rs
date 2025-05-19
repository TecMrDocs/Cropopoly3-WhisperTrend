use crate::{
    config::{Claims, Config},
    database::DbResponder,
    middlewares,
    models::{Credentials, User},
};
use actix_web::{
    HttpMessage, HttpRequest, HttpResponse, Responder, Result, error, get, middleware::from_fn,
    post, web,
};
use auth::{PasswordHasher, TokenService};
use serde_json::json;
use tracing::error;
use validator::Validate;

#[post("/register")]
pub async fn register(mut user: web::Json<User>) -> Result<impl Responder> {
    if let Err(_) = user.validate() {
        return Ok(HttpResponse::Unauthorized().body("Invalid data"));
    }

    if let Ok(hash) = PasswordHasher::hash(&user.contrasena) {
        if let Ok(None) = User::get_by_email(user.email.clone()).await {
            user.contrasena = hash.to_string();

            let id = User::create(user.clone()).await.to_web()?;
            user.id = Some(id);

            return Ok(HttpResponse::Ok().json(user));
        }

        return Ok(HttpResponse::Unauthorized().body("Email already exists"));
    }

    Err(error::ErrorBadRequest("Failed"))
}

#[post("/signin")]
pub async fn signin(profile: web::Json<Credentials>) -> impl Responder {
    if let Ok(Some(user)) = User::get_by_email(profile.email.clone()).await {
        if let Ok(true) = PasswordHasher::verify(&profile.contrasena, &user.contrasena) {
            if let Some(id) = user.id {
                if let Ok(token) =
                    TokenService::<Claims>::create(&Config::get_secret_key(), Claims::new(id))
                {
                    return HttpResponse::Ok().json(json!({ "token": token }));
                }
            }
        }
    }

    HttpResponse::Unauthorized().body("Email or password is incorrect")
}

#[get("")]
pub async fn check(req: HttpRequest) -> Result<impl Responder> {
    if let Some(id) = req.extensions().get::<i32>() {
        let user = User::get_by_id(*id).await.to_web()?;

        return match user {
            Some(user) => Ok(HttpResponse::Ok().json(user)),
            None => Ok(HttpResponse::NotFound().finish()),
        };
    }

    error!("No id found in request");
    Ok(HttpResponse::Unauthorized().finish())
}

pub fn routes() -> actix_web::Scope {
    web::scope("/auth")
        .service(register)
        .service(signin)
        .service(
            web::scope("/check")
                .wrap(from_fn(middlewares::auth))
                .service(check)
        )
}
