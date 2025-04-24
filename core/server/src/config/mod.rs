use lazy_static::lazy_static;

pub struct Config {
    pub database_url: String,
    pub admin_default_email: String,
    pub admin_secret_key: String,
    pub inspector_secret_key: String,
}

lazy_static! {
    pub static ref CONFIG: Config = {
        Config {
            database_url: std::env::var("DATABASE_URL").expect("DATABASE_URL must be set"),
            admin_default_email: std::env::var("ADMIN_DEFAULT_EMAIL")
                .expect("ADMIN_DEFAULT_EMAIL must be set"),
            admin_secret_key: std::env::var("ADMIN_SECRET_KEY")
                .expect("ADMIN_SECRET_KEY must be set"),
            user_secret_key: std::env::var("USER_SECRET_KEY")
                .expect("USER_SECRET_KEY must be set"),
        }
    };
}

// User constants
pub const TOKEN_EXPIRATION_TIME: usize = 60 * 60 * 24 * 15; // 15 days