use actix_web::{HttpRequest, HttpResponse, Responder, web};
use crate::database::DataBase;
use crate::models::user::User;
pub async fn get_users(
    req: HttpRequest,
    db: web::Data<DataBase>,
) -> impl Responder {
    log::info!("ALGUIEN ENTRO FLACO");
    let conn_info = req.connection_info();
    let ip = conn_info.realip_remote_addr().unwrap_or("IP desconocida");
    match db.get_users().await {
        Ok(collected_users) => {
            // log::info!(
            //     "GET - /user/ | Req from IP: {} by {} - {} ({})",
            //     ip,
            //     identity.id,
            //     identity.name,
            //     identity.email
            // );

            let users: Vec<User> =
                collected_users.into_iter().map(Into::into).collect();
            HttpResponse::Ok().json(users)
        }
        Err(e) => {
            // log::error!(
            //     "Error obteniendo inspectores: {:?} | Solicitado por: {} - {} ({})",
            //     e,
            //     identity.id,
            //     identity.name,
            //     identity.email
            // );
            HttpResponse::InternalServerError().body("Error de servidor")
        }
    }
}