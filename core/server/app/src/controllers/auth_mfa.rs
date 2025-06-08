    // src/controllers/auth_mfa.rs

    use crate::{
        cache::OtpCache,
        config::{Claims, Config},
    };
    use actix_web::{web, HttpRequest, HttpResponse, Responder, Result, error, post};
    use auth::TokenService;
    use chrono::Utc;
    use serde::{Serialize, Deserialize};
    use serde_json::json;

    #[derive(Serialize, Deserialize)]
    pub struct MfaClaims {
        pub id: i32,
        pub exp: usize,
    }

    #[derive(Deserialize)]
    pub struct MfaPayload {
        pub code: String,
    }

    #[post("/mfa")]
    pub async fn verify_mfa(
        req: HttpRequest,
        payload: web::Json<MfaPayload>,
        otp_cache: web::Data<OtpCache>,
    ) -> Result<impl Responder> {
        // 1) Leemos encabezado "mfa-token"
        if let Some(Some(temp_token)) = req
            .headers()
            .get("mfa-token")
            .map(|s| s.to_str().ok().map(String::from))
        {
            // 2) Decodificamos como MfaClaims
            if let Ok(claims) = TokenService::<MfaClaims>::decode(&Config::get_secret_key(), &temp_token) {
                // 3) Expiración del token intermedio
                if (claims.exp as i64) < Utc::now().timestamp() {
                    return Err(error::ErrorUnauthorized("Token de 2FA expirado"));
                }
                let user_id = claims.id;

                // 4) Recuperamos el OTP
                if let Some(mut entry) = otp_cache.get_mut(&user_id) {
                    let (stored_code, expires_at) = entry.value().clone();
                    drop(entry); // Liberamos el bloqueo del cache  
                    // 5) Verificamos caducidad del OTP
                    if expires_at < Utc::now() {
                        otp_cache.remove(&user_id);
                        return Err(error::ErrorUnauthorized("OTP expirado"));
                    }
                    // 6) Comparamos
                    if stored_code == payload.code {
                        otp_cache.remove(&user_id);
                        // 7) Generamos JWT definitivo
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
