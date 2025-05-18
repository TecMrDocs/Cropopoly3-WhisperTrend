use crate::scraping::SCRAPER;
use lazy_static::lazy_static;
use regex::Regex;
use scraper::{ElementRef, Html, Selector};
use serde::Serialize;
use tracing::{warn};

lazy_static! {
    static ref WHITESPACE_REGEX: Regex = Regex::new(r"\s+").unwrap();
    static ref NEWLINE_REGEX: Regex = Regex::new(r"[\n\r]+").unwrap();
}

#[derive(Debug, Serialize)]
pub struct Post {
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

    pub fn get_post(element: ElementRef) -> anyhow::Result<Post> {
        let title_selector = Selector::parse("a[slot='title']")
            .map_err(|e| anyhow::anyhow!("Error parsing title selector: {}", e))?;

        let content_selector = Selector::parse("a[slot='text-body']")
            .map_err(|e| anyhow::anyhow!("Error parsing content selector: {}", e))?;

        let number_selector = Selector::parse("faceplate-number")
            .map_err(|e| anyhow::anyhow!("Error parsing number selector: {}", e))?;

        let title_element = element.select(&title_selector).next();
        let content_element = element.select(&content_selector).next();

        let mut number_elements = element.select(&number_selector);
        let vote_element = number_elements.next();
        let comments_element = number_elements.next();

        if let (
            Some(title_element),
            Some(vote_element),
            Some(comments_element),
        ) = (
            title_element,
            vote_element,
            comments_element,
        ) {
            let title = title_element.text().collect::<Vec<_>>().join(" ");
            let content = content_element.map_or_else(String::new, |e| e.text().collect::<Vec<_>>().join(" "));
            let vote = vote_element.text().collect::<Vec<_>>().join(" ");
            let comments = comments_element.text().collect::<Vec<_>>().join(" ");

            return Ok(Post {
                title: Self::clean_text(&title),
                content: Self::clean_text(&content),
                vote: Self::clean_text(&vote).parse::<u32>().unwrap_or_default(),
                comments: Self::clean_text(&comments)
                    .parse::<u32>()
                    .unwrap_or_default(),
            });
        }

        Err(anyhow::anyhow!(
            "Not found elements, title: {}, content: {}, vote: {}, comments: {}",
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
