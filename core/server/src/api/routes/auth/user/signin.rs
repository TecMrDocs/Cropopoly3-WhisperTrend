use actix_web::{web, HttpRequest, HttpResponse, Responder};
use crate::database::DataBase;


pub async fn signin() -> impl Responder {
    // let conn_info = req.connection_info();
    // let ip = conn_info.realip_remote_addr().unwrap_or("IP desconocida");
    // log::info!("ALGUIEN ENTRO FLACO");
    HttpResponse::Ok().body("Signin")
}