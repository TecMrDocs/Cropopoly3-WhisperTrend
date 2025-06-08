use crate::scraping::{SCRAPER, Utils};
use fake::{Fake, faker::internet::en::UserAgent};
use futures::future::join_all;
use lazy_static::lazy_static;
use scraper::{ElementRef, Html, Selector};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tracing::warn;

// CSS selectors for Reddit elements
const SUBREDDIT_SELECTOR_STR: &str = "faceplate-hovercard a";
const MEMBERS_SELECTOR_STR: &str = "#subscribers faceplate-number";

lazy_static! {
    // Selectors for extracting post data
    static ref TIME_SELECTOR: Selector = Selector::parse("time").unwrap();
    static ref NUMBER_SELECTOR: Selector = Selector::parse("faceplate-number").unwrap();
    static ref POST_CONSUME_SELECTOR: Selector = Selector::parse("[consume-events]").unwrap();
    static ref POST_TITLE_SELECTOR: Selector = Selector::parse("[data-testid='post-title-text']").unwrap();
    static ref SUBREDDIT_SELECTOR: Selector = Selector::parse(SUBREDDIT_SELECTOR_STR).unwrap();

    // Selector for subreddit member count
    static ref MEMBERS_SELECTOR: Selector = Selector::parse(MEMBERS_SELECTOR_STR).unwrap();
}

/// Represents a simple Reddit post with basic information
#[derive(Debug, Serialize, Deserialize)]
pub struct SimplePost {
    time: String,
    pub title: String,
    pub vote: u32,
    pub comments: u32,
    pub subreddit: String,
}

/// Represents a Reddit post with additional member count information
#[derive(Debug, Serialize, Deserialize)]
pub struct SimplePostWithMembers {
    time: String,
    pub title: String,
    pub vote: u32,
    pub comments: u32,
    pub subreddit: String,
    pub members: u32,
}

pub struct RedditScraper;

impl RedditScraper {
    /// Extracts post data from a Reddit HTML element
    pub fn get_simple_post(element: ElementRef) -> anyhow::Result<SimplePost> {
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
                    title: Utils::clean_text(&title),
                    vote: Utils::parse_human_number(&vote),
                    comments: Utils::parse_human_number(&comments),
                    subreddit: {
                        // Convert relative URLs to absolute URLs
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

    /// Scrapes Reddit posts by keyword search
    pub async fn get_simple_posts_by_keyword(keyword: String) -> Vec<SimplePost> {
        let content = SCRAPER
            .execute(move |context| {
                // Set random user agent to avoid detection
                let user_agent: String = UserAgent().fake();
                context.set_user_agent(&user_agent);
                std::thread::sleep(std::time::Duration::from_secs(3));
                context.navigate(&format!("https://www.reddit.com/search?q={}", keyword));
                context.get_html()
            })
            .await
            .unwrap_or_default();

        let document = Html::parse_document(&content);
        let mut posts = Vec::new();

        // Extract posts from search results
        for element in document.select(&POST_CONSUME_SELECTOR) {
            let post = Self::get_simple_post(element);

            match post {
                Ok(post) => posts.push(post),
                Err(e) => warn!("Error: {}", e),
            }
        }

        posts
    }

    /// Scrapes Reddit posts with additional member count for each subreddit
    pub async fn get_simple_posts_with_members(keyword: String) -> Vec<SimplePostWithMembers> {
        let simple_posts = Self::get_simple_posts_by_keyword(keyword).await;
        let mut futures = Vec::new();
        let scraper = Arc::clone(&SCRAPER);

        // Create async tasks to fetch member count for each subreddit
        for post in simple_posts {
            let subreddit = post.subreddit.clone();
            let scraper_clone = Arc::clone(&scraper);

            let future = async move {
                let content = scraper_clone
                    .execute(move |context| {
                        let user_agent: String = UserAgent().fake();
                        context.set_user_agent(&user_agent);
                        std::thread::sleep(std::time::Duration::from_secs(3));
                        context.navigate(&post.subreddit);
                        context.get_html()
                    })
                    .await
                    .unwrap_or_default();

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
                        members: Utils::parse_human_number(&members),
                    })
                } else {
                    None
                }
            };

            futures.push(future);
        }

        // Execute all futures concurrently and filter successful results
        let results = join_all(futures).await;
        results.into_iter().filter_map(|result| result).collect()
    }
}
