/**
* Modelo de Usuario del Sistema
* 
* Define la estructura completa de usuarios con datos personales y empresariales,
* incluyendo sistema de verificación de email y operaciones CRUD especializadas.
* 
* Autor: Renato García Morán
*/

use crate::{database::Database, schema};
use diesel::prelude::*;
use validator::Validate;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Mutex;
use once_cell::sync::Lazy;

/**
* Cache global para estado de verificación de usuarios
* 
* Almacena temporalmente el estado de verificación de email de usuarios
* para acceso rápido sin consultas constantes a base de datos.
*/
pub static VERIFIED_USERS: Lazy<Mutex<HashMap<i32, bool>>> = Lazy::new(||
   Mutex::new(HashMap::new())
);

/**
* Estructura de datos empresariales del usuario
* 
* @param business_name Nombre de la empresa (1-50 caracteres)
* @param industry Sector industrial (1-50 caracteres)
* @param company_size Tamaño de la empresa (1-50 caracteres)
* @param scope Alcance geográfico (1-50 caracteres)
* @param locations Ubicaciones de operación (1-50 caracteres)
* @param num_branches Número de sucursales (1-50 caracteres)
*/
#[derive(Debug, Clone, Deserialize, Serialize, Validate)]
pub struct BusinessData {   
   #[validate(length(min = 1, max = 50))]
   pub business_name: String,
   #[validate(length(min = 1, max = 50))]
   pub industry: String,
   #[validate(length(min = 1, max = 50))]
   pub company_size: String,
   #[validate(length(min = 1, max = 50))]
   pub scope: String,
   #[validate(length(min = 1, max = 50))]
   pub locations: String,
   #[validate(length(min = 1, max = 50))]
   pub num_branches: String,
}

/**
* Credenciales de autenticación de usuario
* 
* @param email Correo electrónico del usuario
* @param password Contraseña en texto plano para autenticación
*/
#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct Credentials {
   pub email: String,
   pub password: String,
}

/**
* Estructura para actualización de datos personales del usuario
* 
* @param name Nombre del usuario (1-20 caracteres)
* @param last_name Apellido del usuario (1-20 caracteres)
* @param phone Teléfono de contacto (1-20 caracteres)
* @param position Cargo en la empresa (1-20 caracteres)
*/
#[derive(Debug, Clone, Deserialize, Validate)]
pub struct UserUpdateData {
   #[validate(length(min = 1, max = 20))]
   pub name: String,
   #[validate(length(min = 1, max = 20))]
   pub last_name: String,
   #[validate(length(min = 1, max = 20))]
   pub phone: String,
   #[validate(length(min = 1, max = 20))]
   pub position: String,
}

/**
* Modelo principal de usuario con datos completos y operaciones especializadas
* 
* Combina información personal, empresarial y de autenticación con múltiples
* tipos de actualización mediante macros especializadas de base de datos.
*/
#[derive(Validate, Clone)]
#[macros::diesel_default(schema::users)]
#[diesel(primary_key(id))]
#[macros::database(create, delete(id), get(email, id), get_all)]
#[macros::database(update(id))]
#[macros::database(update(id{business_name,industry,company_size,scope,locations,num_branches}))]
#[macros::database(update(id{name,last_name,phone,position}))]
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

/**
* Implementación de métodos especializados para verificación de email
*/
impl User {
   pub async fn update_email_verified_by_id(user_id: i32, verified: bool) -> anyhow::Result<()> {
       VERIFIED_USERS.lock().unwrap().insert(user_id, verified);
       Ok(())
   }
   pub async fn is_email_verified(user_id: i32) -> anyhow::Result<bool> {
       let verified = VERIFIED_USERS.lock().unwrap().get(&user_id).copied().unwrap_or(false);
       Ok(verified)
   }
}