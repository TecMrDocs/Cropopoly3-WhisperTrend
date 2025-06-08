// core/server/app/src/controllers/auth_mfa.rs
//! Controlador para la verificación de doble factor (MFA)
//!
//! Expone un endpoint `POST /api/v1/auth/mfa` que recibe un código OTP y un JWT intermedio
//! en la cabecera `mfa-token`. Si el OTP coincide y no ha expirado, genera y devuelve el JWT definitivo.

use crate::{
    cache::OtpCache,
    config::{Claims, Config},
    models::User,
};
use actix_web::{
    web, HttpRequest, HttpResponse, Responder, Result, error,
    post,
};
use auth::TokenService;
use chrono::Utc;
use serde::{Serialize, Deserialize};
use serde_json::json;

#[derive(Deserialize)]
pub struct MfaPayload {
    pub code: String,
}

/// Handler para verificar el código de MFA
///
/// - Lee el JWT intermedio de la cabecera `mfa-token`.
/// - Decodifica el token para extraer el `user_id` y su expiración.
/// - Recupera del cache el OTP asociado a `user_id` y comprueba que no haya expirado.
/// - Si el código coincide, borra el OTP del cache y genera un JWT definitivo.
///
/// # Respuestas
/// - `200 OK { "token": "<jwt>" }` si la verificación es exitosa.
/// - `401 Unauthorized` en caso de token intermedio expirado, código inválido o cualquier fallo.
#[post("/mfa")]
pub async fn verify_mfa(
    req: HttpRequest,
    payload: web::Json<MfaPayload>,
    otp_cache: web::Data<OtpCache>,
) -> Result<impl Responder> {
    // 1) Leemos el header "mfa-token"
    if let Some(Some(temp_token)) = req
        .headers()
        .get("mfa-token")
        .map(|s| s.to_str().ok().map(|s| s.to_string()))
    {
        // 2) Decodificamos temp_token como MfaClaims
        #[derive(Serialize, Deserialize)]
        struct MfaClaims { id: i32, exp: usize }

        if let Ok(claims) = TokenService::<MfaClaims>::decode(&Config::get_secret_key(), &temp_token) {
            // 3) Chequeamos expiración del token intermedio
            if (claims.exp as i64) < Utc::now().timestamp() {
                return Err(error::ErrorUnauthorized("Token de 2FA expirado"));
            }
            let user_id = claims.id;

            // 4) Buscamos en otp_cache la entrada para este user_id
            if let Some(mut entry) = otp_cache.get_mut(&user_id) {
                let (stored_code, expires_at) = entry.value();
                // 5) Verificamos que no haya expirado el OTP
                if *expires_at < Utc::now() {
                    otp_cache.remove(&user_id);
                    return Err(error::ErrorUnauthorized("OTP expirado"));
                }
                // 6) Comparamos el código que envió el usuario
                if *stored_code == payload.code {
                    // 7) Código correcto → lo borramos del cache
                    otp_cache.remove(&user_id);

                    // 8) Generamos el JWT definitivo con Claims normales
                    if let Ok(full_token) = TokenService::<Claims>::create(
                        &Config::get_secret_key(),
                        Claims::new(user_id),
                    ) {
                        return Ok(HttpResponse::Ok().json(json!({ "token": full_token })));
                    } else {
                        return Err(error::ErrorInternalServerError("Error generando JWT"));
                    }
                } else {
                    return Err(error::ErrorUnauthorized("Código 2FA inválido"));
                }
            } else {
                // No existe OTP para este user_id en cache
                return Err(error::ErrorUnauthorized("No se encontró OTP de 2FA"));
            }
        }
    }
    // Si no llega “mfa-token” o no decodifica bien, 401:
    Err(error::ErrorUnauthorized("No autorizado"))
}
