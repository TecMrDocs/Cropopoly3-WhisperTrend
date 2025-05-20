use lazy_static::lazy_static;
use scrap::Scraper;
use std::sync::Arc;

pub mod reddit;

lazy_static! {
    pub static ref SCRAPER: Arc<Scraper> = Arc::new(Scraper::new());
}
