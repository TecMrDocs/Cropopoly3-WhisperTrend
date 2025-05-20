use crate::{
    config::{Claims, Config},
    database::DbResponder,
    middlewares,
    models::Resource,
};
use actix_web::{
    HttpMessage, HttpRequest, HttpResponse, Responder, Result, error, get, middleware::from_fn,
    post, web,
};
use auth::{PasswordHasher, TokenService};
use serde_json::json;
use tracing::error;
use validator::Validate;


#[post("")]
pub async fn create_resource(mut resource: web::Json<Resource>) -> Result<impl Responder> {
    if let Err(_) = resource.validate() {
        return Ok(HttpResponse::Unauthorized().body("Invalid data"));
    }
    let id = Resource::create(resource.clone()).await.to_web()?;
    resource.id = Some(id);

    return Ok(HttpResponse::Ok().json(resource)) 
}

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

pub fn routes() -> actix_web::Scope {
    web::scope("/resource")
        .service(create_resource)
        .service(get_resource)
}
