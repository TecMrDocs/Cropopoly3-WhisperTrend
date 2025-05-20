use crate::{database::Database, schema};
use diesel::prelude::*;
use validator::Validate;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct Credentials {
    pub email: String,
    pub password: String,
}

#[derive(Validate, Clone)]
#[macros::diesel_default(schema::users)]
#[diesel(primary_key(id))]
#[macros::database(create, update(id), delete(id), get(email, id))]
pub struct User {
    #[serde(skip_deserializing)]
    #[diesel(deserialize_as = i32)]
    pub id: Option<i32>,
    #[validate(length(min = 1, max = 255))]
    pub email: String,
    #[validate(length(min = 1, max = 20))]
    pub name: String,
    #[validate(length(min = 1, max = 20))]
    pub last_name: String,
    #[validate(length(min = 1, max = 20))]
    pub phone: String,
    #[validate(length(min = 1, max = 20))]
    pub position: String,
    #[validate(length(min = 1, max = 150))]
    #[serde(skip_serializing)]
    pub password: String,
    #[validate(length(min = 1, max = 20))]
    pub plan: String,
    #[validate(length(min = 1, max = 20))]
    pub business_name: String,
    #[validate(length(min = 1, max = 20))]
    pub industry: String,
    #[validate(length(min = 1, max = 20))]
    pub company_size: String,
    #[validate(length(min = 1, max = 20))]
    pub scope: String,
    #[validate(length(min = 1, max = 20))]
    pub locations: String,
    #[validate(length(min = 1, max = 20))]
    pub num_branches: String,
}
