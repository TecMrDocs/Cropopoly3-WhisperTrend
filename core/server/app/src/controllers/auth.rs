// src/controllers/auth.rs

use resend_rs::Resend;
use resend_rs::types::CreateEmailBaseOptions;

use crate::cache::OtpCache;
use crate::config::Config;
use crate::controllers::auth_mfa::MfaClaims;
use crate::database::DbResponder; // <-- Añádelo
use crate::models::{Credentials, User};

use actix_web::{
    HttpMessage,
    HttpRequest,
    HttpResponse,
    Responder, // <-- HttpMessage aquí
    error,
    get,
    middleware::from_fn,
    post,
    web,
};
use auth::{PasswordHasher, TokenService};
use chrono::{Duration, Utc};
use rand::rng;
use serde_json::json;
use validator::Validate;

#[post("/register")]
pub async fn register(mut user: web::Json<User>) -> Result<impl Responder, actix_web::Error> {
    if user.validate().is_err() {
        return Ok(HttpResponse::Unauthorized().body("Invalid data"));
    }
    if let Ok(None) = User::get_by_email(user.email.clone()).await {
        if let Ok(hash) = PasswordHasher::hash(&user.password) {
            user.password = hash.into();
            let id = User::create(user.clone()).await.to_web()?;
            user.id = Some(id);
            return Ok(HttpResponse::Ok().finish());
        }
    } else {
        return Ok(HttpResponse::Unauthorized().body("Email already exists"));
    }
    Err(error::ErrorBadRequest("Failed"))
}

#[post("/signin")]
pub async fn signin(
    credentials: web::Json<Credentials>,
    otp_cache: web::Data<OtpCache>,
) -> impl Responder {
    if let Ok(Some(user)) = User::get_by_email(credentials.email.clone()).await {
        if PasswordHasher::verify(&credentials.password, &user.password).unwrap_or(false) {
            if let Some(id) = user.id {
                // OTP
                let mut rng = rng();
                let otp: u32 = rand::Rng::random_range(&mut rng, 0..1_000_000);
                let otp_str = format!("{:06}", otp);
                let expires_at = Utc::now() + Duration::minutes(5);

                // Enviar OTP por correo
                let resend = Resend::default();
                let from = "Acme <onboarding@resend.dev>";
                // let to = user.email.clone();
                let to = user.email.clone();
                let email_opts = CreateEmailBaseOptions::new(
                    from,
                    vec![to.as_str()],
                    "Tu código de verificación",
                )
                .with_text(&format!(
                    "Hola {},\n\n Tu código de verificación es: {}\n Expira en 5 minutos.",
                    user.name, otp_str
                ));
                actix_web::rt::spawn(async move {
                    if let Err(e) = resend.emails.send(email_opts).await {
                        eprintln!("Error enviando OTP por correo a {}: {:?}", to, e);
                    }
                });

                otp_cache.insert(id, (otp_str, expires_at));
                // token intermedio
                let exp = (Utc::now() + Duration::minutes(5)).timestamp() as usize;
                let mfa_claims = MfaClaims { id, exp };
                if let Ok(mfa_token) =
                    TokenService::<MfaClaims>::create(&Config::get_secret_key(), mfa_claims)
                {
                    return HttpResponse::Ok().json(json!({ "mfa_token": mfa_token }));
                }
            }
        }
    }
    HttpResponse::Unauthorized().body("Email or password is incorrect")
}

#[get("/check")]
pub async fn check(req: HttpRequest) -> Result<impl Responder, actix_web::Error> {
    if let Some(user_id) = req.extensions().get::<i32>() {
        if let Some(user) = User::get_by_id(*user_id).await.to_web()? {
            return Ok(HttpResponse::Ok().json(user));
        } else {
            return Ok(HttpResponse::NotFound().finish());
        }
    }
    Err(error::ErrorUnauthorized("No id found in request"))
}

pub fn routes() -> actix_web::Scope {
    web::scope("/auth")
        .service(register)
        .service(signin)
        .service(
            web::scope("/check")
                .wrap(from_fn(crate::middlewares::auth))
                .service(check),
        )
}
