use crate::scraping::SCRAPER;
use fake::{Fake, faker::internet::en::UserAgent};
use futures::future::join_all;
use lazy_static::lazy_static;
use regex::Regex;
use scraper::{ElementRef, Html, Selector};
use serde::Serialize;
use std::sync::Arc;
use tracing::warn;

lazy_static! {
    static ref WHITESPACE_REGEX: Regex = Regex::new(r"\s+").unwrap();
    static ref NEWLINE_REGEX: Regex = Regex::new(r"[\n\r]+").unwrap();
    static ref HUMAN_NUMBER_REGEX: Regex =
        Regex::new(r"^([\d,.]+)\s*([kKmM]il|mill[oó]n|mills?|[kKMGTP])?$").unwrap();

    // posts
    static ref ARTICLE_SELECTOR: Selector = Selector::parse("article").unwrap();
    static ref TIME_SELECTOR: Selector = Selector::parse("time").unwrap();
    static ref TITLE_SELECTOR: Selector = Selector::parse("a[slot='title']").unwrap();
    static ref CONTENT_SELECTOR: Selector = Selector::parse("a[slot='text-body']").unwrap();
    static ref NUMBER_SELECTOR: Selector = Selector::parse("faceplate-number").unwrap();

    // simple posts
    static ref POST_CONSUME_SELECTOR: Selector = Selector::parse("[consume-events]").unwrap();
    static ref POST_TITLE_SELECTOR: Selector = Selector::parse("[data-testid='post-title-text']").unwrap();
    static ref SUBREDDIT_SELECTOR: Selector = Selector::parse("faceplate-hovercard a").unwrap();

    // members
    static ref MEMBERS_SELECTOR: Selector = Selector::parse("#subscribers faceplate-number").unwrap();
}

#[derive(Debug, Serialize)]
pub struct SimplePost {
    time: String,
    title: String,
    vote: u32,
    comments: u32,
    subreddit: String,
}

#[derive(Debug, Serialize)]
pub struct SimplePostWithMembers {
    time: String,
    title: String,
    vote: u32,
    comments: u32,
    subreddit: String,
    members: u32,
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

    fn get_simple_post(element: ElementRef) -> anyhow::Result<SimplePost> {
        let time_element = element.select(&TIME_SELECTOR).next();
        let title_element = element.select(&POST_TITLE_SELECTOR).next();

        let mut number_elements = element.select(&NUMBER_SELECTOR);
        let vote_element = number_elements.next();
        let comments_element = number_elements.next();

        if let (
            Some(time_element),
            Some(title_element),
            Some(vote_element),
            Some(comments_element),
        ) = (time_element, title_element, vote_element, comments_element)
        {
            let time = time_element.attr("datetime").unwrap_or_default();
            let title = title_element.text().collect::<Vec<_>>().join(" ");
            let vote = vote_element.text().collect::<Vec<_>>().join(" ");
            let comments = comments_element.text().collect::<Vec<_>>().join(" ");

            if let Some(subreddit_element) = element.select(&SUBREDDIT_SELECTOR).next() {
                let subreddit = subreddit_element.attr("href").unwrap_or_default();

                return Ok(SimplePost {
                    time: time.to_string(),
                    title: Self::clean_text(&title),
                    vote: Self::parse_human_number(&vote),
                    comments: Self::parse_human_number(&comments),
                    subreddit: {
                        if subreddit.to_string().starts_with("/r/") {
                            format!("https://www.reddit.com{}", subreddit.to_string())
                        } else {
                            subreddit.to_string()
                        }
                    },
                });
            }
        }

        Err(anyhow::anyhow!("Not found elements"))
    }

    pub async fn get_simple_posts_by_keyword(keyword: String) -> Vec<SimplePost> {
        let content = SCRAPER
            .execute(move |context| {
                let user_agent: String = UserAgent().fake();
                context.set_user_agent(&user_agent);
                context.navigate(&format!("https://www.reddit.com/search?q={}", keyword));
                std::thread::sleep(std::time::Duration::from_secs(3));
                context.get_html()
            })
            .await;

        let document = Html::parse_document(&content);
        let mut posts = Vec::new();

        for element in document.select(&POST_CONSUME_SELECTOR) {
            let post = Self::get_simple_post(element);

            match post {
                Ok(post) => posts.push(post),
                Err(e) => warn!("Error: {}", e),
            }
        }

        posts
    }

    pub async fn get_simple_posts_with_members(keyword: String) -> Vec<SimplePostWithMembers> {
        let simple_posts = Self::get_simple_posts_by_keyword(keyword).await;
        let mut futures = Vec::new();
        let scraper = Arc::clone(&SCRAPER);

        for post in simple_posts {
            let subreddit = post.subreddit.clone();
            let scraper_clone = Arc::clone(&scraper);

            let future = async move {
                let content = scraper_clone
                    .execute(move |context| {
                        let user_agent: String = UserAgent().fake();
                        context.set_user_agent(&user_agent);
                        context.navigate(&post.subreddit);
                        std::thread::sleep(std::time::Duration::from_secs(2));
                        context.get_html()
                    })
                    .await;

                let document = Html::parse_document(&content);
                let members_element = document.select(&MEMBERS_SELECTOR).next();

                if let Some(members_element) = members_element {
                    let members = members_element.text().collect::<Vec<_>>().join(" ");

                    Some(SimplePostWithMembers {
                        time: post.time,
                        title: post.title,
                        vote: post.vote,
                        comments: post.comments,
                        subreddit,
                        members: Self::parse_human_number(&members),
                    })
                } else {
                    None
                }
            };

            futures.push(future);
        }

        let results = join_all(futures).await;
        results.into_iter().filter_map(|result| result).collect()
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
