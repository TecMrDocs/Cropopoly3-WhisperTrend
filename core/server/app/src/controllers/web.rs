use crate::scraping::{
    instagram::InstagramScraper,
    notices::{NoticesScraper, Params},
    reddit::RedditScraper,
};
use actix_web::{HttpResponse, Responder, get, post, web};
use serde::{Deserialize, Serialize};
use tracing::warn;

#[derive(Serialize, Deserialize, Debug)]
struct Query {
    query: String,
    startdatetime: String,
    enddatetime: String,
    language: String,
}

#[get("/reddit/get-simple-posts-with-members/{keyword}")]
pub async fn get_simple_posts_with_members_reddit(path: web::Path<String>) -> impl Responder {
    let posts = RedditScraper::get_simple_posts_with_members(path.into_inner()).await;
    HttpResponse::Ok().json(posts)
}

#[get("/reddit/get-simple-posts/{keyword}")]
pub async fn get_simple_posts_reddit(path: web::Path<String>) -> impl Responder {
    let posts = RedditScraper::get_simple_posts_by_keyword(path.into_inner());
    HttpResponse::Ok().json(posts)
}

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

#[get("/instagram/login")]
pub async fn login_instagram() -> impl Responder {
    match InstagramScraper::login().await {
        Ok(msg) => HttpResponse::Ok().json(serde_json::json!({
            "status": "success",
            "message": msg,
        })),
        Err(e) => HttpResponse::InternalServerError().json(serde_json::json!({
            "status": "error",
            "message": format!("Login failed: {}", e),
        })),
    }
}

#[get("/instagram/get-posts/{hashtag}")]
pub async fn get_posts_instagram(path: web::Path<String>) -> impl Responder {
    let hashtag = path.into_inner();
    let posts = InstagramScraper::get_posts_by_hashtag(&hashtag, 5);
    HttpResponse::Ok().json(posts)
}

pub fn routes() -> actix_web::Scope {
    actix_web::Scope::new("/web")
        .service(get_simple_posts_with_members_reddit)
        .service(get_simple_posts_reddit)
        .service(get_notices)
        .service(get_details)
        .service(login_instagram)
        .service(get_posts_instagram)
}
