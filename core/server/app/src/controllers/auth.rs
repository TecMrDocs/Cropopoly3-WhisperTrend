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
use crate::controllers::user::send_verification_email_with_resend;
use auth::MagicLinkService;
use crate::controllers::admin::register;

#[post("/register")]
pub async fn create_user(mut user: web::Json<User>) -> Result<impl Responder> {
    if let Err(errors) = user.into_inner().validate() {
        return HttpResponse::BadRequest().json(errors);
    }

    if let Err(_) = user.validate() {
        return Ok(HttpResponse::Unauthorized().body("Invalid data"));
    }

    if let Ok(None) = User::get_by_email(user.email.clone()).await {
        if let Ok(hash) = PasswordHasher::hash(&user.password) {
            user.password = hash.to_string();
            // Asegurar que el usuario inicie sin verificar
            user.email_verified = false;

            let id = User::create(user.clone()).await.to_web()?;
            user.id = Some(id);

            // Enviar email de verificación automáticamente
            let secret_key = std::env::var("JWT_SECRET")
                .map_err(|_| error::ErrorInternalServerError("JWT secret not configured"))?;

            if let Ok(token) = MagicLinkService::create_email_verification_token(
                &secret_key,
                id,
                user.email.clone(),
            ) {
                let base_url = std::env::var("BASE_URL")
                    .unwrap_or_else(|_| "http://localhost:8080".to_string());
                let magic_link = format!("{}/api/user/verify-email?token={}", base_url, token);
                
                let user_name = format!("{} {}", user.name, user.last_name);
                
                // Intentar enviar email de verificación (no fallar si no se puede)
                if let Err(e) = send_verification_email_with_resend(&user.email, &user_name, &magic_link).await {
                    error!("Failed to send verification email during user creation: {}", e);
                    // Continuar con el registro aunque no se pueda enviar el email
                }
            }

            return Ok(HttpResponse::Created().json(serde_json::json!({
                "message": "User created successfully",
                "user_id": id,
                "verification_email_sent": true,
                "note": "Please check your email to verify your account"
            })));
        }
    } else {
        return Ok(HttpResponse::Unauthorized().body("Email already exists"));
    }

    Err(error::ErrorBadRequest("Failed"))
}

#[post("/signin")]
pub async fn signin(profile: web::Json<Credentials>) -> impl Responder {
    if let Ok(Some(user)) = User::get_by_email(profile.email.clone()).await {
        if let Ok(true) = PasswordHasher::verify(&profile.password, &user.password) {
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
                .service(check),
        )
}
