use crate::{database::DbResponder, models::{User, Credentials}};
use actix_web::{HttpResponse, Responder, Result, error, post, web};
use auth::{PasswordHasher, TokenService};
use validator::Validate;
use serde_json::json;

#[post("/register")]
pub async fn register(mut user: web::Json<User>) -> Result<impl Responder> {
    if let Err(_) = user.validate() {
        return Ok(HttpResponse::Unauthorized().body("Invalid data"));
    }

    if let Ok(hash) = PasswordHasher::hash(&user.password) {
        if let Ok(None) = User::get_by_email(user.email.clone()).await {
            user.password = hash.to_string();

            let id = User::create(user.clone()).await.to_web()?;
            user.id = Some(id);

            return Ok(HttpResponse::Ok().json(user));
        }

        return Ok(HttpResponse::Unauthorized().body("Email already exists"));
    }

    Err(error::ErrorBadRequest("Failed"))
}

// #[post("/signin")]
// pub async fn signin(
//     profile: web::Json<Credentials>,
// ) -> impl Responder {
//     if let Ok(Some(user)) = User::get_by_email(profile.email.clone()).await {
//         if let Ok(true) = PasswordHasher::verify(&profile.password, &user.password) {
//             if let Some(id) = user.id {
//                 if let Ok(token) = TokenService::create(&CONFIG.admin_secret_key, id) {
//                     return HttpResponse::Ok()
//                         .json(json!({ "token": token }));
//                 }
//             }
//         }
//     }

//     HttpResponse::Unauthorized().body("Username or password is incorrect")
// }

pub fn routes() -> actix_web::Scope {
    web::scope("/auth")
      .service(register)
}
