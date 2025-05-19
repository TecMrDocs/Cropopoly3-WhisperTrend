use crate::{database::Database, schema};
use diesel::prelude::*;
use validator::Validate;

#[derive(Validate, Clone)]
#[macros::diesel_default(schema::recursos)]
#[diesel(primary_key(id))]
#[macros::database(create, update(id), delete(id), get(id))]
pub struct Recursos {
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