use resend_rs::types::CreateEmailBaseOptions;
use resend_rs::Resend;
use actix_web::{post, web, HttpResponse, Responder};
use serde::Deserialize;

#[derive(Deserialize)]
pub struct EmailRequest {
    to: Vec<String>,
    subject: String,
    html: String,
}

#[post("/send")]
pub async fn send(email_request: web::Json<EmailRequest>) -> impl Responder {
    let resend = Resend::default(); 

    let from = "WhisperTrend<noreply@whispertrend.lat>";
    let to: Vec<&str> = email_request.to.iter().map(|s| s.as_str()).collect();
    let subject = &email_request.subject;
    let html = &email_request.html;

    let email = CreateEmailBaseOptions::new(from, to, subject).with_html(html);

    match resend.emails.send(email).await {
        Ok(_) => HttpResponse::Ok().body("Correo enviado con éxito"),
        Err(e) => {
            eprintln!("Error: {:?}", e);
            HttpResponse::InternalServerError().body("Error al enviar el correo")
        }
    }
}


pub fn routes() -> actix_web::Scope {
    web::scope("/email")
        .service(send)
}