use crate::{database::Database, schema};
use diesel::prelude::*;
use validator::Validate;

#[derive(Validate, Clone)]
#[macros::database(create, update(id), delete(id), get(id))]
#[macros::diesel_default(schema::recurso)]
#[diesel(primary_key(id))]
pub struct Recurso {
    #[serde(skip_deserializing)]
    #[diesel(deserialize_as = i32)]
    pub id: Option<i32>,
    pub id_usuario: i32,
    #[validate(length(min = 1, max = 255))]
    pub tipo: String,
    #[validate(length(min = 1, max = 255))]
    pub nombre: String,
    #[validate(length(min = 1, max = 255))]
    pub descripcion: String,
    #[validate(length(min = 1, max = 255))]
    pub palabras_rel: String,
}