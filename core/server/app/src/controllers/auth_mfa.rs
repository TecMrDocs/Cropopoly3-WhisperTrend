/**
 * Módulo de Autenticación de Doble Factor (MFA/2FA)
 * 
 * Este archivo implementa el sistema de verificación de segundo factor de autenticación
 * utilizando códigos OTP (One-Time Password) temporales. Maneja la verificación de tokens
 * intermedios, validación de códigos de verificación y generación de tokens JWT finales.
 * 
 * @author Iván Alexander Ramos Ramírez
 */

use crate::{
    cache::OtpCache,
    config::{Claims, Config},
};
use actix_web::{web, HttpRequest, HttpResponse, Responder, Result, error, post};
use auth::TokenService;
use chrono::Utc;
use serde::{Serialize, Deserialize};
use serde_json::json;

/**
 * Estructura de claims para tokens MFA intermedios
 * Contiene la información básica necesaria para identificar al usuario
 * durante el proceso de verificación de segundo factor
 */
#[derive(Serialize, Deserialize)]
pub struct MfaClaims {
    pub id: i32,
    pub exp: usize,
}

/**
 * Estructura para recibir el código de verificación MFA desde el cliente
 * Encapsula el código OTP proporcionado por el usuario para su validación
 */
#[derive(Deserialize)]
pub struct MfaPayload {
    pub code: String,
}

/**
 * Endpoint principal para la verificación de autenticación de doble factor
 * Procesa el token MFA intermedio, valida el código OTP proporcionado
 * y genera el token JWT final si la verificación es exitosa
 * 
 * @param req Solicitud HTTP que contiene el token MFA en los headers
 * @param payload Código de verificación OTP enviado por el usuario
 * @param otp_cache Cache en memoria que almacena los códigos OTP temporales
 * @return Respuesta HTTP con token JWT final o mensaje de error
 */
#[post("/mfa")]
pub async fn verify_mfa(
    req: HttpRequest,
    payload: web::Json<MfaPayload>,
    otp_cache: web::Data<OtpCache>,
) -> Result<impl Responder> {
    if let Some(Some(temp_token)) = req
        .headers()
        .get("mfa-token")
        .map(|s| s.to_str().ok().map(String::from))
    {

        if let Ok(claims) = TokenService::<MfaClaims>::decode(&Config::get_secret_key(), &temp_token) {
            if (claims.exp as i64) < Utc::now().timestamp() {
                return Err(error::ErrorUnauthorized("Token de 2FA expirado"));
            }
            let user_id = claims.id;

            if let Some(mut entry) = otp_cache.get_mut(&user_id) {
                let (stored_code, expires_at) = entry.value().clone();
                drop(entry);
            
                if expires_at < Utc::now() {
                    otp_cache.remove(&user_id);
                    return Err(error::ErrorUnauthorized("OTP expirado"));
                }
            
                if stored_code == payload.code {
                    otp_cache.remove(&user_id);
                    let full_token = TokenService::<Claims>::create(
                        &Config::get_secret_key(),
                        Claims::new(user_id),
                    )
                    .map_err(|_| error::ErrorInternalServerError("Error generando JWT"))?;
                    return Ok(HttpResponse::Ok().json(json!({ "token": full_token })));
                } else {
                    return Err(error::ErrorUnauthorized("Código 2FA inválido"));
                }
            } else {
                return Err(error::ErrorUnauthorized("No se encontró OTP de 2FA"));
            }
        }
    }
    Err(error::ErrorUnauthorized("No autorizado"))
}