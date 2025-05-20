use crate::scraping::{notices::NoticesScraper, reddit::RedditScraper};
use actix_web::{HttpResponse, Responder, get, web};

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

#[get("/notices/get-notices")]
pub async fn get_notices() -> impl Responder {
    let notices = NoticesScraper::get_notices();
    HttpResponse::Ok().json(notices)
}

pub fn routes() -> actix_web::Scope {
    actix_web::Scope::new("/web")
        .service(get_posts_reddit)
        .service(get_simple_posts_reddit)
        .service(get_notices)
}
