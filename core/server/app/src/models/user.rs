use crate::{database::Database, schema};
use diesel::prelude::*;
use validator::Validate;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct Credentials {
    pub email: String,
    pub password: String,
}

#[macros::diesel_default]
#[derive(Validate, Clone)]
#[diesel(primary_key(id))]
#[macros::database(create, update(id), delete(id), get(email))]
#[diesel(table_name = schema::users)]
pub struct User {
    #[serde(skip_deserializing)]
    #[diesel(deserialize_as = i32)]
    pub id: Option<i32>,
    #[validate(length(min = 1, max = 20))]
    pub username: String,
    #[validate(length(min = 1, max = 255))]
    pub email: String,
    #[validate(length(min = 1, max = 150))]
    pub password: String,
}
