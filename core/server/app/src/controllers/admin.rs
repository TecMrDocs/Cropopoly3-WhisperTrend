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
  /**
   * Validación de los datos de entrada del administrador
   * Utiliza el trait Validate para verificar formato de email,
   * longitud de contraseña y otros criterios de validación
   */
  if let Err(_) = admin.validate() {
      return Ok(HttpResponse::Unauthorized().body("Invalid data"));
  }

  /**
   * Verificación de unicidad del email en el sistema
   * Consulta la base de datos para asegurar que el email no esté registrado
   * Solo procede con el registro si el email está disponible
   */
  if let Ok(None) = Admin::get_by_email(admin.email.clone()).await {
      /**
       * Proceso de hasheo seguro de la contraseña
       * Utiliza algoritmos criptográficos seguros para proteger
       * las contraseñas antes de almacenarlas en la base de datos
       */
      if let Ok(hash) = PasswordHasher::hash(&admin.password) {
          admin.password = hash.to_string();

          /**
           * Creación del registro de administrador en la base de datos
           * Almacena los datos validados y la contraseña hasheada
           * Asigna el ID generado al objeto administrador
           */
          let id = Admin::create(admin.clone()).await.to_web()?;
          admin.id = Some(id);

          return Ok(HttpResponse::Ok().finish());
      }
  } else {
      /**
       * Manejo del caso donde el email ya existe en el sistema
       * Retorna error de no autorizado para prevenir enumeración de emails
       */
      return Ok(HttpResponse::Unauthorized().body("Email already exists"));
  }

  /**
   * Manejo de errores generales en el proceso de registro
   * Cubre casos no contemplados específicamente en las validaciones anteriores
   */
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
  /**
   * Proceso de autenticación completo del administrador
   * Incluye búsqueda por email, verificación de contraseña
   * y generación de token JWT para sesiones autenticadas
   */
  if let Ok(Some(admin)) = Admin::get_by_email(profile.email.clone()).await {
      /**
       * Verificación criptográfica de la contraseña
       * Compara la contraseña proporcionada con el hash almacenado
       * utilizando algoritmos de verificación seguros
       */
      if let Ok(true) = PasswordHasher::verify(&profile.password, &admin.password) {
          if let Some(id) = admin.id {
              /**
               * Generación del token JWT para la sesión autenticada
               * Crea un token firmado con la clave secreta del sistema
               * que incluye los claims necesarios para identificar al usuario
               */
              if let Ok(token) =
                  TokenService::<Claims>::create(&Config::get_secret_key(), Claims::new(id))
              {
                  return HttpResponse::Ok().json(json!({ "token": token }));
              }
          }
      }
  }

  /**
   * Respuesta de error para credenciales inválidas
   * Mensaje genérico para prevenir enumeración de usuarios
   * y ataques de fuerza bruta basados en respuestas específicas
   */
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
  /**
   * Extracción y validación del ID de administrador desde el token
   * El middleware de autenticación ya validó el token y extrajo el ID
   * que se encuentra disponible en las extensiones de la solicitud
   */
  if let Some(id) = req.extensions().get::<i32>() {
      /**
       * Consulta de los datos completos del administrador
       * Utiliza el ID extraído del token para obtener
       * la información actualizada desde la base de datos
       */
      let admin = Admin::get_by_id(*id).await.to_web()?;

      /**
       * Procesamiento de la respuesta basada en el resultado de la consulta
       * Retorna los datos del administrador si existe,
       * o un error 404 si no se encuentra en la base de datos
       */
      return match admin {
          Some(admin) => Ok(HttpResponse::Ok().json(admin)),
          None => Ok(HttpResponse::NotFound().finish()),
      };
  }

  /**
   * Manejo de error crítico cuando no se encuentra ID en la solicitud
   * Esto indica un problema en el middleware de autenticación
   * o manipulación indebida de la solicitud
   */
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
  /**
   * Estructura de rutas con diferentes niveles de protección
   * - Rutas públicas: registro y signin disponibles sin autenticación
   * - Rutas protegidas: check requiere middleware de autenticación válido
   */
  web::scope("/admin")
      .service(register)
      .service(signin)
      .service(
          web::scope("/check")
              .wrap(from_fn(middlewares::auth))
              .service(check),
      )
}