use diesel::prelude::*;
use serde::{Deserialize, Serialize};
use validator::Validate;

#[derive(Queryable, Insertable, Serialize, Deserialize, Validate)]
#[diesel(table_name = crate::schema::user)]
#[diesel(check_for_backend(diesel::pg::Pg))]
pub struct User {
    #[serde(skip_deserializing)]
    #[diesel(deserialize_as = i32)]
    pub id: Option<i32>,
    pub name: String,
    pub lastname: String,
    #[serde(skip_serializing)]
    pub password: String,
    #[validate(email)]
    pub email: String,
    pub phone: String
}