/**
* Biblioteca de macros procedurales para generación automática de código Diesel ORM.
* 
* Este módulo contiene macros procedurales que automatizan la creación de código
* boilerplate para operaciones CRUD con Diesel ORM. Incluye el macro diesel_default
* para aplicar traits comunes automáticamente y el macro database para generar
* métodos CRUD completos (create, read, update, delete) con sintaxis declarativa
* flexible que soporta operaciones complejas de filtrado y actualización.
* 
* Autor: Carlos Alberto Zamudio Velázquez
* Contribuyentes: Mariana Balderrábano Aguilar
*/

use argon2::Config;
use jsonwebtoken::{Algorithm, DecodingKey, EncodingKey, Header, Validation, decode, encode};
use rand::Rng;
use serde::{Serialize, Deserialize, de::DeserializeOwned};
use chrono::Utc;

/// Claims específicos para magic links de verificación
#[derive(Debug, Serialize, Deserialize)]
pub struct MagicLinkClaims {
    pub user_id: i32,
    pub email: String,
    pub purpose: String,
    pub exp: usize,
    pub iat: usize,
}

/// Generic JWT token service - UNA SOLA DEFINICIÓN
pub struct TokenService<T> {
    _phantom: std::marker::PhantomData<T>,
}

impl<T> TokenService<T> 
where 
    T: Serialize + DeserializeOwned,
{
    /// Creates a new JWT token with the provided claims
    pub fn create(secret_key: &str, claims: T) -> anyhow::Result<String> {
        let header = Header::new(Algorithm::HS256);
        let encoding_key = EncodingKey::from_secret(secret_key.as_ref());
        
        encode(&header, &claims, &encoding_key)
            .map_err(|e| anyhow::anyhow!("Failed to create token: {}", e))
    }
    
    /// Decodes and verifies a JWT token, extracting the claims
    pub fn decode(secret_key: &str, token: &str) -> anyhow::Result<T> {
        let decoding_key = DecodingKey::from_secret(secret_key.as_ref());
        let validation = Validation::new(Algorithm::HS256);
        
        decode::<T>(token, &decoding_key, &validation)
            .map(|token_data| token_data.claims)
            .map_err(|e| anyhow::anyhow!("Failed to decode token: {}", e))
    }
}

/// Servicio especializado para magic links
pub struct MagicLinkService;

impl MagicLinkService {
    /// Crea un token de magic link para verificación de email
    pub fn create_email_verification_token(
        secret_key: &str,
        user_id: i32,
        email: String,
    ) -> anyhow::Result<String> {
        let now = Utc::now().timestamp() as usize;
        let expiration = now + (60 * 15); // 15 minutos de validez
        
        let claims = MagicLinkClaims {
            user_id,
            email,
            purpose: "email_verification".to_string(),
            exp: expiration,
            iat: now,
        }; 

        TokenService::<MagicLinkClaims>::create(secret_key, claims)
    }

    /// Crea un token de magic link para reset de contraseña
    pub fn create_password_reset_token(
        secret_key: &str,
        user_id: i32,
        email: String,
    ) -> anyhow::Result<String> {
        let now = Utc::now().timestamp() as usize;
        let expiration = now + (60 * 30); // 30 minutos para reset de password
        
        let claims = MagicLinkClaims {
            user_id,
            email,
            purpose: "password_reset".to_string(),
            exp: expiration,
            iat: now,
        };

        TokenService::<MagicLinkClaims>::create(secret_key, claims)
    }

    /// Verifica y decodifica un magic link token
    pub fn verify_magic_link(
        secret_key: &str,
        token: &str,
        expected_purpose: &str,
    ) -> anyhow::Result<MagicLinkClaims> {
        let claims = TokenService::<MagicLinkClaims>::decode(secret_key, token)?;
        
        // Verificar que el propósito coincide
        if claims.purpose != expected_purpose {
            return Err(anyhow::anyhow!("Invalid token purpose"));
        }
        
        // Verificar expiración (aunque JWT ya lo hace, doble verificación)
        let now = Utc::now().timestamp() as usize;
        if claims.exp < now {
            return Err(anyhow::anyhow!("Token expired"));
        }
        
        Ok(claims)
    }
}

/// Función pública para crear magic tokens (para resolver warning)
pub fn create_magic_token(
    secret_key: &str, 
    user_id: i32, 
    email: String, 
    purpose: &str, 
    _ttl_secs: usize  // Agregué _ para evitar warning de parámetro no usado
) -> anyhow::Result<String> {
    match purpose {
        "email_verification" => {
            MagicLinkService::create_email_verification_token(secret_key, user_id, email)
        }
        "password_reset" => {
            MagicLinkService::create_password_reset_token(secret_key, user_id, email)
        }
        _ => Err(anyhow::anyhow!("Invalid purpose: {}", purpose))
    }
}

/// Password hashing utility struct using Argon2 algorithm
pub struct PasswordHasher;

impl PasswordHasher {
    /// Hashes a plain text password using Argon2 algorithm with random salt
    pub fn hash(password: &str) -> anyhow::Result<String> {
        use rand::RngCore;  // Import local
        
        let mut salt = [0u8; 32];
        rand::thread_rng().fill_bytes(&mut salt);  
        
        let config = Config::default();
        argon2::hash_encoded(password.as_bytes(), &salt, &config)
            .map_err(|_| anyhow::anyhow!("Failed to hash the password"))
    }

    /// Verifies a plain text password against a hashed password
    pub fn verify(password: &str, hash: &str) -> anyhow::Result<bool> {
        argon2::verify_encoded(hash, password.as_bytes())
            .map_err(|_| anyhow::anyhow!("Failed to verify the password"))
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde::{Deserialize, Serialize};

    /// Test claims structure for JWT tokens
    #[derive(Debug, Serialize, Deserialize)]
    pub struct Claims {
        pub id: i32,
        pub exp: usize,
    }

    #[test]
    fn test_hash_password() {
        let password = "password";
        let hash = PasswordHasher::hash(password).unwrap();
        assert_ne!(password, hash);
    }

    #[test]
    fn test_verify_password() {
        let password = "password";
        let hash = PasswordHasher::hash(password).unwrap();
        let is_valid = PasswordHasher::verify(password, &hash).unwrap();
        assert!(is_valid);
    }

    #[test]
    fn test_create_token() {
        let token_expiration_time = 60 * 60 * 24 * 15;
        let secret_key = "secret_key";
        let id = 1;

        let claims = Claims {
            id,
            exp: token_expiration_time + chrono::Utc::now().timestamp() as usize,
        };

        let token = TokenService::<Claims>::create(&secret_key.to_string(), claims).unwrap();
        assert!(!token.is_empty());
    }

    #[test]
    fn test_decode_token() {
        let token_expiration_time = 60 * 60 * 24 * 15;
        let secret_key = "secret_key";
        let id = 1;

        let claims = Claims {
            id,
            exp: token_expiration_time + chrono::Utc::now().timestamp() as usize,
        };

        let token = TokenService::<Claims>::create(&secret_key.to_string(), claims).unwrap();
        let decoded_token = TokenService::<Claims>::decode(&secret_key.to_string(), &token).unwrap();
        
        assert_eq!(decoded_token.id, id);
    }
}