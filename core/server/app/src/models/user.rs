use crate::{database::Database, schema};
use diesel::prelude::*;

#[macros::diesel_default]
#[diesel(primary_key(id))]
#[macros::database(create, update(id), delete(id), get(id))]
#[diesel(table_name = schema::users)]
pub struct User {
    #[serde(skip_deserializing)]
    #[diesel(deserialize_as = i32)]
    pub id: Option<i32>,
    pub username: String,
    pub email: String,
    pub password: String,
}
