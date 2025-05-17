use argon2::Config;
use jsonwebtoken::{Algorithm, DecodingKey, EncodingKey, Header, Validation, decode, encode};
use rand::Rng;
use serde::{Serialize, de::DeserializeOwned};

pub struct PasswordHasher;

impl PasswordHasher {
    pub fn hash(password: &str) -> anyhow::Result<String> {
        let salt = rand::rng().random::<[u8; 32]>();
        let config = Config::default();
        argon2::hash_encoded(password.as_bytes(), &salt, &config)
            .map_err(|_| anyhow::anyhow!("Failed to hash the password"))
    }

    pub fn verify(password: &str, hash: &str) -> anyhow::Result<bool> {
        argon2::verify_encoded(hash, password.as_bytes())
            .map_err(|_| anyhow::anyhow!("Failed to verify the password"))
    }
}

pub struct TokenService<C> {
    _phantom: std::marker::PhantomData<C>,
}

impl<C: Serialize + DeserializeOwned> TokenService<C> {
    pub fn create(secret_key: &str, my_claims: C) -> anyhow::Result<String> {
        Ok(encode(
            &Header::default(),
            &my_claims,
            &EncodingKey::from_secret(secret_key.as_ref()),
        )?)
    }

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
        let token_expiration_time = 60 * 60 * 24 * 15; // 15 days
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
        let token_expiration_time = 60 * 60 * 24 * 15; // 15 days
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
