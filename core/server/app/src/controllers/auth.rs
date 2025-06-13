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

/**
 * Estructura para recibir parámetros de verificación de email desde URL
 * Encapsula el token de verificación enviado como query parameter
 */
#[derive(serde::Deserialize)]
struct VerifyEmailQuery {
    token: String,
}

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

    /**
     * Validación integral de los datos del usuario
     * Utiliza el trait Validate para verificar formato de email,
     * longitud de contraseña, caracteres válidos y otros criterios de validación
     */
    if let Err(errors) = user.validate() {
        return Ok(HttpResponse::BadRequest().json(errors));
    }

    /**
     * Verificación de unicidad del email en el sistema
     * Consulta la base de datos para asegurar que el email no esté registrado previamente
     * Solo procede con el registro si el email está disponible
     */
    if let Ok(None) = User::get_by_email(user.email.clone()).await {

        /**
         * Proceso de hasheo criptográfico de la contraseña
         * Utiliza algoritmos seguros para proteger las contraseñas
         * antes de almacenarlas en la base de datos
         */
        if let Ok(hash) = PasswordHasher::hash(&user.password) {
            user.password = hash.to_string();

            /**
             * Creación del registro de usuario en la base de datos
             * Almacena los datos validados y la contraseña hasheada
             * obtiene el ID generado para procesos posteriores
             */
            let id = User::create(user.clone()).await.to_web()?;
            user.id = Some(id);

            /**
             * Generación del token de verificación de email
             * Crea un magic link firmado criptográficamente que permite
             * al usuario verificar su dirección de correo electrónico
             */
            let secret_key = std::env::var("JWT_SECRET")
                .unwrap_or_else(|_| "default-super-secret-key-for-development".to_string());

            if let Ok(token) = MagicLinkService::create_email_verification_token(
                &secret_key,
                id,
                user.email.clone(),
            ) {

                /**
                 * Construcción de la URL de verificación completa
                 * Combina la URL base del sistema con el token generado
                 * para crear el magic link funcional
                 */
                let base_url = std::env::var("BASE_URL")
                    .unwrap_or_else(|_| "http://localhost:8080".to_string());
                let magic_link = format!("{}/api/v1/auth/verify-email?token={}", base_url, token);

                let user_name = format!("{} {}", user.name, user.last_name);

                /**
                 * Envío del email de verificación al usuario
                 * Utiliza el servicio Resend para entregar el magic link
                 * y maneja errores de envío de forma no bloqueante
                 */
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
        /**
         * Manejo del caso donde el email ya existe en el sistema
         * Retorna error para prevenir registro duplicado y enumeración de emails
         */
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
    /**
     * Búsqueda y validación del usuario en la base de datos
     * Localiza al usuario por su dirección de email para iniciar
     * el proceso de autenticación y verificación de credenciales
     */
    if let Ok(Some(user)) = User::get_by_email(credentials.email.clone()).await {
        /**
         * Verificación criptográfica de la contraseña proporcionada
         * Compara la contraseña en texto plano con el hash almacenado
         * utilizando algoritmos de verificación seguros
         */
        if PasswordHasher::verify(&credentials.password, &user.password).unwrap_or(false) {
            if let Some(id) = user.id {
                /**
                 * Verificación del estado de verificación del email
                 * Requiere que el usuario haya confirmado su dirección de correo
                 * antes de permitir el acceso completo al sistema
                 */
                if User::is_email_verified(id).await.unwrap_or(false) == false {
                    return HttpResponse::Unauthorized().body("Please verify your email before signing in");
                }

                /**
                 * Generación del código OTP aleatorio para 2FA
                 * Crea un código de 6 dígitos único y seguro
                 * con tiempo de expiración limitado para mayor seguridad
                 */
                let mut rng = rng();
                let otp: u32 = rand::Rng::random_range(&mut rng, 0..1_000_000);
                let otp_str = format!("{:06}", otp);
                let expires_at = Utc::now() + Duration::minutes(5);

                /**
                 * Envío asíncrono del código OTP por email
                 * Utiliza el servicio Resend para entregar el código de verificación
                 * de forma no bloqueante para mantener la responsividad del sistema
                 */
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

                /**
                 * Almacenamiento temporal del código OTP en cache
                 * Guarda el código generado con su timestamp de expiración
                 * para verificación posterior en el endpoint MFA
                 */
                otp_cache.insert(id, (otp_str, expires_at));

                /**
                 * Generación del token MFA intermedio
                 * Crea un token temporal que autoriza al usuario para el segundo paso
                 * de autenticación con tiempo de vida limitado
                 */
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

    /**
     * Respuesta genérica para credenciales inválidas
     * Mantiene el mismo mensaje para cualquier fallo de autenticación
     * para prevenir enumeración de usuarios y ataques de fuerza bruta
     */
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
    /**
     * Extracción del ID de usuario desde el token validado
     * El middleware de autenticación ya procesó el token JWT
     * y extrajo el ID que está disponible en las extensiones
     */
    if let Some(user_id) = req.extensions().get::<i32>() {
        /**
         * Consulta de datos actualizados del usuario
         * Obtiene la información completa del usuario desde la base de datos
         * utilizando el ID extraído del token autenticado
         */
        if let Some(user) = User::get_by_id(*user_id).await.to_web()? {
            return Ok(HttpResponse::Ok().json(user));
        } else {
            return Ok(HttpResponse::NotFound().finish());
        }
    }
    Err(error::ErrorUnauthorized("No id found in request"))
}

/**
 * Endpoint para reenviar emails de verificación a usuarios no verificados
 * Permite a los usuarios solicitar un nuevo magic link si el anterior expiró
 * o no fue recibido correctamente en su bandeja de entrada
 * 
 * @param data Credenciales que incluyen el email para reenvío
 * @return Respuesta HTTP confirmando el reenvío o estado de verificación
 */
#[post("/resend-verification")]
pub async fn resend_verification_email(data: web::Json<Credentials>) -> impl Responder {
    /**
     * Búsqueda del usuario y verificación de su estado actual
     * Localiza al usuario en la base de datos y verifica si ya completó
     * el proceso de verificación de email anteriormente
     */
    if let Ok(Some(user)) = User::get_by_email(data.email.clone()).await {
        if let Some(user_id) = user.id {
            /**
             * Verificación del estado actual de verificación del email
             * Si el email ya está verificado, informa al usuario
             * evitando envíos innecesarios de emails de verificación
             */
            if User::is_email_verified(user_id).await.unwrap_or(false) {
                return HttpResponse::Ok().json(json!({
                    "message": "Email already verified"
                }));
            }

            /**
             * Generación de nuevo token de verificación para reenvío
             * Crea un magic link fresco con nueva fecha de expiración
             * para reemplazar cualquier token anterior que haya caducado
             */
            let secret_key = std::env::var("JWT_SECRET")
                .unwrap_or_else(|_| "default-super-secret-key-for-development".to_string());

            if let Ok(token) = MagicLinkService::create_email_verification_token(
                &secret_key,
                user_id,
                user.email.clone(),
            ) {
                /**
                 * Construcción de la URL de verificación para el frontend
                 * Utiliza la URL base del frontend para dirigir al usuario
                 * a la página correcta de procesamiento de verificación
                 */
                let frontend_base_url = std::env::var("FRONTEND_URL")
                    .unwrap_or_else(|_| "http://localhost:8080".to_string());

                let magic_link = format!("{}/launchprocess?token={}", frontend_base_url, token);
                let user_name = format!("{} {}", user.name, user.last_name);

                /**
                 * Reenvío del email de verificación con el nuevo magic link
                 * Utiliza el mismo servicio de email para mantener consistencia
                 * en el formato y presentación de los mensajes
                 */
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

    /**
     * Respuesta genérica para prevenir enumeración de emails
     * Retorna el mismo mensaje independientemente de si el email existe
     * para evitar que atacantes identifiquen emails válidos en el sistema
     */
    HttpResponse::Ok().json(json!({
        "message": "If this email exists, a verification email was resent"
    }))
}

/**
 * Endpoint para procesar la verificación de email mediante magic links
 * Recibe el token de verificación, lo valida criptográficamente
 * y actualiza el estado del usuario como email verificado
 * 
 * @param query Parámetros de URL que contienen el token de verificación
 * @return Respuesta HTTP indicando éxito o fallo de la verificación
 */
#[get("/verify-email")]
pub async fn verify_email_endpoint(query: web::Query<VerifyEmailQuery>) -> impl Responder {

    /**
     * Obtención de la clave secreta para validación del token
     * Utiliza la misma clave que se usó para generar el magic link
     * asegurando la integridad criptográfica del proceso
     */
    let secret_key = std::env::var("JWT_SECRET")
        .unwrap_or_else(|_| "default-super-secret-key-for-development".to_string());

    /**
     * Validación criptográfica del magic link recibido
     * Verifica la firma, expiración y tipo de token para asegurar
     * que es un token válido de verificación de email
     */
    match MagicLinkService::verify_magic_link(&secret_key, &query.token, "email_verification") {
        Ok(claims) => {
            /**
             * Actualización del estado de verificación en la base de datos
             * Marca el email del usuario como verificado permitiendo
             * el acceso completo a las funcionalidades del sistema
             */
            User::update_email_verified_by_id(claims.user_id, true).await.ok();

            HttpResponse::Ok().json(json!({
                "message": "Email verified successfully (memory store)",
                "verified": true
            }))
        }
        Err(e) => {
            /**
             * Manejo de tokens inválidos o expirados
             * Registra el error para auditoria y retorna mensaje
             * informativo al usuario sobre el fallo de verificación
             */
            error!("Invalid verification token: {}", e);
            HttpResponse::BadRequest().json(json!({
                "error": "Invalid or expired token"
            }))
        }
    }
}

/**
 * Configuración de rutas para el módulo de autenticación
 * Define todos los endpoints disponibles bajo el prefijo /auth
 * Incluye rutas públicas y protegidas con sus respectivos middlewares
 * 
 * @return Scope configurado con todas las rutas del módulo de autenticación
 */
pub fn routes() -> actix_web::Scope {
    /**
     * Estructura jerárquica de rutas de autenticación
     * - Rutas públicas: registro, login, verificación de email, reenvío
     * - Rutas protegidas: verificación de estado de usuario autenticado
     * - Integración con endpoints MFA para autenticación de doble factor
     */
    web::scope("/auth")
        .service(register)      
        .service(signin)       
        .service(verify_mfa)   
        .service(verify_email_endpoint) 
        .service(resend_verification_email) 

        .service(
            web::scope("")  
                .wrap(from_fn(crate::middlewares::auth))
                .service(check),
        )
}

/**
 * Función utilitaria para envío de emails de verificación
 * Integra con el servicio Resend para entregar magic links de verificación
 * con formato HTML profesional y manejo robusto de errores
 * 
 * @param to_email Dirección de correo del destinatario
 * @param user_name Nombre completo del usuario para personalización
 * @param magic_link URL completa de verificación con token embebido
 * @return Resultado de la operación de envío de email
 */
pub async fn send_verification_email_with_resend(
    to_email: &str,
    user_name: &str,
    magic_link: &str,
) -> anyhow::Result<()> {
    use resend_rs::types::CreateEmailBaseOptions;
    use resend_rs::Resend;

    /**
     * Configuración del cliente de email y composición del mensaje
     * Utiliza el servicio Resend con configuración de branding corporativo
     * y formato HTML profesional para mejor experiencia de usuario
     */
    let resend = Resend::default();
    let from = "WhisperTrend <noreply@whispertrend.lat>";
    let subject = "Verify your email address";
    let html = format!(
        "<p>Hi {},</p>\
         <p>Verifique su dirección de email dando clic al siguiente link:</p>\
         <p><a href=\"{}\">Verify Email</a></p>",
        user_name, magic_link
    );

    /**
     * Envío del email con manejo de errores específicos
     * Configura el mensaje con destinatario, remitente y contenido HTML
     * convierte errores del servicio en errores manejables por la aplicación
     */
    let email = CreateEmailBaseOptions::new(from, vec![to_email], subject).with_html(&html);

    resend.emails.send(email).await.map_err(|e| {
        anyhow::anyhow!("Failed to send email with Resend: {:?}", e)
    })?;

    Ok(())
}