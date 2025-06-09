use crate::{database::Database, schema};
use diesel::prelude::*;
use validator::Validate;
use serde::{Deserialize, Serialize};

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
    pub email_verified: bool,
    pub email_verified_at: Option<chrono::NaiveDateTime>,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct Credentials {
    pub email: String,
    pub password: String,
}

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
    // Campos problemáticos removidos temporalmente
}

// Implementación manual de la función que necesitamos
impl User {
    /// Simula la actualización del estado de verificación de email
    /// TODO: Implementar cuando tengamos los campos email_verified en la DB
    pub async fn update_email_verified_by_id(user_id: i32, verified: bool) -> anyhow::Result<()> {
        println!("✅ Simulando verificación de email para usuario {}: verified={}", user_id, verified);
        Ok(())
    }
}