/**
* Módulo de Modelos de Datos del Sistema
* 
* Centraliza la definición de estructuras de datos y operaciones de base de datos
* para usuarios, recursos, ventas y administradores con consultas especializadas.
* 
* Autor: Renato García Morán
*/

/**
* Exportaciones públicas de estructuras y tipos de datos del sistema
*/
pub use user::{User, Credentials, BusinessData, UserUpdateData};
pub use resource::Resource;
pub use sale::Sale;
pub use admin::{Admin, AdminCredentials};

use crate::database::Database;
use crate::schema;
use diesel::prelude::*;

/**
* Declaración de módulos de modelos del sistema
*/
mod user;
mod resource;
mod sale;
mod admin;

/**
* Implementaciones de consultas especializadas para modelos de datos
* 
* Extiende la funcionalidad base de Database con consultas específicas
* que requieren joins o filtros complejos entre múltiples tablas.
*/
impl Database {

   pub async fn get_user_resources(user_id_value: i32) -> anyhow::Result<Vec<Resource>> {
       Self::query_wrapper(move |conn| {
           schema::resources::table
               .filter(schema::resources::user_id.eq(user_id_value))
               .load::<Resource>(conn)
       }).await
   }

   pub async fn get_resource_sales(resource_id_value: i32) -> anyhow::Result<Vec<Sale>> {
       Self::query_wrapper(move |conn| {
           schema::sales::table
               .filter(schema::sales::resource_id.eq(resource_id_value))
               .load::<Sale>(conn)
       }).await
   }
}