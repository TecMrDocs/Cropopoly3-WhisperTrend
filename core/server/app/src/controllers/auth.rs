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
// use crate::controllers::user::send_verification_email_with_resend;
use auth::MagicLinkService;
use crate::controllers::admin::register;

#[derive(serde::Deserialize)]
struct VerifyEmailQuery {
    token: String,
}

#[post("/register")]
pub async fn create_user(user: web::Json<User>) -> Result<impl Responder> {
    println!("🎯 create_user function called!");
    
    let mut user = user.into_inner();
    
    if let Err(errors) = user.validate() {
        return Ok(HttpResponse::BadRequest().json(errors));
    }

    if let Ok(None) = User::get_by_email(user.email.clone()).await {
        println!("✅ Email no existe, procediendo...");
        
        if let Ok(hash) = PasswordHasher::hash(&user.password) {
            println!("✅ Password hasheado correctamente");
            user.password = hash.to_string();
            // Asegurar que el usuario inicie sin verificar
            // user.email_verified = Some(false);

            let id = User::create(user.clone()).await.to_web()?;
            println!("✅ Usuario creado con ID: {}", id);
            user.id = Some(id);

            // Enviar email de verificación automáticamente
            let secret_key = std::env::var("JWT_SECRET")
                .unwrap_or_else(|_| "default-super-secret-key-for-development".to_string());
            println!("✅ Secret key obtenido: {}", &secret_key[..10]); // Solo primeros 10 chars

            if let Ok(token) = MagicLinkService::create_email_verification_token(
                &secret_key,
                id,
                user.email.clone(),
            ) {
                println!("✅ Token generado: {}", &token[..20]); // Solo primeros 20 chars
                
                let base_url = std::env::var("BASE_URL")
                    .unwrap_or_else(|_| "http://localhost:8080".to_string());
                let magic_link = format!("{}/api/v1/auth/verify-email?token={}", base_url, token);
                
                let _user_name = format!("{} {}", user.name, user.last_name);
                
                // Intentar enviar email de verificación (no fallar si no se puede)
                // if let Err(e) = send_verification_email_with_resend(&user.email, &user_name, &magic_link).await {
                //     error!("Failed to send verification email during user creation: {}", e);
                //     // Continuar con el registro aunque no se pueda enviar el email
                // }
                
                println!("🔗 Magic link generado: {}", magic_link);
            } else {
                println!("❌ Error generando token");
            }

            return Ok(HttpResponse::Created().json(serde_json::json!({
                "message": "User created successfully",
                "user_id": id,
                "verification_email_sent": true,
                "note": "Please check your email to verify your account"
            })));
        } else {
            println!("❌ Error hasheando password");
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

#[get("/verify-email")]
pub async fn verify_email_endpoint(query: web::Query<VerifyEmailQuery>) -> impl Responder {
    println!("🔍 verify_email_endpoint called with token: {}", &query.token[..20]);
    
    let secret_key = std::env::var("JWT_SECRET")
        .unwrap_or_else(|_| "default-super-secret-key-for-development".to_string());
    
    match MagicLinkService::verify_magic_link(&secret_key, &query.token, "email_verification") {
        Ok(claims) => {
            println!("✅ Token válido para usuario: {}", claims.user_id);
            match User::update_email_verified_by_id(claims.user_id, true).await {
                Ok(_) => {
                    println!("✅ Email verificado exitosamente");
                    HttpResponse::Ok().json(json!({
                        "message": "Email verified successfully",
                        "verified": true
                    }))
                }
                Err(e) => {
                    error!("Database error during email verification: {}", e);
                    HttpResponse::InternalServerError().json(json!({
                        "error": "Verification failed"
                    }))
                }
            }
        }
        Err(e) => {
            error!("Invalid verification token: {}", e);
            HttpResponse::BadRequest().json(json!({
                "error": "Invalid or expired token"
            }))
        }
    }
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
    println!("🔧 Registrando rutas de auth...");
    
    web::scope("/auth")
        .service(create_user)
        .service(signin)
        .service(verify_email_endpoint)
        .service(
            web::scope("/check")
                .wrap(from_fn(middlewares::auth))
                .service(check),
        )
}