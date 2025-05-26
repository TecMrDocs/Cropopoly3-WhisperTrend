pub use user::{User, Credentials, BusinessData};
pub use resource::Resource;
pub use sale::Sale;

use crate::database::Database;

use crate::schema;
use diesel::prelude::*;

mod user;
mod resource;
mod sale;

use crate::schema::resources::dsl::*;

impl Database {
    pub async fn get_user_resources(user_id_value: i32) -> anyhow::Result<Vec<Resource>> {
        Self::query_wrapper(move |conn| {
            schema::resources::table
                .filter(user_id.eq(user_id_value))
                .load::<Resource>(conn)
        }).await
    }

    pub async fn get_resource_sales(resource_id_value: i32) -> anyhow::Result<Vec<Sale>> {
        Self::query_wrapper(move |conn| {
            schema::sales::table
                .filter(schema::sales::resource_id.eq(resource_id_value))
                .load::<Sale>(conn)
        }).await
    }


}