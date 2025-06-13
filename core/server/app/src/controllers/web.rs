/**
* Controlador de Scraping Web - Extracción de Datos de Redes Sociales
* 
* Gestiona la extracción de datos de múltiples plataformas digitales incluyendo
* Twitter, Reddit, Instagram y servicios de noticias con parámetros configurables.
* 
* Autor: Carlos Alberto Zamudio Velázquez
* Contributor: Arturo Barrios Mendoza, Renato García Morán y Santiago Villazón Ponce de León
*/

use crate::scraping::{
   instagram::InstagramScraper,
   notices::{NoticesScraper, Params},
   reddit::RedditScraper,
   twitter::TwitterScraper,
   trends::TrendsScraper,
};
use actix_web::{HttpResponse, Responder, get, post, web};
use serde::{Deserialize, Serialize};
use tracing::warn;

/**
* Estructura de consulta para operaciones de scraping
* 
* @param query Término de búsqueda principal
* @param hashtags Lista opcional de hashtags específicos
* @param startdatetime Fecha de inicio en formato YYYY-MM-DD
* @param enddatetime Fecha de fin en formato YYYY-MM-DD
* @param language Idioma de búsqueda
*/
#[derive(Serialize, Deserialize, Debug)]
pub struct Query {
   query: String,
   hashtags: Option<Vec<String>>,
   startdatetime: String,
   enddatetime: String,
   language: String,
}

/**
* Inicializar sesión de Twitter para scraping
* 
* @return Respuesta de confirmación de login exitoso
*/
#[get("/twitter/login")]
pub async fn get_login_twitter() -> impl Responder {
   let posts = TwitterScraper::login().await;
   HttpResponse::Ok().finish()
}

/**
* Extraer posts de Twitter por hashtag específico
* 
* @param path Hashtag objetivo sin el símbolo #
* @return Lista de posts de Twitter o error interno
*/
#[get("/twitter/hashtag/{tag}")]
pub async fn get_twitter_posts_from_hashtag(path: web::Path<String>) -> impl Responder {
   match TwitterScraper::get_posts(path.into_inner()).await {
       Ok(posts) => HttpResponse::Ok().json(posts),
       Err(_) => HttpResponse::InternalServerError().finish()
   }
}

/**
* Obtener posts básicos de Reddit por palabra clave
* 
* @param path Palabra clave de búsqueda en Reddit
* @return Posts de Reddit con información básica
*/
#[get("/reddit/get-simple-posts/{keyword}")]
pub async fn get_simple_posts_reddit(path: web::Path<String>) -> impl Responder {
   let posts = RedditScraper::get_simple_posts_by_keyword(path.into_inner()).await;
   HttpResponse::Ok().json(posts)
}

/**
* Obtener posts de Reddit con información de miembros del subreddit
* 
* @param path Palabra clave de búsqueda en Reddit
* @return Posts de Reddit con datos extendidos de comunidad
*/
#[get("/reddit/get-simple-posts-with-members/{keyword}")]
pub async fn get_simple_posts_with_members_reddit(path: web::Path<String>) -> impl Responder {
   let posts = RedditScraper::get_simple_posts_with_members(path.into_inner()).await;
   HttpResponse::Ok().json(posts)
}

/**
* Extraer artículos de noticias por criterios de búsqueda
* 
* @param query Parámetros de búsqueda con fechas y términos
* @return Artículos de noticias encontrados o error de validación
*/
#[post("/notices/get-notices")]
pub async fn get_notices(query: web::Json<Query>) -> actix_web::Result<impl Responder> {
   let query = query.into_inner();

   let start_date = match chrono::NaiveDate::parse_from_str(&query.startdatetime, "%Y-%m-%d") {
       Ok(date) => date,
       Err(e) => {
           warn!("Failed to parse start date: {}", e);
           return Err(actix_web::error::ErrorBadRequest("Invalid start date format"));
       }
   };

   let end_date = match chrono::NaiveDate::parse_from_str(&query.enddatetime, "%Y-%m-%d") {
       Ok(date) => date,
       Err(e) => {
           warn!("Failed to parse end date: {}", e);
           return Err(actix_web::error::ErrorBadRequest("Invalid end date format"));
       }
   };

   let params = Params::new(query.query, start_date, end_date, query.language);

   match NoticesScraper::get_articles(params).await {
       Ok(notices) => Ok(HttpResponse::Ok().json(notices)),
       Err(e) => {
           warn!("Failed to get notices: {}", e);
           Err(actix_web::error::ErrorBadRequest("Failed to get notices"))
       }
   }
}

