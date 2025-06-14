/**
 * Módulo de Autenticación y Gestión de Administradores
 * 
 * Este archivo contiene la lógica de autenticación para administradores del sistema,
 * incluyendo registro, inicio de sesión y verificación de tokens JWT.
 * Maneja la creación de cuentas, validación de credenciales y gestión de sesiones seguras.
 * 
 * @author Sebastián Antonio Almanza
 */

use crate::{
  config::{Claims, Config},
  database::DbResponder,
  middlewares,
  models::{AdminCredentials, Admin},
};
use actix_web::{
  HttpMessage, HttpRequest, HttpResponse, Responder, Result, error, get, middleware::from_fn,
  post, web,
};
use auth::{PasswordHasher, TokenService};
use serde_json::json;
use tracing::error;
use validator::Validate;

/**
 * Endpoint para el registro de nuevos administradores en el sistema
 * Valida los datos de entrada, verifica que el email no exista previamente,
 * hashea la contraseña de forma segura y crea el registro en la base de datos
 * 
 * @param admin Datos del administrador a registrar incluyendo email y contraseña
 * @return Respuesta HTTP indicando éxito o fallo del registro
 */
#[post("/register")]
pub async fn register(mut admin: web::Json<Admin>) -> Result<impl Responder> {
  if let Err(_) = admin.validate() {
      return Ok(HttpResponse::Unauthorized().body("Invalid data"));
  }

  if let Ok(None) = Admin::get_by_email(admin.email.clone()).await {
      if let Ok(hash) = PasswordHasher::hash(&admin.password) {
          admin.password = hash.to_string();
          let id = Admin::create(admin.clone()).await.to_web()?;
          admin.id = Some(id);

          return Ok(HttpResponse::Ok().finish());
      }
  } else {
      return Ok(HttpResponse::Unauthorized().body("Email already exists"));
  }
  Err(error::ErrorBadRequest("Failed"))
}

/**
 * Endpoint para el inicio de sesión de administradores
 * Autentica las credenciales proporcionadas, verifica la contraseña
 * y genera un token JWT válido para mantener la sesión activa
 * 
 * @param profile Credenciales del administrador (email y contraseña)
 * @return Respuesta HTTP con token de autenticación o mensaje de error
 */
#[post("/signin")]
pub async fn signin(profile: web::Json<AdminCredentials>) -> impl Responder {
  if let Ok(Some(admin)) = Admin::get_by_email(profile.email.clone()).await {
      if let Ok(true) = PasswordHasher::verify(&profile.password, &admin.password) {
          if let Some(id) = admin.id {
              if let Ok(token) =
                  TokenService::<Claims>::create(&Config::get_secret_key(), Claims::new(id))
              {
                  return HttpResponse::Ok().json(json!({ "token": token }));
              }
          }
      }
  }
  HttpResponse::Unauthorized().body("Email or password is incorrect")
}

/**
 * Endpoint para verificar el estado de autenticación del administrador
 * Valida el token JWT presente en la solicitud y retorna
 * la información del administrador si la sesión es válida
 * 
 * @param req Solicitud HTTP que contiene el token de autenticación en los headers
 * @return Respuesta HTTP con los datos del administrador o error de autorización
 */
#[get("")]
pub async fn check(req: HttpRequest) -> Result<impl Responder> {
  if let Some(id) = req.extensions().get::<i32>() {
      let admin = Admin::get_by_id(*id).await.to_web()?;
      return match admin {
          Some(admin) => Ok(HttpResponse::Ok().json(admin)),
          None => Ok(HttpResponse::NotFound().finish()),
      };
  }

  error!("No id found in request");
  Ok(HttpResponse::Unauthorized().finish())
}

/**
 * Configuración de rutas para el módulo de administradores
 * Define todos los endpoints disponibles bajo el prefijo /admin
 * Incluye rutas públicas para registro/login y rutas protegidas para verificación
 * 
 * @return Scope configurado con todas las rutas del módulo y middlewares aplicados
 */
pub fn routes() -> actix_web::Scope {
  web::scope("/admin")
      .service(register)
      .service(signin)
      .service(
          web::scope("/check")
              .wrap(from_fn(middlewares::auth))
              .service(check),
      )
}