use crate::scraping::SCRAPER;
use lazy_static::lazy_static;
use regex::Regex;
use scraper::{ElementRef, Html, Selector};
use serde::Serialize;
use tracing::{warn};

lazy_static! {
    static ref WHITESPACE_REGEX: Regex = Regex::new(r"\s+").unwrap();
    static ref NEWLINE_REGEX: Regex = Regex::new(r"[\n\r]+").unwrap();
    static ref HUMAN_NUMBER_REGEX: Regex = Regex::new(r"^([\d,.]+)\s*([kKmM]il|mill[oó]n|mills?|[kKMGTP])?$").unwrap();
}

#[derive(Debug, Serialize)]
pub struct Post {
    time: String,
    title: String,
    content: String,
    vote: u32,
    comments: u32,
}

pub struct RedditScraper;

impl RedditScraper {
    fn clean_text(text: &str) -> String {
        let text = NEWLINE_REGEX.replace_all(text, " ");
        let text = WHITESPACE_REGEX.replace_all(&text, " ");
        text.trim().to_string()
    }

    fn parse_human_number(text: &str) -> u32 {
        let text = Self::clean_text(text);
        
        if let Some(captures) = HUMAN_NUMBER_REGEX.captures(&text) {
            let number_str = captures.get(1).unwrap().as_str();
            let multiplier = captures.get(2).map_or(1, |m| {
                match m.as_str().to_lowercase().as_str() {
                    "k" => 1_000,
                    "m" => 1_000_000,
                    "g" => 1_000_000_000,
                    "t" => 1_000_000_000_000_i64,
                    "p" => 1_000_000_000_000_000_i64,
                    "mil" | "kmil" | "mmil" => 1_000,
                    "millón" | "millon" | "mill" | "mills" => 1_000_000,
                    _ => 1,
                }
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
            return (clean_number.parse::<f64>().unwrap_or_default() * multiplier as f64) as u32;
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
        
        text.replace(',', "").replace('.', "")
            .parse::<f64>()
            .unwrap_or_default() as u32
    }

    pub fn get_post(element: ElementRef) -> anyhow::Result<Post> {
        let time_selector = Selector::parse("time")
            .map_err(|e| anyhow::anyhow!("Error parsing time selector: {}", e))?;

        let title_selector = Selector::parse("a[slot='title']")
            .map_err(|e| anyhow::anyhow!("Error parsing title selector: {}", e))?;

        let content_selector = Selector::parse("a[slot='text-body']")
            .map_err(|e| anyhow::anyhow!("Error parsing content selector: {}", e))?;

        let number_selector = Selector::parse("faceplate-number")
            .map_err(|e| anyhow::anyhow!("Error parsing number selector: {}", e))?;

        let time_element = element.select(&time_selector).next();
        let title_element = element.select(&title_selector).next();
        let content_element = element.select(&content_selector).next();

        let mut number_elements = element.select(&number_selector);
        let vote_element = number_elements.next();
        let comments_element = number_elements.next();

        if let (
            Some(time_element),
            Some(title_element),
            Some(vote_element),
            Some(comments_element),
        ) = (
            time_element,
            title_element,
            vote_element,
            comments_element,
        ) {
            let time = time_element.attr("datetime").unwrap_or_default();
            let title = title_element.text().collect::<Vec<_>>().join(" ");
            let content = content_element.map_or_else(String::new, |e| e.text().collect::<Vec<_>>().join(" "));
            let vote = vote_element.text().collect::<Vec<_>>().join(" ");
            let comments = comments_element.text().collect::<Vec<_>>().join(" ");

            return Ok(Post {
                time: time.to_string(),
                title: Self::clean_text(&title),
                content: Self::clean_text(&content),
                vote: Self::parse_human_number(&vote),
                comments: Self::parse_human_number(&comments),
            });
        }

        Err(anyhow::anyhow!(
            "Not found elements, time: {}, title: {}, content: {}, vote: {}, comments: {}",
            time_element.map_or_else(String::new, |e| e.text().collect::<Vec<_>>().join(" ")),
            title_element.map_or_else(String::new, |e| e.text().collect::<Vec<_>>().join(" ")),
            content_element.map_or_else(String::new, |e| e.text().collect::<Vec<_>>().join(" ")),
            vote_element.map_or_else(String::new, |e| e.text().collect::<Vec<_>>().join(" ")),
            comments_element.map_or_else(String::new, |e| e.text().collect::<Vec<_>>().join(" "))
        ))
    }

    pub fn get_posts() -> Vec<Post> {
        let content = SCRAPER.execute(|context| {
            context.navigate("https://www.reddit.com/");
            std::thread::sleep(std::time::Duration::from_secs(3));
            context.get_html()
        });

        let document = Html::parse_document(&content);
        let selector = Selector::parse("article").unwrap();
        let mut posts = Vec::new();
        for element in document.select(&selector) {
            let post = Self::get_post(element);

            match post {
                Ok(post) => posts.push(post),
                Err(e) => warn!("Error: {}", e),
            }
        }

        posts
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_human_number() {
        assert_eq!(RedditScraper::parse_human_number("4"), 4);
        assert_eq!(RedditScraper::parse_human_number("1,6 mil"), 1600);
        assert_eq!(RedditScraper::parse_human_number("1 mil"), 1000);
    }
}
