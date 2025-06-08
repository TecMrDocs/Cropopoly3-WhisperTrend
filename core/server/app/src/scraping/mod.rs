use crate::config::Config;
use lazy_static::lazy_static;
use regex::Regex;
use std::sync::Arc;
use zbrowser::{BlockResource, Scraper};

pub mod instagram;
pub mod notices;
pub mod reddit;
pub mod trends;
pub mod twitter;

lazy_static! {
    // Regex to match multiple whitespace characters and replace with single space
    static ref WHITESPACE_REGEX: Regex = Regex::new(r"\s+").unwrap();
    // Regex to match newlines and carriage returns
    static ref NEWLINE_REGEX: Regex = Regex::new(r"[\n\r]+").unwrap();
    // Regex to parse human-readable numbers (e.g., "1.5k", "2M", "1 millón")
    static ref HUMAN_NUMBER_REGEX: Regex =
        Regex::new(r"^([\d,.]+)\s*([kKmM]il|mill[oó]n|mills?|[kKMGTP])?$").unwrap();

    // Global scraper instance configured with browserless WebSocket and resource blocking
    pub static ref SCRAPER: Arc<Scraper> = Arc::new(Scraper::new::<&str>(
        // None,
        Config::get_browserless_ws(),
        Config::get_workers_scraper(),
        // Block unnecessary resources to improve scraping performance
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
    /// Cleans text by normalizing whitespace and removing newlines
    pub fn clean_text(text: &str) -> String {
        let text = NEWLINE_REGEX.replace_all(text, " ");
        let text = WHITESPACE_REGEX.replace_all(&text, " ");
        text.trim().to_string()
    }

    /// Parses human-readable numbers with suffixes (k, M, mil, millón, etc.) into u32
    /// Examples: "1.5k" -> 1500, "2M" -> 2000000, "1 millón" -> 1000000
    pub fn parse_human_number(text: &str) -> u32 {
        let text = Self::clean_text(text);

        if let Some(captures) = HUMAN_NUMBER_REGEX.captures(&text) {
            if let Some(number_str) = captures.get(1) {
                let number_str = number_str.as_str();
                // Determine multiplier based on suffix
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

                // Try parsing as float with decimal point
                if let Ok(num) = number_str.parse::<f64>() {
                    return (num * multiplier as f64) as u32;
                }

                // Try parsing with comma as decimal separator
                let with_dot = number_str.replace(',', ".");
                if let Ok(num) = with_dot.parse::<f64>() {
                    return (num * multiplier as f64) as u32;
                }

                // Try parsing without comma (thousands separator)
                let without_comma = number_str.replace(',', "");
                if let Ok(num) = without_comma.parse::<f64>() {
                    return (num * multiplier as f64) as u32;
                }

                // Final attempt: remove all punctuation
                let clean_number = number_str.replace(',', "").replace('.', "");
                return (clean_number.parse::<f64>().unwrap_or_default() * multiplier as f64)
                    as u32;
            }
        }

        // Fallback parsing attempts for numbers without suffixes
        if let Ok(num) = text.parse::<f64>() {
            return num as u32;
        }

        if let Ok(num) = text.replace(',', ".").parse::<f64>() {
            return num as u32;
        }

        if let Ok(num) = text.replace(',', "").parse::<f64>() {
            return num as u32;
        }

        // Last resort: strip all punctuation and parse
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
