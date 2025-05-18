use crate::scraping::reddit::RedditScraper;
use actix_web::{HttpResponse, Responder, get};

#[get("/reddit/get-posts")]
pub async fn get_posts_reddit() -> impl Responder {
    let posts = RedditScraper::get_posts();
    HttpResponse::Ok().json(posts)
}

pub fn routes() -> actix_web::Scope {
    actix_web::Scope::new("/web")
      .service(get_posts_reddit)
}
