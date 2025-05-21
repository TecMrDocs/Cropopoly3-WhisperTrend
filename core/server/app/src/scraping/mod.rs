use crate::config::Config;
use lazy_static::lazy_static;
use scrap::Scraper;
use std::sync::Arc;

pub mod instagram;
pub mod notices;
pub mod reddit;

lazy_static! {
    pub static ref SCRAPER: Arc<Scraper> = Arc::new(Scraper::new(
        Config::get_browserless_ws(),
        Config::get_workers_scraper()
    ));
}
