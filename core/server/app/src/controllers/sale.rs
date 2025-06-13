/**
* Controlador de Ventas del Sistema
* 
* Gestiona las operaciones de creación y consulta de ventas, incluyendo
* registro de transacciones y obtención de datos por recurso específico.
* 
* Autor: Renato García Morán
*/

use crate::{
   database::DbResponder,
   database::Database,
   models::Sale,
};
use actix_web::{
   HttpRequest, HttpResponse, Responder, Result, error, get, post, web,
};
use tracing::error;
use validator::Validate;

/**
* Registrar nueva venta en el sistema
* 
* @param sale Datos de la venta con validación automática
* @return Venta creada con ID asignado o error de validación
*/
#[post("")]
pub async fn create_sale(mut sale: web::Json<Sale>) -> Result<impl Responder> {
   if let Err(_) = sale.validate() {
       return Ok(HttpResponse::Unauthorized().body("Invalid data"));
   }
   let id = Sale::create(sale.clone()).await.to_web()?;
   sale.id = Some(id);

   return Ok(HttpResponse::Ok().json(sale)) 
}

/**
* Obtener venta específica por ID
* 
* @param req Request HTTP con ID de la venta en la ruta
* @return Venta encontrada o respuesta 404 si no existe
*/
#[get("/{id}")]
pub async fn get_sale(req: HttpRequest) -> Result<impl Responder> {
   if let Some(id) = req.match_info().get("id") {
       let id = id.parse::<i32>().map_err(|_| error::ErrorBadRequest("Invalid ID"))?;
       let sale = Sale::get_by_id(id).await.to_web()?;

       return match sale {
           Some(sale) => Ok(HttpResponse::Ok().json(sale)),
           None => Ok(HttpResponse::NotFound().finish()),
       };
   }

   error!("No id found in request");
   Ok(HttpResponse::Unauthorized().finish())
}

/**
* Obtener historial de ventas de un recurso específico
* 
* @param req Request HTTP con ID del recurso en la ruta
* @return Lista de ventas del recurso o array vacío
*/
#[get("/resource/{id}")]
pub async fn get_resource_sales(req: HttpRequest) -> Result<impl Responder> {
   if let Some(id) = req.match_info().get("id") {
       let id = id.parse::<i32>().map_err(|_| error::ErrorBadRequest("Invalid ID"))?;
       let sales = Database::get_resource_sales(id).await.to_web()?;

       return Ok(HttpResponse::Ok().json(sales));
   }

   error!("No id found in request");
   Ok(HttpResponse::Unauthorized().finish())
}

/**
* Configuración de rutas del módulo de ventas
* 
* @return Scope con rutas de creación y consulta de ventas
*/
pub fn routes() -> actix_web::Scope {
   web::scope("/sale")
       .service(create_sale)
       .service(get_sale)
       .service(get_resource_sales)
}