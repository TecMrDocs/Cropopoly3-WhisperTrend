use crate::{database::Database, schema};
use diesel::prelude::*;
use validator::Validate;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Mutex;
use once_cell::sync::Lazy;

pub static VERIFIED_USERS: Lazy<Mutex<HashMap<i32, bool>>> = Lazy::new(||
    Mutex::new(HashMap::new())
);

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
}

impl User {
    pub async fn update_email_verified_by_id(user_id: i32, verified: bool) -> anyhow::Result<()> {
        VERIFIED_USERS.lock().unwrap().insert(user_id, verified);
        // println!("En memoria: usuario {} → verified = {}", user_id, verified);
        Ok(())
    }

    pub async fn is_email_verified(user_id: i32) -> anyhow::Result<bool> {
        let verified = VERIFIED_USERS.lock().unwrap().get(&user_id).copied().unwrap_or(false);
        // println!("is_email_verified usuario {} → {}", user_id, verified);
        Ok(verified)
    }
}