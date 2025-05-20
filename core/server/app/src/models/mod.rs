mod user;
mod resource;

pub use user::{User, Credentials};

pub use resource::Resource;

use crate::database::Database;

impl Database {
    pub async fn get_user_resources(&self, user_id_value: i32) -> anyhow::Result<Vec<resource::Resource>> {
        Self::query_wrapper(move |conn| {
            use crate::schema::resources::dsl::*;
            use diesel::prelude::*;

            resources
                .filter(user_id.eq(user_id_value))
                .load::<resource::Resource>(conn)
        }).await
    }
}
