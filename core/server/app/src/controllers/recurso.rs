use crate::{
    config::{Claims, Config},
    database::DbResponder,
    middlewares,
    models::Recurso,
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
pub async fn create_recurso(mut recurso: web::Json<Recurso>) -> Result<impl Responder> {
    if let Err(_) = recurso.validate() {
        return Ok(HttpResponse::Unauthorized().body("Invalid data"));
    }
    let id = Recurso::create(recurso.clone()).await.to_web()?;
    recurso.id = Some(id);

    return Ok(HttpResponse::Ok().json(recurso)) 
}

#[get("/{id}")]
pub async fn get_recurso(req: HttpRequest) -> Result<impl Responder> {
    if let Some(id) = req.match_info().get("id") {
        let id = id.parse::<i32>().map_err(|_| error::ErrorBadRequest("Invalid ID"))?;
        let recurso = Recurso::get_by_id(id).await.to_web()?;

        return match recurso {
            Some(recurso) => Ok(HttpResponse::Ok().json(recurso)),
            None => Ok(HttpResponse::NotFound().finish()),
        };
    }

    error!("No id found in request");
    Ok(HttpResponse::Unauthorized().finish())
}

pub fn routes() -> actix_web::Scope {
    web::scope("/recurso")
        .service(create_recurso)
        .service(get_recurso)
}
