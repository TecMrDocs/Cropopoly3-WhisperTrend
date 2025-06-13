/**
* Controlador de Recursos del Sistema
* 
* Implementa operaciones CRUD completas para la gestión de recursos,
* incluyendo validación de datos y manejo de errores HTTP.
* 
* Autor: Renato García Morán
* Contributor: Arturo Barrios Mendoza
*/

use crate::{
   database::DbResponder,
   database::Database,
   //middlewares,
   models::Resource,
};
use actix_web::{
   //HttpMessage, 
   HttpRequest, HttpResponse, Responder, Result, error, get, 
   //middleware::from_fn,
   post, web, delete, patch,
};
use tracing::error;
use validator::Validate;

/**
* Crear un nuevo recurso en el sistema
* 
* @param resource Datos del recurso a crear con validación automática
* @return Recurso creado con ID asignado o error de validación
*/
#[post("")]
pub async fn create_resource(mut resource: web::Json<Resource>) -> Result<impl Responder> {
   if let Err(_) = resource.validate() {
       return Ok(HttpResponse::Unauthorized().body("Invalid data"));
   }
   let id = Resource::create(resource.clone()).await.to_web()?;
   resource.id = Some(id);

   return Ok(HttpResponse::Ok().json(resource)) 
}

/**
* Obtener un recurso específico por su ID
* 
* @param req Request HTTP con ID del recurso en la ruta
* @return Recurso encontrado o respuesta 404 si no existe
*/
#[get("/{id}")]
pub async fn get_resource(req: HttpRequest) -> Result<impl Responder> {
   if let Some(id) = req.match_info().get("id") {
       let id = id.parse::<i32>().map_err(|_| error::ErrorBadRequest("Invalid ID"))?;
       let resource = Resource::get_by_id(id).await.to_web()?;

       return match resource {
           Some(resource) => Ok(HttpResponse::Ok().json(resource)),
           None => Ok(HttpResponse::NotFound().finish()),
       };
   }

   error!("No id found in request");
   Ok(HttpResponse::Unauthorized().finish())
}

/**
* Obtener todos los recursos asociados a un usuario específico
* 
* @param req Request HTTP con ID del usuario en la ruta
* @return Lista de recursos del usuario o array vacío
*/
#[get("/user/{id}")]
pub async fn get_user_resources(req: HttpRequest) -> Result<impl Responder> {
   if let Some(id) = req.match_info().get("id") {
       let id = id.parse::<i32>().map_err(|_| error::ErrorBadRequest("Invalid ID"))?;
       let resources = Database::get_user_resources(id).await.to_web()?;

       return Ok(HttpResponse::Ok().json(resources));
   }

   error!("No id found in request");
   Ok(HttpResponse::Unauthorized().finish())
}

/**
* Eliminar un recurso específico del sistema
* 
* @param req Request HTTP con ID del recurso a eliminar
* @return Confirmación de eliminación o error si no existe
*/
#[delete("/{id}")]
pub async fn delete_resource(req: HttpRequest) -> Result<impl Responder> {
   if let Some(id_str) = req.match_info().get("id") {
       let id = id_str.parse::<i32>().map_err(|_| error::ErrorBadRequest("Invalid ID"))?;
       Resource::delete_by_id(id).await.to_web()?;

       return Ok(HttpResponse::Ok().finish());
   }

   error!("No id found in request");
   Ok(HttpResponse::Unauthorized().finish())
}

/**
* Actualizar datos de un recurso existente
* 
* @param req Request HTTP con ID del recurso
* @param updated_resource Nuevos datos del recurso con validación
* @return Confirmación de actualización o error de validación
*/
#[patch("/{id}")]
pub async fn update_resource(
   req: HttpRequest,
   updated_resource: web::Json<Resource>,
) -> Result<impl Responder> {
   if let Some(id_str) = req.match_info().get("id") {
       let id = id_str.parse::<i32>().map_err(|_| error::ErrorBadRequest("Invalid ID"))?;

       let mut data = updated_resource.into_inner();
       data.id = Some(id);

       if let Err(_) = data.validate() {
           return Ok(HttpResponse::BadRequest().body("Datos inválidos"));
       }

       Resource::update_by_id(data).await.to_web()?;
       return Ok(HttpResponse::Ok().finish());
   }

   error!("No se encontró el ID en la ruta");
   Ok(HttpResponse::Unauthorized().finish())
}

/**
* Configuración de rutas del módulo de recursos
* 
* @return Scope con todas las rutas CRUD configuradas
*/
pub fn routes() -> actix_web::Scope {
   web::scope("/resource")
       .service(create_resource)
       .service(get_resource)
       .service(get_user_resources)
       .service(delete_resource)
       .service(update_resource)
}