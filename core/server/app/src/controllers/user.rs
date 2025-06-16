/**
* Controlador de Usuarios del Sistema
* 
* Gestiona las operaciones de creación y consulta individual o general de usuario,
* así como la actualización de datos empresariales y de perfil.
* 
* Autor: Mariana Balderrábano Aguilar
* Contribuyentes: Arturo Barrios Mendoza y Carlos Alberto Zamudio Velázquez
*/

use crate::{
    database::DbResponder,
    //middlewares,
    models::{User, BusinessData, UserUpdateData},
};
use actix_web::{
    // HttpMessage, 
    HttpRequest, HttpResponse, Responder, Result, error, get, 
    // middleware::from_fn,
    post, web,
};
use auth::PasswordHasher;
use tracing::error;
use validator::Validate;

/**
* Endpoint para crear un nuevo usuario en el sistema. 
*
* @param user Datos del usuario a registrar
* @return HTTP 200 si se crea correctamente, 401 si ya existe o es inválido
*/
#[post("")]
pub async fn create_user(mut user: web::Json<User>) -> Result<impl Responder> {
    if let Err(_) = user.validate() {
        return Ok(HttpResponse::Unauthorized().body("Invalid data"));
    }

    if let Ok(None) = User::get_by_email(user.email.clone()).await {
        if let Ok(hash) = PasswordHasher::hash(&user.password) {
            user.password = hash.to_string();

            let id = User::create(user.clone()).await.to_web()?;
            user.id = Some(id);

            return Ok(HttpResponse::Ok().finish());
        }
    } else {
        return Ok(HttpResponse::Unauthorized().body("Email already exists"));
    }

    Err(error::ErrorBadRequest("Failed"))
}

/**
* Endpoint que obtiene un usuario específico por ID.
* 
* @param id que es el identificador del usuario. 
* @return JSON del usuario o error 404 si no existe.
*/
#[get("/{id}")]
pub async fn get_user(req: HttpRequest) -> Result<impl Responder> {
    if let Some(id) = req.match_info().get("id") {
        let id = id.parse::<i32>().map_err(|_| error::ErrorBadRequest("Invalid ID"))?;
        let user = User::get_by_id(id).await.to_web()?;

        return match user {
            Some(user) => Ok(HttpResponse::Ok().json(user)),
            None => Ok(HttpResponse::NotFound().finish()),
        };
    }

    error!("No id found in request");
    Ok(HttpResponse::Unauthorized().finish())
}

/**
* Endpoint que obtiene todos los usuarios del sistema.
*
* @return Lista de usuarios en formato JSON.
*/
#[get("")]
pub async fn get_all_users() -> Result<impl Responder> {
    let users = User::get_all().await.to_web()?;

    return Ok(HttpResponse::Ok().json(users));
}

/**
* Endpoint para actualizar los datos empresariales de un usuario.
*
* @param id que es el identificador del usuario a actualizar.
* @param data que son los datos empresariales a actualizar en formato JSON.
* @return HTTP 200 si se actualiza correctamente, error 400 si falta el ID o es inválido.
*/
#[post("/update/{id}")]
pub async fn update_user_business_data(
    req: HttpRequest,
    data: web::Json<BusinessData>,
) -> Result<impl Responder> {
    let Some(id_str) = req.match_info().get("id") else {
        return Err(error::ErrorBadRequest("Missing user ID"));
    };

    let id = id_str.parse::<i32>().map_err(|_| error::ErrorBadRequest("Invalid ID"))?;

    if let Ok(_) = User::update_business_name_and_industry_and_company_size_and_scope_and_locations_and_num_branches_by_id(
        id,
        data.business_name.clone(),
        data.industry.clone(),
        data.company_size.clone(),
        data.scope.clone(),
        data.locations.clone(),
        data.num_branches.clone(),
    )
    .await
    .to_web()
    {
        return Ok(HttpResponse::Ok().finish());
    }

    Err(error::ErrorInternalServerError("Failed to update user business data"))
}

/**
* Endpoint para actualizar los datos de perfil de un usuario.
*
* @param id que es el identificador del usuario a actualizar.
* @param data que son los datos de perfil a actualizar en formato JSON.
* @return HTTP 200 si se actualiza correctamente, error 400 si falta el ID o es inválido.
*/
#[post("/update/profile/{id}")]
pub async fn update_user_profile_data(
    req: HttpRequest,
    data: web::Json<UserUpdateData>,
) -> Result<impl Responder> {
    let Some(id_str) = req.match_info().get("id") else {
        return Err(error::ErrorBadRequest("Missing user ID"));
    };

    let id = id_str.parse::<i32>().map_err(|_| error::ErrorBadRequest("Invalid ID"))?;

    if let Err(_) = data.validate() {
        return Ok(HttpResponse::BadRequest().body("Datos inválidos"));
    }

    let result = User::update_name_and_last_name_and_phone_and_position_by_id(
        id,
        data.name.clone(),
        data.last_name.clone(),
        data.phone.clone(),
        data.position.clone(),
    )
    .await
    .to_web();

    match result {
        Ok(_) => Ok(HttpResponse::Ok().finish()),
        Err(_) => Err(error::ErrorInternalServerError("Error actualizando perfil de usuario")),
    }
}

/**
* Configuración de rutas para el módulo de usuario
* Define todos los endpoints disponibles bajo el prefijo /user
*
* @return Define el scope /user y registra los servicios create_user, get_user, get_all_users,
* update_user_business_data y update_user_profile_data.
*/
pub fn routes() -> actix_web::Scope {
    web::scope("/user")
        .service(create_user)
        .service(get_user)
        .service(get_all_users)
        .service(update_user_business_data)
        .service(update_user_profile_data)
        // .service(update_password)
}
