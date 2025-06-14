/**
 * Módulo que genera links mágicos y los envía por correo para verificar el email del usuario
 *
 * Implementa la lógica necesaria para verificar la dirección de correo electrónico
 * de los usuarios usando enlaces mágicos (magic links). Incluye funcionalidades para:
 * generar y enviar correos de verificación, procesar tokens de verificación desde enlaces y para 
 * reenviar enlaces mágicos a usuarios no verificados. Además usa Resend para el envío de correos electrónicos.
 *
 * Autor: Mariana Balderrábano Aguilar
*/

use crate::models::{Credentials, User};
use actix_web::{get, post, web, HttpResponse, Responder};
use auth::MagicLinkService;
use serde_json::json;
use tracing::error;

/**
 * Estructura para recibir parámetros de verificación de email desde URL
 * Encapsula el token de verificación enviado como query parameter
 */
#[derive(serde::Deserialize)]
struct VerifyEmailQuery {
    token: String,
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

    let resend = Resend::default();
    let from = std::env::var("EMAIL_FROM").unwrap_or_else(|_| "noreply@whispertrend.lat".to_string());
    let subject = "Verify your email address";
    let html = format!(
        "<p>Hola {},</p>\
         <p>Verifique su dirección de email dando clic al siguiente link:</p>\
         <p><a href=\"{}\">Verify Email</a></p>\
         <p>El link es válido únicamente por 15 minutos</p>",
        user_name, magic_link
    );

    let email = CreateEmailBaseOptions::new(from, vec![to_email], subject).with_html(&html);

    resend.emails.send(email).await.map_err(|e| {
        anyhow::anyhow!("Failed to send email with Resend: {:?}", e)
    })?;

    Ok(())
}