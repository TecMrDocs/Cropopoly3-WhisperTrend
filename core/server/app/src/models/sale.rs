use crate::{database::Database, schema};
use diesel::prelude::*;
use validator::Validate;

#[derive(Validate, Clone)]
#[macros::diesel_default(schema::sales)]
#[diesel(primary_key(id))]
#[macros::database(create, update(id), delete(id), get(id))]
pub struct Sale {
    #[serde(skip_deserializing)]
    #[diesel(deserialize_as = i32)]
    pub id: Option<i32>,
    pub resource_id: i32,
    pub month: i32,
    pub year: i32,
    pub units_sold: i32,
}