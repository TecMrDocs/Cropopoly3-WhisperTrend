/**
 * Módulo de Autenticación Completa con Verificación de Email y 2FA
 * 
 * Este archivo implementa un sistema completo de autenticación que incluye registro de usuarios,
 * verificación de email mediante magic links, inicio de sesión con doble factor de autenticación (2FA)
 * y gestión de tokens JWT. Integra servicios de email externos para notificaciones y verificaciones.
 * 
 * @author Carlos Alberto Zamudio Velázquez 
 * @contributors Iván Alexander Ramos Ramírez y Mariana Balderrábano Aguilar
 * @version 1.0.0
 */

use crate::cache::OtpCache;
use crate::config::Config;
use crate::controllers::auth_mfa::{verify_mfa, MfaClaims};
use crate::database::DbResponder;
use crate::models::{Credentials, User};
use crate::middlewares;

use actix_web::{
    error, get, middleware::from_fn, post, web, HttpMessage, HttpRequest, HttpResponse, Responder,
    Result, delete,
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
use super::auth_link::send_verification_email_with_resend;


/**
 * Endpoint para el registro de nuevos usuarios en el sistema
 * Valida los datos, hashea la contraseña, crea el usuario en la base de datos
 * y envía un email de verificación con magic link para activar la cuenta
 * 
 * @param user Datos completos del usuario a registrar incluyendo credenciales
 * @return Respuesta HTTP con confirmación de registro y estado del email de verificación
 */
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
                if let Err(e) = send_verification_email_with_resend(&user.email, &user_name, &magic_link).await {
                    error!("Failed to send verification email during user creation: {}", e);
                }

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

/**
 * Endpoint para el inicio de sesión con autenticación de doble factor
 * Autentica las credenciales básicas, verifica el estado del email,
 * genera y envía códigos OTP, y retorna tokens MFA para el segundo paso
 * 
 * @param credentials Email y contraseña del usuario
 * @param otp_cache Cache temporal para almacenar códigos de verificación OTP
 * @return Respuesta HTTP con token MFA o mensaje de error
 */
#[post("/signin")]
pub async fn signin(
    credentials: web::Json<Credentials>,
    otp_cache: web::Data<OtpCache>,
) -> impl Responder {
    if let Ok(Some(user)) = User::get_by_email(credentials.email.clone()).await {
        if PasswordHasher::verify(&credentials.password, &user.password).unwrap_or(false) {
            if let Some(id) = user.id {
                if User::is_email_verified(id).await.unwrap_or(false) == false {
                    return HttpResponse::Unauthorized().body("Please verify your email before signing in");
                }
                let mut rng = rng();
                let otp: u32 = rand::Rng::random_range(&mut rng, 0..1_000_000);
                let otp_str = format!("{:06}", otp);
                let expires_at = Utc::now() + Duration::minutes(5);
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
                otp_cache.insert(id, (otp_str, expires_at));
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

/**
 * Endpoint para verificar el estado de autenticación del usuario
 * Valida el token JWT y retorna la información del usuario autenticado
 * Requiere middleware de autenticación para acceso protegido
 * 
 * @param req Solicitud HTTP con token JWT en headers o extensiones
 * @return Respuesta HTTP con datos del usuario o error de autorización
 */
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


#[delete("/delete/{user_id}")]
pub async fn delete_user(path: web::Path<i32>) -> Result<impl Responder, actix_web::Error> {
    let user_id_to_delete = path.into_inner();

    // Verificar si el usuario existe
    if User::get_by_id(user_id_to_delete).await.to_web()?.is_none() {
        return Ok(HttpResponse::NotFound().json(json!({
            "error": "User not found"
        })));
    }

    // Intentar eliminar el usuario
    User::delete_by_id(user_id_to_delete).await.to_web()?;

    Ok(HttpResponse::Ok().json(json!({
        "message": "User deleted successfully",
        "deleted_user_id": user_id_to_delete
    })))
}

/**
 * Configuración de rutas para el módulo de autenticación
 * Define todos los endpoints disponibles bajo el prefijo /auth
 * Incluye rutas públicas y protegidas con sus respectivos middlewares
 * 
 * @return Scope configurado con todas las rutas del módulo de autenticación
 */
pub fn routes() -> actix_web::Scope {

    web::scope("/auth")
        .service(register)      
        .service(signin)       
        .service(verify_mfa)   
        .service(super::auth_link::verify_email_endpoint) 
        .service(delete_user)
        

        .service(
            web::scope("")  
                .wrap(from_fn(crate::middlewares::auth))
                .service(check),
        )
}