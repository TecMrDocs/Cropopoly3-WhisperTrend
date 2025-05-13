use actix_web::{web, HttpResponse, Responder, HttpRequest};
use crate::database::DataBase;
use crate::models::user::User;
use crate::utils::auth::Auth;

pub async fn create_user(
    req: HttpRequest,
    db: web::Data<DataBase>,
    user_data: web::Json<User>,
) -> impl Responder {
    log::info!("Creating user");

    let mut new_user = user_data.into_inner();
    let hash_result = Auth::hash_password(&new_user.password);
    match hash_result {
        Ok(hash) => {
            new_user.password = hash;
            // new_user.id = None;
        },
        Err(_) => return HttpResponse::InternalServerError().body("Error hashing password"),
    }

    match db.create_user(new_user).await {
        Ok(id) => {
            // log::info!(
            //     "POST - /admin/ creado con ID: {} | Req from IP: {} by {} - {} ({})",
            //     id,
            //     ip,
            //     identity.id,
            //     identity.name,
            //     identity.email
            // );
            // HttpResponse::Created().json(id)
            HttpResponse::Ok().body("User created")

        }
        Err(e) => {
            log::error!("Error creando admin: {:?}", e);
            HttpResponse::InternalServerError().body("Error al crear admin")
        }
    }
    


}