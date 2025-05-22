use crate::config::Config;
use lazy_static::lazy_static;
use scrap::{BlockResource, Scraper};
use std::sync::Arc;

pub mod instagram;
pub mod notices;
pub mod reddit;
pub mod trends;

lazy_static! {
    pub static ref SCRAPER: Arc<Scraper> = Arc::new(Scraper::new(
        Config::get_browserless_ws(),
        Config::get_workers_scraper(),
        vec![
            BlockResource::Stylesheet,
            BlockResource::Image,
            BlockResource::Font,
            BlockResource::Media,
        ],
    ));
}
