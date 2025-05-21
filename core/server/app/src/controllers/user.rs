use crate::{
    database::DbResponder,
    //middlewares,
    models::{User, BusinessData},
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

// Obtener usuario por id
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

#[get("")]
pub async fn get_all_users() -> Result<impl Responder> {
    let users = User::get_all().await.to_web()?;

    return Ok(HttpResponse::Ok().json(users));
}

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



pub fn routes() -> actix_web::Scope {
    web::scope("/user")
        .service(create_user)
        .service(get_user)
        .service(get_all_users)
        .service(update_user_business_data)
}
