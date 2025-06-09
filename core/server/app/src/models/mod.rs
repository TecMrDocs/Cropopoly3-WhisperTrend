// Public exports of model structs and data types
pub use user::{User, Credentials, BusinessData, UserUpdateData};
pub use resource::Resource;
pub use sale::Sale;
pub use admin::{Admin, AdminCredentials};

use crate::database::Database;

use crate::schema;
use diesel::prelude::*;

// Model modules declaration
mod user;
mod resource;
mod sale;
mod admin;

use crate::schema::resources::dsl::*;

// Database query implementations for models
impl Database {
    /// Retrieves all resources owned by a specific user
    pub async fn get_user_resources(user_id_value: i32) -> anyhow::Result<Vec<Resource>> {
        Self::query_wrapper(move |conn| {
            schema::resources::table
                .filter(user_id.eq(user_id_value))
                .load::<Resource>(conn)
        }).await
    }

    /// Retrieves all sales associated with a specific resource
    pub async fn get_resource_sales(resource_id_value: i32) -> anyhow::Result<Vec<Sale>> {
        Self::query_wrapper(move |conn| {
            schema::sales::table
                .filter(schema::sales::resource_id.eq(resource_id_value))
                .load::<Sale>(conn)
        }).await
    }

    // Fix the function name mismatch
#[post("/resend-verification")] // Make sure the route matches
pub async fn resend_email_verification() -> HttpResponse {
    // Your implementation here
    HttpResponse::Ok().json("Verification email sent")
}

// Fix the boolean type issue in email verification
pub async fn verify_email_endpoint(
    token: web::Query<String>,
    db: web::Data<Database>,
) -> HttpResponse {
    let secret_key = std::env::var("JWT_SECRET").unwrap_or_else(|_| "default-secret".to_string());
    
    match MagicLinkService::verify_magic_link(&secret_key, &token, "email_verification") {
        Ok(claims) => {
            // Fix: pass boolean true instead of string
            match User::update_email_verified_by_id(claims.user_id, true).await.to_web() {
                Ok(_) => HttpResponse::Ok().json("Email verified successfully"),
                Err(e) => HttpResponse::InternalServerError().json(format!("Database error: {}", e)),
            }
        }
        Err(e) => HttpResponse::BadRequest().json(format!("Invalid token: {}", e)),
    }
}
}