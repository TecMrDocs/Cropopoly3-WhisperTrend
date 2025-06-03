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
    post, web,
};
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

//------------------------------------------------------------------------------------------REMOVE
/*
#[get("/test-get/{id}")]
pub async fn test_get_by_id(path: web::Path<i32>) -> impl Responder {
    let id = path.into_inner();
    match Resource::get_by_id(id).await {
        Ok(Some(resource)) => HttpResponse::Ok().json(resource),
        Ok(None) => HttpResponse::NotFound().body("Recurso no encontrado"),
        Err(e) => HttpResponse::InternalServerError().body(format!("Error: {:?}", e)),
    }
}

#[get("/ping")]
pub async fn ping() -> impl Responder {
    HttpResponse::Ok().body("pong")
}
    */
//------------------------------------------------------------------------------------------REMOVE

pub fn routes() -> actix_web::Scope {
    web::scope("/resource")
        //.service(ping) //---------------------------------------------------------REMOVE
        //.service(test_get_by_id) //---------------------------------------------------------REMOVE
        .service(create_resource)
        .service(get_resource)
        .service(get_user_resources)
}
