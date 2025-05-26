use crate::{database::Database, schema};
use diesel::prelude::*;
use validator::Validate;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct Credentials {
    pub email: String,
    pub contrasena: String,
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
    pub nombres: String,
    #[validate(length(min = 1, max = 20))]
    pub apellidos: String,
    #[validate(length(min = 1, max = 150))]
    #[serde(skip_serializing)]
    pub contrasena: String, 
}
