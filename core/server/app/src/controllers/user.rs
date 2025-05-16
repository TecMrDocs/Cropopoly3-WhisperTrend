use crate::models::User;
use actix_web::{Responder, post, web};

#[post("/register")]
pub async fn register(user: web::Json<User>) -> impl Responder {
    let user = User::create(user.into_inner()).await;

    if let Ok(_) = user {
        "User registered successfully"
    } else {
        "Failed to register user"
    }
}

pub fn routes() -> actix_web::Scope {
    web::scope("/users").service(register)
}
