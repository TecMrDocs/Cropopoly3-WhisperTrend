use crate::{database::Database, schema};
use diesel::prelude::*;
use validator::Validate;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct AdminCredentials {
    pub email: String,
<<<<<<< HEAD
    pub contrasena: String,
=======
    pub password: String,
>>>>>>> main
}

#[derive(Validate, Clone)]
#[macros::diesel_default(schema::admins)]
#[diesel(primary_key(id))]
#[macros::database(create, update(id), delete(id), get(email, id))]
pub struct Admin {
    #[serde(skip_deserializing)]
    #[diesel(deserialize_as = i32)]
    pub id: Option<i32>,
    #[validate(length(min = 1, max = 255))]
    pub email: String,
    #[validate(length(min = 1, max = 20))]
<<<<<<< HEAD
    pub nombres: String,
    #[validate(length(min = 1, max = 20))]
    pub apellidos: String,
    #[validate(length(min = 1, max = 150))]
    #[serde(skip_serializing)]
    pub contrasena: String, 
=======
    pub name: String,
    #[validate(length(min = 1, max = 20))]
    pub last_name: String,
    #[validate(length(min = 1, max = 150))]
    #[serde(skip_serializing)]
    pub password: String, 
>>>>>>> main
}
