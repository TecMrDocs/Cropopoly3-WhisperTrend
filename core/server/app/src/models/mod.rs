pub use user::{User, Credentials};

pub use resource::Resource;

use crate::database::Database;

use crate::schema;
use diesel::prelude::*;

mod user;
mod resource;

use crate::schema::resources::dsl::*;

impl Database {
    pub async fn get_user_resources(user_id_value: i32) -> anyhow::Result<Vec<Resource>> {
        Self::query_wrapper(move |conn| {
            schema::resources::table
                .filter(user_id.eq(user_id_value))
                .load::<Resource>(conn)
        }).await
    }
}