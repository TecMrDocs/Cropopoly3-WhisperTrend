/**
* Módulo de Envío de Correos vía Resend
* 
* Proporciona un endpoint HTTP para el envío de correos electrónicos utilizando
* la API de Resend. Permite definir múltiples destinatarios, asunto y contenido HTML.
* Incluye estructura de datos para la solicitud y registro del scope de rutas.
* 
* Autor: Mariana Balderrábano Aguilar
*/

use resend_rs::types::CreateEmailBaseOptions;
use resend_rs::Resend;
use actix_web::{post, web, HttpResponse, Responder};
use serde::Deserialize;

/**
* Estructura para la solicitud de envío de correo electrónico
* Contiene los destinatarios, asunto y contenido HTML del correo
*/
#[derive(Deserialize)]
pub struct EmailRequest {
    to: Vec<String>,
    subject: String,
    html: String,
}

 /**
* Endpoint que envía correos electrónicos usando la API de Resend.
* Construye la solicitud con la dirección del dominio de Whispertrend con los 
* destinatarios del correo, asunto y contenido HTML.
* Devuelve una respuesta HTTP según el resultado.
* 
* @param email_request que es el body de la solicitud con destinatarios, asunto y contenido HTML
* @return Respuesta HTTP con mensaje de éxito o error
*/
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

/**
 * Configuración de rutas para el módulo de email
 * Define todos los endpoints disponibles bajo el prefijo /email
 * 
 * @return Define el scope  /email y registra el servicio send para enviar correos
 */

pub fn routes() -> actix_web::Scope {
    web::scope("/email")
        .service(send)
}