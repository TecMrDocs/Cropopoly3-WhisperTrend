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

/// Generic token service - SOLO UNA DEFINICIÓN
pub struct TokenService<T> {
    _phantom: std::marker::PhantomData<T>,
}

impl<T> TokenService<T> 
where 
    T: Serialize + DeserializeOwned,
{
    pub fn create(secret_key: &str, claims: T) -> anyhow::Result<String> {
        let header = Header::new(Algorithm::HS256);
        let encoding_key = EncodingKey::from_secret(secret_key.as_ref());
        
        encode(&header, &claims, &encoding_key)
            .map_err(|e| anyhow::anyhow!("Failed to create token: {}", e))
    }
    
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

// Función pública para crear magic tokens (para resolver warning)
pub fn create_magic_token(
    secret_key: &str, 
    user_id: i32, 
    email: String, 
    purpose: &str, 
    ttl_secs: usize
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
/// Provides secure password hashing and verification functionality
pub struct PasswordHasher;

impl PasswordHasher {
    /// Hashes a plain text password using Argon2 algorithm with random salt
    /// 
    /// # Arguments
    /// * `password` - The plain text password to hash
    /// 
    /// # Returns
    /// * `Result<String>` - The hashed password or an error
    pub fn hash(password: &str) -> anyhow::Result<String> {
        // Generate a random 32-byte salt for security
        let salt = rand::rng().random::<[u8; 32]>();
        let config = Config::default();
        argon2::hash_encoded(password.as_bytes(), &salt, &config)
            .map_err(|_| anyhow::anyhow!("Failed to hash the password"))
    }

    /// Verifies a plain text password against a hashed password
    /// 
    /// # Arguments
    /// * `password` - The plain text password to verify
    /// * `hash` - The hashed password to compare against
    /// 
    /// # Returns
    /// * `Result<bool>` - True if password matches, false otherwise, or an error
    pub fn verify(password: &str, hash: &str) -> anyhow::Result<bool> {
        argon2::verify_encoded(hash, password.as_bytes())
            .map_err(|_| anyhow::anyhow!("Failed to verify the password"))
    }
}

/// Generic JWT token service for creating and decoding tokens
/// 
/// # Type Parameters
/// * `C` - The claims type that must implement Serialize and DeserializeOwned
pub struct TokenService<C> {
    _phantom: std::marker::PhantomData<C>,
}

impl<C: Serialize + DeserializeOwned> TokenService<C> {
    /// Creates a new JWT token with the provided claims
    /// 
    /// # Arguments
    /// * `secret_key` - The secret key used to sign the token
    /// * `my_claims` - The claims to embed in the token
    /// 
    /// # Returns
    /// * `Result<String>` - The encoded JWT token or an error
    pub fn create(secret_key: &str, my_claims: C) -> anyhow::Result<String> {
        Ok(encode(
            &Header::default(),
            &my_claims,
            &EncodingKey::from_secret(secret_key.as_ref()),
        )?)
    }

    /// Decodes and verifies a JWT token, extracting the claims
    /// 
    /// # Arguments
    /// * `secret_key` - The secret key used to verify the token signature
    /// * `token` - The JWT token to decode
    /// 
    /// # Returns
    /// * `Result<C>` - The decoded claims or an error
    pub fn decode(secret_key: &str, token: &str) -> anyhow::Result<C> {
        let token_data = decode::<C>(
            token,
            &DecodingKey::from_secret(secret_key.as_ref()),
            &Validation::new(Algorithm::HS256),
        )?;

        Ok(token_data.claims)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde::{Deserialize, Serialize};

    /// Test claims structure for JWT tokens
    /// Contains user ID and expiration timestamp
    #[derive(Debug, Serialize, Deserialize)]
    pub struct Claims {
        pub id: i32,        // User identifier
        pub exp: usize,     // Token expiration time (Unix timestamp)
    }

    /// Test that password hashing produces a different result than the original password
    #[test]
    fn test_hash_password() {
        let password = "password";
        let hash = PasswordHasher::hash(password).unwrap();
        // Ensure the hash is different from the original password
        assert_ne!(password, hash);
    }

    /// Test that password verification works correctly with a valid password
    #[test]
    fn test_verify_password() {
        let password = "password";
        // Hash the password first
        let hash = PasswordHasher::hash(password).unwrap();
        // Verify that the original password matches the hash
        let is_valid = PasswordHasher::verify(password, &hash).unwrap();
        assert!(is_valid);
    }

    /// Test that JWT token creation works and produces a non-empty token
    #[test]
    fn test_create_token() {
        let token_expiration_time = 60 * 60 * 24 * 15; // 15 days in seconds
        let secret_key = "secret_key";
        let id = 1;

        // Create claims with expiration time
        let claims = Claims {
            id,
            exp: token_expiration_time + chrono::Utc::now().timestamp() as usize,
        };

        // Generate JWT token
        let token = TokenService::<Claims>::create(&secret_key.to_string(), claims).unwrap();
        // Ensure token is not empty
        assert!(!token.is_empty());
    }

    /// Test that JWT token decoding correctly extracts the original claims
    #[test]
    fn test_decode_token() {
        let token_expiration_time = 60 * 60 * 24 * 15; // 15 days in seconds
        let secret_key = "secret_key";
        let id = 1;

        // Create claims with expiration time
        let claims = Claims {
            id,
            exp: token_expiration_time + chrono::Utc::now().timestamp() as usize,
        };

        // Create and then decode the token
        let token = TokenService::<Claims>::create(&secret_key.to_string(), claims).unwrap();
        let decoded_token = TokenService::<Claims>::decode(&secret_key.to_string(), &token).unwrap();
        
        // Verify that the decoded ID matches the original
        assert_eq!(decoded_token.id, id);
    }
}
