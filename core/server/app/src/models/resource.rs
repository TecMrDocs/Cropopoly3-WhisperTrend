/**
* Modelo de Recurso del Sistema
* 
* Define la estructura y operaciones CRUD para recursos del sistema con
* validaciones de datos y asociación directa a usuarios propietarios.
* 
* Autor: Renato García Morán
*/

use crate::{database::Database, schema};
use diesel::prelude::*;
use validator::Validate;

/**
* Modelo principal de recurso con validaciones y operaciones de base de datos
* @param id Identificador único del recurso (auto-generado)
* @param user_id ID del usuario propietario del recurso
* @param r_type Tipo de recurso (1-255 caracteres)
* @param name Nombre descriptivo del recurso (1-255 caracteres)
* @param description Descripción detallada del recurso (1-255 caracteres)
* @param related_words Palabras clave asociadas al recurso (1-255 caracteres)
*/
#[derive(Validate, Clone)]
#[macros::diesel_default(schema::resources)]
#[diesel(primary_key(id))]
#[macros::database(create, update(id), delete(id), get(id))]
pub struct Resource {
   #[serde(skip_deserializing)]
   #[diesel(deserialize_as = i32)]
   pub id: Option<i32>,
   pub user_id: i32,
   #[validate(length(min = 1, max = 255))]
   pub r_type: String,
   #[validate(length(min = 1, max = 255))]
   pub name: String,
   #[validate(length(min = 1, max = 255))]
   pub description: String,
   #[validate(length(min = 1, max = 255))]
   pub related_words: String,
}