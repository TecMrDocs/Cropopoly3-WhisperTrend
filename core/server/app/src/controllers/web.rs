use crate::scraping::{
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

#[get("/reddit/get-posts")]
pub async fn get_posts_reddit() -> impl Responder {
    let posts = RedditScraper::get_posts();
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
    
    let params = Params::new(
        query.query,
        start_date,
        end_date,
        query.language,
    );

    match NoticesScraper::get_articles(params).await {
        Ok(notices) => Ok(HttpResponse::Ok().json(notices)),
        Err(e) => {
            warn!("Failed to get notices: {}", e);
            Err(actix_web::error::ErrorBadRequest("Failed to get notices"))
        },
    }
}

pub fn routes() -> actix_web::Scope {
    actix_web::Scope::new("/web")
        .service(get_posts_reddit)
        .service(get_simple_posts_reddit)
        .service(get_notices)
}
