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

#[derive(Serialize, Deserialize, Debug)]
struct Query {
    query: String,
    startdatetime: String,
    enddatetime: String,
    language: String,
}

#[get("/twitter/login")]
pub async fn get_login_twitter() -> impl Responder {
    let posts = TwitterScraper::login().await;
    HttpResponse::Ok().finish()
}

#[get("/twitter/hashtag/{tag}")]
pub async fn get_twitter_posts_from_hashtag(path: web::Path<String>) -> impl Responder {
    match TwitterScraper::get_posts(path.into_inner()).await {
        Ok(posts) => HttpResponse::Ok().json(posts),
        Err(_) => HttpResponse::InternalServerError().finish()
    }
}

#[get("/reddit/get-simple-posts/{keyword}")]
pub async fn get_simple_posts_reddit(path: web::Path<String>) -> impl Responder {
    let posts = RedditScraper::get_simple_posts_by_keyword(path.into_inner()).await;
    HttpResponse::Ok().json(posts)
}

#[get("/reddit/get-simple-posts-with-members/{keyword}")]
pub async fn get_simple_posts_with_members_reddit(path: web::Path<String>) -> impl Responder {
    let posts = RedditScraper::get_simple_posts_with_members(path.into_inner()).await;
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

    match TrendsScraper::get_trends(params).await {
        Ok(trends) => Ok(HttpResponse::Ok().json(trends)),
        Err(e) => {
            warn!("Failed to get trends: {}", e);
            Err(actix_web::error::ErrorBadRequest("Failed to get trends"))
        }
    }
}

#[get("/instagram/hashtag/{tag}")]
pub async fn get_instagram_posts_from_hashtag(path: web::Path<String>) -> impl Responder {
    match InstagramScraper::get_posts(path.into_inner()).await {
        Ok(posts) => HttpResponse::Ok().json(posts),
        Err(_) => HttpResponse::InternalServerError().finish()
    }
}

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