/**
* Obtener detalles extendidos de artículos de noticias
* 
* @param query Parámetros de búsqueda con rango temporal
* @return Detalles completos de noticias o error de procesamiento
*/
#[post("/notices/get-details")]
pub async fn get_details(query: web::Json<Query>) -> actix_web::Result<impl Responder> {
   let query = query.into_inner();

   let start_date = match chrono::NaiveDate::parse_from_str(&query.startdatetime, "%Y-%m-%d") {
       Ok(date) => date,
       Err(e) => {
           warn!("Failed to parse start date: {}", e);
           return Err(actix_web::error::ErrorBadRequest("Invalid start date format"));
       }
   };

   let end_date = match chrono::NaiveDate::parse_from_str(&query.enddatetime, "%Y-%m-%d") {
       Ok(date) => date,
       Err(e) => {
           warn!("Failed to parse end date: {}", e);
           return Err(actix_web::error::ErrorBadRequest("Invalid end date format"));
       }
   };

   let params = Params::new(query.query, start_date, end_date, query.language);

   match NoticesScraper::get_details(params).await {
       Ok(details) => Ok(HttpResponse::Ok().json(details)),
       Err(e) => {
           warn!("Failed to get notices: {}", e);
           Err(actix_web::error::ErrorBadRequest("Failed to get notices"))
       }
   }
}

/**
* Obtener tendencias consolidadas de múltiples plataformas
* 
* @param query Parámetros con hashtags y rango temporal
* @return Datos de tendencias de Instagram, Reddit y Twitter
*/
#[post("/trends/get-trends")]
pub async fn get_trends(query: web::Json<Query>) -> actix_web::Result<impl Responder> {
   let query = query.into_inner();

   let start_date = match chrono::NaiveDate::parse_from_str(&query.startdatetime, "%Y-%m-%d") {
       Ok(date) => date,
       Err(e) => {
           warn!("Failed to parse start date: {}", e);
           return Err(actix_web::error::ErrorBadRequest("Invalid start date format"));
       }
   };

   let end_date = match chrono::NaiveDate::parse_from_str(&query.enddatetime, "%Y-%m-%d") {
       Ok(date) => date,
       Err(e) => {
           warn!("Failed to parse end date: {}", e);
           return Err(actix_web::error::ErrorBadRequest("Invalid end date format"));
       }
   };

   let params = Params::new(query.query, start_date, end_date, query.language);

   match TrendsScraper::get_trends_with_hashtags(params, query.hashtags).await {
       Ok(trends) => Ok(HttpResponse::Ok().json(trends)),
       Err(e) => {
           warn!("Failed to get trends: {}", e);
           Err(actix_web::error::ErrorBadRequest("Failed to get trends"))
       }
   }
}

/**
* Extraer posts de Instagram por hashtag específico
* 
* @param path Hashtag objetivo para búsqueda en Instagram
* @return Posts de Instagram con métricas de engagement
*/
#[get("/instagram/hashtag/{tag}")]
pub async fn get_instagram_posts_from_hashtag(path: web::Path<String>) -> impl Responder {
   match InstagramScraper::get_posts(path.into_inner()).await {
       Ok(posts) => HttpResponse::Ok().json(posts),
       Err(_) => HttpResponse::InternalServerError().finish()
   }
}

/**
* Configuración de rutas del módulo de scraping web
* 
* @return Scope con todos los endpoints de extracción de datos
*/
pub fn routes() -> actix_web::Scope {
   actix_web::Scope::new("/web")
       .service(get_simple_posts_with_members_reddit)
       .service(get_simple_posts_reddit)
       .service(get_notices)
       .service(get_details)
       .service(get_trends)
       .service(get_instagram_posts_from_hashtag)
       .service(get_login_twitter)
       .service(get_twitter_posts_from_hashtag)
}