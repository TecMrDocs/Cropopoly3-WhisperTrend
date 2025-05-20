use crate::{database::Database, schema};
use diesel::prelude::*;
use validator::Validate;

#[derive(Validate, Clone)]
#[macros::diesel_default(schema::recursos)]
#[diesel(primary_key(id))]
#[macros::database(create, update(id), delete(id), get(id))]
pub struct Recurso {
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