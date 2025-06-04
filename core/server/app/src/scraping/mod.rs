use crate::config::Config;
use lazy_static::lazy_static;
use regex::Regex;
use std::sync::Arc;
use zbrowser::{BlockResource, Scraper};

pub mod instagram;
pub mod notices;
pub mod reddit;
pub mod trends;

lazy_static! {
    static ref WHITESPACE_REGEX: Regex = Regex::new(r"\s+").unwrap();
    static ref NEWLINE_REGEX: Regex = Regex::new(r"[\n\r]+").unwrap();
    static ref HUMAN_NUMBER_REGEX: Regex =
        Regex::new(r"^([\d,.]+)\s*([kKmM]il|mill[oó]n|mills?|[kKMGTP])?$").unwrap();

    pub static ref SCRAPER: Arc<Scraper> = Arc::new(Scraper::new::<&str>(
        None,
        // Config::get_browserless_ws(),
        Config::get_workers_scraper(),
        vec![
            BlockResource::Stylesheet,
            BlockResource::Image,
            BlockResource::Font,
            BlockResource::Media,
        ],
    ));
}

pub struct Utils;

impl Utils {
    pub fn clean_text(text: &str) -> String {
        let text = NEWLINE_REGEX.replace_all(text, " ");
        let text = WHITESPACE_REGEX.replace_all(&text, " ");
        text.trim().to_string()
    }

    pub fn parse_human_number(text: &str) -> u32 {
        let text = Self::clean_text(text);

        if let Some(captures) = HUMAN_NUMBER_REGEX.captures(&text) {
            if let Some(number_str) = captures.get(1) {
                let number_str = number_str.as_str();
                let multiplier =
                    captures
                        .get(2)
                        .map_or(1, |m| match m.as_str().to_lowercase().as_str() {
                            "k" => 1_000,
                            "m" => 1_000_000,
                            "g" => 1_000_000_000,
                            "t" => 1_000_000_000_000_i64,
                            "p" => 1_000_000_000_000_000_i64,
                            "mil" | "kmil" | "mmil" => 1_000,
                            "millón" | "millon" | "mill" | "mills" => 1_000_000,
                            _ => 1,
                        });

                if let Ok(num) = number_str.parse::<f64>() {
                    return (num * multiplier as f64) as u32;
                }

                let with_dot = number_str.replace(',', ".");
                if let Ok(num) = with_dot.parse::<f64>() {
                    return (num * multiplier as f64) as u32;
                }

                let without_comma = number_str.replace(',', "");
                if let Ok(num) = without_comma.parse::<f64>() {
                    return (num * multiplier as f64) as u32;
                }

                let clean_number = number_str.replace(',', "").replace('.', "");
                return (clean_number.parse::<f64>().unwrap_or_default() * multiplier as f64)
                    as u32;
            }
        }

        if let Ok(num) = text.parse::<f64>() {
            return num as u32;
        }

        if let Ok(num) = text.replace(',', ".").parse::<f64>() {
            return num as u32;
        }

        if let Ok(num) = text.replace(',', "").parse::<f64>() {
            return num as u32;
        }

        text.replace(',', "")
            .replace('.', "")
            .parse::<f64>()
            .unwrap_or_default() as u32
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_human_number() {
        assert_eq!(Utils::parse_human_number("4"), 4);
        assert_eq!(Utils::parse_human_number("1,6 mil"), 1600);
        assert_eq!(Utils::parse_human_number("1 mil"), 1000);
    }
}
