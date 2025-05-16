use argon2::Config;
use jsonwebtoken::{Algorithm, DecodingKey, EncodingKey, Header, Validation, decode, encode};
use rand::Rng;
use serde::{Serialize, de::DeserializeOwned};

pub struct Auth<Claims> {
    _phantom: std::marker::PhantomData<Claims>,
}

impl<Claims: Serialize + DeserializeOwned> Auth<Claims> {
    pub fn new() -> Self {
        Self {
            _phantom: std::marker::PhantomData,
        }
    }

    pub fn hash_password(password: &str) -> anyhow::Result<String> {
        let salt = rand::rng().random::<[u8; 32]>();
        let config = Config::default();
        argon2::hash_encoded(password.as_bytes(), &salt, &config)
            .map_err(|_| anyhow::anyhow!("Failed to hash the password"))
    }

    pub fn verify_password(password: &str, hash: &str) -> anyhow::Result<bool> {
        argon2::verify_encoded(hash, password.as_bytes())
            .map_err(|_| anyhow::anyhow!("Failed to verify the password"))
    }

    pub fn create_token(secret_key: &String, my_claims: Claims) -> anyhow::Result<String> {
        Ok(encode(
            &Header::default(),
            &my_claims,
            &EncodingKey::from_secret(secret_key.as_ref()),
        )?)
    }

    pub fn decode_token(secret_key: &String, token: &str) -> anyhow::Result<Claims> {
        let token_data = decode::<Claims>(
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

    #[derive(Debug, Serialize, Deserialize)]
    pub struct Claims {
        pub id: i32,
        pub exp: usize,
    }

    #[test]
    fn test_hash_password() {
        let password = "password";
        let hash = Auth::<Claims>::hash_password(password).unwrap();
        assert_ne!(password, hash);
    }

    #[test]
    fn test_verify_password() {
        let password = "password";
        let hash = Auth::<Claims>::hash_password(password).unwrap();
        let is_valid = Auth::<Claims>::verify_password(password, &hash).unwrap();
        assert!(is_valid);
    }

    #[test]
    fn test_create_token() {
        let token_expiration_time = 60 * 60 * 24 * 15; // 15 days
        let secret_key = "secret_key";
        let id = 1;

        let claims = Claims {
            id,
            exp: token_expiration_time + chrono::Utc::now().timestamp() as usize,
        };

        let token = Auth::<Claims>::create_token(&secret_key.to_string(), claims).unwrap();
        assert!(!token.is_empty());
    }

    #[test]
    fn test_decode_token() {
        let token_expiration_time = 60 * 60 * 24 * 15; // 15 days
        let secret_key = "secret_key";
        let id = 1;

        let claims = Claims {
            id,
            exp: token_expiration_time + chrono::Utc::now().timestamp() as usize,
        };

        let token = Auth::<Claims>::create_token(&secret_key.to_string(), claims).unwrap();
        let decoded_token = Auth::<Claims>::decode_token(&secret_key.to_string(), &token).unwrap();
        assert_eq!(decoded_token.id, id);
    }
}
