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
}