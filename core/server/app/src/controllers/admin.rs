use crate::{
  config::{Claims, Config},
  database::DbResponder,
  middlewares,
  models::{AdminCredentials, Admin},
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
pub async fn register(mut admin: web::Json<Admin>) -> Result<impl Responder> {
  if let Err(_) = admin.validate() {
      return Ok(HttpResponse::Unauthorized().body("Invalid data"));
  }

  if let Ok(None) = Admin::get_by_email(admin.email.clone()).await {
      if let Ok(hash) = PasswordHasher::hash(&admin.password) {
          admin.password = hash.to_string();

          let id = Admin::create(admin.clone()).await.to_web()?;
          admin.id = Some(id);

          return Ok(HttpResponse::Ok().finish());
      }
  } else {
      return Ok(HttpResponse::Unauthorized().body("Email already exists"));
  }

  Err(error::ErrorBadRequest("Failed"))
}

#[post("/signin")]
pub async fn signin(profile: web::Json<AdminCredentials>) -> impl Responder {
  if let Ok(Some(admin)) = Admin::get_by_email(profile.email.clone()).await {
      if let Ok(true) = PasswordHasher::verify(&profile.password, &admin.password) {
          if let Some(id) = admin.id {
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
      let admin = Admin::get_by_id(*id).await.to_web()?;

      return match admin {
          Some(admin) => Ok(HttpResponse::Ok().json(admin)),
          None => Ok(HttpResponse::NotFound().finish()),
      };
  }

  error!("No id found in request");
  Ok(HttpResponse::Unauthorized().finish())
}

pub fn routes() -> actix_web::Scope {
  web::scope("/admin")
      .service(register)
      .service(signin)
      .service(
          web::scope("/check")
              .wrap(from_fn(middlewares::auth))
              .service(check),
      )
}
