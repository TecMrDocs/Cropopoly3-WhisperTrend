/**
* Modelo de Administrador del Sistema
* 
* Define la estructura y operaciones CRUD para administradores del sistema
* con validaciones de datos y credenciales de autenticación segura.
* 
* Autor: Sebastián Antonio Almanza
*/

use crate::{database::Database, schema};
use diesel::prelude::*;
use validator::Validate;
use serde::{Deserialize, Serialize};

/**
* Estructura para credenciales de autenticación de administrador
* 
* @param email Correo electrónico del administrador
* @param password Contraseña en texto plano para autenticación
*/
#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct AdminCredentials {
   pub email: String,
   pub password: String,
}

/**
* Modelo principal de administrador con validaciones y operaciones de base de datos
* 
* Incluye validaciones automáticas de longitud y operaciones CRUD generadas
* mediante macros especializadas para interacción con la base de datos.
* 
* @param id Identificador único del administrador (auto-generado)
* @param email Correo electrónico único (1-255 caracteres)
* @param name Nombre del administrador (1-20 caracteres)
* @param last_name Apellido del administrador (1-20 caracteres)
* @param password Contraseña hasheada (1-150 caracteres, no se serializa)
*/

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
   pub name: String,
   #[validate(length(min = 1, max = 20))]
   pub last_name: String,
   #[validate(length(min = 1, max = 150))]
   #[serde(skip_serializing)]
   pub password: String, 
}