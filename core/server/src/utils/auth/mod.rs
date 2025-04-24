use actix_web::cookie;
use anyhow::{self, Result};
use argon2::{Argon2, PasswordHash, PasswordHasher, PasswordVerifier};
use chrono::Utc;
use jsonwebtoken::{Algorithm, DecodingKey, EncodingKey, Header, Validation, decode, encode};
use password_hash::SaltString;
use rand::rngs::OsRng;

use crate::config;
use crate::models::Claims;

use actix_web::cookie::Cookie;

// Las uso para identificar_admin para imprimir el nombre del admin que accedio al recurso
use crate::database::DataBase;

pub struct Auth;

impl Auth {
    pub fn hash_password(password: &str) -> Result<String> {
        let salt = SaltString::generate(&mut OsRng);
        let argon2 = Argon2::default();
        let hash = argon2
            .hash_password(password.as_bytes(), &salt)
            .map_err(|e| anyhow::anyhow!("Hashing error: {:?}", e))?
            .to_string();
        Ok(hash)
    }

    pub fn verify_password(password: &str, hash: &str) -> Result<bool> {
        let parsed_hash =
            PasswordHash::new(hash).map_err(|e| anyhow::anyhow!("Hash parse error: {:?}", e))?;
        Ok(Argon2::default()
            .verify_password(password.as_bytes(), &parsed_hash)
            .is_ok())
    }

    pub fn create_token(secret_key: &String, id: i32) -> Result<String> {
        let my_claims = Claims {
            id,
            exp: config::TOKEN_EXPIRATION_TIME + Utc::now().timestamp() as usize,
        };

        Ok(encode(
            &Header::default(),
            &my_claims,
            &EncodingKey::from_secret(secret_key.as_ref()),
        )?)
    }

    pub fn decode_token(secret_key: &String, token: &str) -> Result<Claims> {
        let token_data = decode::<Claims>(
            token,
            &DecodingKey::from_secret(secret_key.as_ref()),
            &Validation::new(Algorithm::HS256),
        )?;

        Ok(token_data.claims)
    }

    // pub async fn identificar_admin(
    //     db: &DataBase,
    //     token: &str,
    //     secret_key: &str,
    // ) -> anyhow::Result<(i32, String, String, bool)> {
    //     let claims = Self::decode_token(&secret_key.to_string(), token)?;
    //     let admin = db
    //         .get_admin_by_id(claims.id)
    //         .await?
    //         .ok_or_else(|| anyhow::anyhow!("Admin no encontrado"))?;
    //     Ok((admin.admin_id, admin.name, admin.email, admin.is_active))
    // }

    /// The function `get_cookie_with_token` in Rust creates a cookie with a specified token value and
    /// additional security settings.
    #[cfg(feature = "dev")]
    pub fn get_cookie_with_token<'a>(token: &'a str) -> Cookie<'a> {
        Cookie::build("token", token)
            .http_only(true)
            .path("/")
            .finish()
    }

    #[cfg(feature = "dev_ssl")]
    pub fn get_cookie_with_token<'a>(token: &'a str) -> Cookie<'a> {
        Cookie::build("token", token)
            .http_only(true)
            .path("/")
            // .secure(true)
            // .same_site(cookie::SameSite::None)
            .finish()
    }

    #[cfg(feature = "prod")]
    pub fn get_cookie_with_token<'a>(token: &'a str) -> Cookie<'a> {
        Cookie::build("token", token)
            .http_only(true)
            .secure(true)
            .same_site(cookie::SameSite::Strict)
            .path("/")
            .finish()
    }

    /// The function `get_cookie_with_expired_token` creates a cookie with an expired token.
    #[cfg(feature = "dev")]
    pub fn get_cookie_with_expired_token() -> Cookie<'static> {
        Cookie::build("token", "")
            .http_only(true)
            .path("/")
            .expires(cookie::time::OffsetDateTime::now_utc() - cookie::time::Duration::days(1))
            .finish()
    }

    #[cfg(feature = "dev_ssl")]
    pub fn get_cookie_with_expired_token() -> Cookie<'static> {
        Cookie::build("token", "")
            .http_only(true)
            .path("/")
            // .secure(true)
            // .same_site(cookie::SameSite::None)
            .expires(cookie::time::OffsetDateTime::now_utc() - cookie::time::Duration::days(1))
            .finish()
    }

    #[cfg(feature = "prod")]
    pub fn get_cookie_with_expired_token() -> Cookie<'static> {
        Cookie::build("token", "")
            .http_only(true)
            .secure(true)
            .same_site(cookie::SameSite::Strict)
            .path("/")
            .expires(cookie::time::OffsetDateTime::now_utc() - cookie::time::Duration::days(1))
            .finish()
    }
}