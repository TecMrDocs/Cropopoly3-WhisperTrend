use crate::cache::OtpCache;
use crate::config::Config;
use crate::controllers::auth_mfa::{verify_mfa, MfaClaims};
use crate::database::DbResponder;
use crate::models::{Credentials, User};
use crate::middlewares;

use actix_web::{
    error, get, middleware::from_fn, post, web, HttpMessage, HttpRequest, HttpResponse, Responder,
    Result,
};
use auth::{PasswordHasher, TokenService};
use chrono::{Duration, Utc};
use rand::rng;
use resend_rs::Resend;
use resend_rs::types::CreateEmailBaseOptions;
use serde_json::json;
use validator::Validate;
use tracing::error;
use auth::MagicLinkService;
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use once_cell::sync::Lazy;

#[derive(serde::Deserialize)]
struct VerifyEmailQuery {
    token: String,
}

#[post("/register")]
pub async fn register(user: web::Json<User>) -> Result<impl Responder> {

    let mut user = user.into_inner();

    if let Err(errors) = user.validate() {
        return Ok(HttpResponse::BadRequest().json(errors));
    }

    if let Ok(None) = User::get_by_email(user.email.clone()).await {

        if let Ok(hash) = PasswordHasher::hash(&user.password) {
            user.password = hash.to_string();

            let id = User::create(user.clone()).await.to_web()?;
            user.id = Some(id);

            // Enviar email de verificación
            let secret_key = std::env::var("JWT_SECRET")
                .unwrap_or_else(|_| "default-super-secret-key-for-development".to_string());

            if let Ok(token) = MagicLinkService::create_email_verification_token(
                &secret_key,
                id,
                user.email.clone(),
            ) {

                let base_url = std::env::var("BASE_URL")
                    .unwrap_or_else(|_| "http://localhost:8080".to_string());
                let magic_link = format!("{}/api/v1/auth/verify-email?token={}", base_url, token);

                let user_name = format!("{} {}", user.name, user.last_name);

                // Enviar email de verificación
                if let Err(e) = send_verification_email_with_resend(&user.email, &user_name, &magic_link).await {
                    error!("Failed to send verification email during user creation: {}", e);
                }

                // println!("Magic link generado: {}", magic_link);

                return Ok(HttpResponse::Created().json(serde_json::json!({
                    "message": "User created successfully",
                    "user_id": id,
                    "verification_email_sent": true,
                    "note": "Please check your email to verify your account",
                    "magic_link": magic_link 
                })));
            } else {
                return Ok(HttpResponse::InternalServerError().body("Error generating verification token"));
            }
        } else {
            return Ok(HttpResponse::InternalServerError().body("Error hashing password"));
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
    // Paso 1: Buscar usuario por email
    if let Ok(Some(user)) = User::get_by_email(credentials.email.clone()).await {
        // Paso 2: Verificar contraseña
        if PasswordHasher::verify(&credentials.password, &user.password).unwrap_or(false) {
            // Paso 3: Verificar que el usuario tiene id
            if let Some(id) = user.id {
                // Paso 4: Verificar si el email está verificado → como en el primer código
                if User::is_email_verified(id).await.unwrap_or(false) == false {
                    return HttpResponse::Unauthorized().body("Please verify your email before signing in");
                }

                // Paso 5: Generar OTP → como en el segundo código
                let mut rng = rng();
                let otp: u32 = rand::Rng::random_range(&mut rng, 0..1_000_000);
                let otp_str = format!("{:06}", otp);
                let expires_at = Utc::now() + Duration::minutes(5);

                // Paso 6: Enviar OTP por Resend → como en el segundo código
                let resend = Resend::default();
                let from = Config::get_email_from();
                let to = user.email.clone();
                let email_opts = CreateEmailBaseOptions::new(
                    from,
                    vec![&to],
                    "Your verification code",
                )
                .with_text(&format!(
                    "Hello {},\n\nYour verification code is: {}\nIt expires in 5 minutes.",
                    user.name, otp_str
                ));

                actix_web::rt::spawn(async move {
                    if let Err(e) = resend.emails.send(email_opts).await {
                        eprintln!("Failed to send OTP to {}: {:?}", to, e);
                    }
                });

                // Paso 7: Guardar OTP en cache
                otp_cache.insert(id, (otp_str, expires_at));

                // Paso 8: Generar mfa_token temporal
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

    // Si algo falla → respuesta estándar
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
#[post("/resend-verification")]
pub async fn resend_verification_email(data: web::Json<Credentials>) -> impl Responder {
    if let Ok(Some(user)) = User::get_by_email(data.email.clone()).await {
        if let Some(user_id) = user.id {
            // Verificamos si ya está verificado
            if User::is_email_verified(user_id).await.unwrap_or(false) {
                return HttpResponse::Ok().json(json!({
                    "message": "Email already verified"
                }));
            }

            // Si no está verificado → mandamos otro magic link
            let secret_key = std::env::var("JWT_SECRET")
                .unwrap_or_else(|_| "default-super-secret-key-for-development".to_string());

            if let Ok(token) = MagicLinkService::create_email_verification_token(
                &secret_key,
                user_id,
                user.email.clone(),
            ) {
                let frontend_base_url = std::env::var("FRONTEND_URL")
                    .unwrap_or_else(|_| "http://localhost:8080".to_string());

                let magic_link = format!("{}/launchprocess?token={}", frontend_base_url, token);
                let user_name = format!("{} {}", user.name, user.last_name);

                if let Err(e) = send_verification_email_with_resend(&user.email, &user_name, &magic_link).await {
                    error!("Failed to resend verification email: {}", e);
                    return HttpResponse::InternalServerError().body("Failed to send email");
                }

                println!("🔗 Resent verification magic link: {}", magic_link);

                return HttpResponse::Ok().json(json!({
                    "message": "Verification email resent"
                }));
            }
        }
    }

    HttpResponse::Ok().json(json!({
        "message": "If this email exists, a verification email was resent"
    }))
}


#[get("/verify-email")]
pub async fn verify_email_endpoint(query: web::Query<VerifyEmailQuery>) -> impl Responder {

    let secret_key = std::env::var("JWT_SECRET")
        .unwrap_or_else(|_| "default-super-secret-key-for-development".to_string());

    match MagicLinkService::verify_magic_link(&secret_key, &query.token, "email_verification") {
        Ok(claims) => {
            User::update_email_verified_by_id(claims.user_id, true).await.ok();

            HttpResponse::Ok().json(json!({
                "message": "Email verified successfully (memory store)",
                "verified": true
            }))
        }
        Err(e) => {
            error!("Invalid verification token: {}", e);
            HttpResponse::BadRequest().json(json!({
                "error": "Invalid or expired token"
            }))
        }
    }
}

pub fn routes() -> actix_web::Scope {
    web::scope("/auth")
        .service(register)      // POST /api/v1/auth/register
        .service(signin)       // POST /api/v1/auth/signin
        .service(verify_mfa)   // POST /api/v1/auth/mfa
        .service(verify_email_endpoint) // GET /api/v1/auth/verify-email
        .service(resend_verification_email) // POST /api/v1/auth/resend-verification

        .service(
            web::scope("")  // GET /api/v1/auth/check
                .wrap(from_fn(crate::middlewares::auth))
                .service(check),
        )
}

pub async fn send_verification_email_with_resend(
    to_email: &str,
    user_name: &str,
    magic_link: &str,
) -> anyhow::Result<()> {
    use resend_rs::types::CreateEmailBaseOptions;
    use resend_rs::Resend;

    let resend = Resend::default();
    // let from = "Acme <onboarding@resend.dev>";
    // let from = "noreply@whispertrend.lat";
    let from = "WhisperTrend <noreply@whispertrend.lat>";
    let subject = "Verify your email address";
    let html = format!(
        "<p>Hi {},</p>\
         <p>Verifique su dirección de email dando clic al siguiente link:</p>\
         <p><a href=\"{}\">Verify Email</a></p>",
        user_name, magic_link
    );

    let email = CreateEmailBaseOptions::new(from, vec![to_email], subject).with_html(&html);

    resend.emails.send(email).await.map_err(|e| {
        anyhow::anyhow!("Failed to send email with Resend: {:?}", e)
    })?;

    Ok(())
}