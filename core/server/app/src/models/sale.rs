/**
* Modelo de Venta del Sistema
* 
* Define la estructura y operaciones CRUD para registros de ventas con
* seguimiento temporal mensual y asociación a recursos específicos.
* 
* Autor: Lucio Arturo Reyes Castillo
*/

use crate::{database::Database, schema};
use diesel::prelude::*;
use validator::Validate;

/**
* Modelo principal de venta con validaciones y operaciones de base de datos
* 
* Registra transacciones de venta asociadas a recursos específicos con
* información temporal mensual para análisis de tendencias comerciales.
* 
* @param id Identificador único de la venta (auto-generado)
* @param resource_id ID del recurso vendido
* @param month Mes de la venta (1-12)
* @param year Año de la venta
* @param units_sold Cantidad de unidades vendidas en el período
*/
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