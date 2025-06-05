use crate::{
    config::Config,
    scraping::{SCRAPER, Utils},
};
use futures_util::future::join_all;
use once_cell::sync::OnceCell;
use serde::{Deserialize, Serialize};
use tracing::info;

static USER_AGENT: &str = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
static JS_HOVER: &str = include_str!("hover.js");
static COOKIES: OnceCell<String> = OnceCell::new();

const TWITTER_LOGIN_URL: &str = "https://x.com/";
const TWITTER_POST_URL: &str = "";

const INIT_LOGIN_BUTTON_SELECTOR: &str = "[data-testid='loginButton']";
const NEXT_LOGIN_BUTTON_SELECTOR: &str = "type='button'";
const USERNAME_SELECTOR: &str = "input[name='text']";
const PASSWORD_SELECTOR: &str = "input[name='password']";
const LOGIN_BUTTON_SELECTOR: &str = "button[data-testid='LoginForm_Login_Button']";

const POST_SELECTOR: &str = "main > div > div:nth-of-type(2) > div > div > div";
const TIME_SELECTOR: &str = "a span time";

const FOLLOWERS_SELECTOR: &str = "section a span span";

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TwitterPostPrimary {
    pub likes: u32,
    pub comments: u32,
    pub link: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TwitterPostSecondary {
    pub time: String,
    pub link: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TwitterPost {
    pub likes: u32,
    pub comments: u32,
    pub link: String,
    pub time: String,
    pub followers: u32,
}

pub struct TwitterScraper;

impl TwitterScraper {
    pub async fn login() -> anyhow::Result<String> {
        SCRAPER
            .execute(move |context| {
                context.navigate(TWITTER_LOGIN_URL);

                context.click_element(INIT_LOGIN_BUTTON_SELECTOR);
                std::thread::sleep(std::time::Duration::from_secs(5));
                
                context.write_input(USERNAME_SELECTOR, Config::get_twitter_username());
                context.evaluate("
                (() => {
                    document.evaluate(\"//span[contains(text(), 'Next')]\", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.click();
                    return '';
                })()");
                std::thread::sleep(std::time::Duration::from_secs(5));
                context.write_input(PASSWORD_SELECTOR, Config::get_twitter_password());
                context.click_element(LOGIN_BUTTON_SELECTOR);
                std::thread::sleep(std::time::Duration::from_secs(15));
                let cookies = context.string_cookies();
                cookies
            })
            .await
    }

    pub async fn apply_login() -> anyhow::Result<()> {
        if COOKIES.get().is_some() {
            return Ok(());
        }

        if std::path::Path::new("x_cookies.json").exists() {
            info!("Loading cookies from file");
            let cookies = std::fs::read_to_string("x_cookies.json")?;
            let _ = COOKIES.set(cookies);
        } else {
            info!("No cookies found, logging in");
            let cookies = TwitterScraper::login().await?;
            std::fs::write("x_cookies.json", cookies.clone())?;
            let _ = COOKIES.set(cookies);
        }

        Ok(())
    }

    pub async fn get_time_and_link(link: String) -> anyhow::Result<TwitterPostSecondary> {
        TwitterScraper::apply_login().await?;
        if let Some(cookies) = COOKIES.get() {
            let result = SCRAPER
                .execute(move |context| {
                    context.set_user_agent(USER_AGENT);
                    context.set_string_cookies(cookies.clone());
                    context.navigate(link.clone());
                    std::thread::sleep(std::time::Duration::from_secs(5));
                    context.evaluate(format!(
                    "(() => {{
                        let t = document.querySelector('{TIME_SELECTOR}');
                        let time = '';

                        if (t) {{
                            time = (t || {{ attributes: {{ datetime: {{ value: '' }} }}}}).attributes.datetime.value;
                        }}

                        if (time === '') {{
                            time = new Date().toISOString();
                        }}

                        let a = document.querySelector('a');
                        let link = '';

                        if (a) {{
                            link = (a || {{ href: '' }}).href;
                        }}

                        return JSON.stringify({{ time, link }});
                    }})()"
                    ))
                })
                .await?;

            let result: TwitterPostSecondary = serde_json::from_str(&result)?;
            return Ok(result);
        }

        Err(anyhow::anyhow!("No cookies found"))
    }

    pub async fn get_followers(link: String) -> anyhow::Result<String> {
        TwitterScraper::apply_login().await?;
        if let Some(cookies) = COOKIES.get() {
            return SCRAPER
                .execute(move |context| {
                    context.set_user_agent(USER_AGENT);
                    context.set_string_cookies(cookies.clone());
                    context.navigate(link.clone());
                    std::thread::sleep(std::time::Duration::from_secs(5));
                    let result = context.evaluate(format!(
                        "(() => {{
                        let followers = document.querySelector('{FOLLOWERS_SELECTOR}').textContent;
                        return followers;
                    }})()"
                    ));
                    result
                })
                .await;
        }

        Err(anyhow::anyhow!("No cookies found"))
    }

    pub async fn get_posts(hashtag: String) -> anyhow::Result<Vec<TwitterPost>> {
        TwitterScraper::apply_login().await?;
        if let Some(cookies) = COOKIES.get() {
            let posts = SCRAPER
                .execute(move |context| {
                    context.set_user_agent(USER_AGENT);
                    context.set_string_cookies(cookies.clone());
                    context.navigate(format!("{}/{}", TWITTER_POST_URL, hashtag));
                    std::thread::sleep(std::time::Duration::from_secs(5));
                    context.evaluate(format!(
                        "(() => {{
                        {JS_HOVER};
                        let posts = Array.from(document.querySelectorAll('{POST_SELECTOR}'));
                        posts.forEach((p) => forceHoverPermanent(p));
                        return '';
                    }})()"
                    ));
                    std::thread::sleep(std::time::Duration::from_secs(5));
                    let result = context.async_evaluate(format!(
                        "(() => {{
                        let posts = Array.from(document.querySelectorAll('{POST_SELECTOR}'));
                        let results = [];

                        for (let i = 0; i < posts.length; i++) {{
                            try {{
                                let p = posts[i];
                                let metrics = p.querySelectorAll('span > span');
                                let a = p.querySelector('a');

                                let likes = (metrics[0] || {{ textContent: '' }}).textContent;
                                let comments = (metrics[1] || {{ textContent: '' }}).textContent;
                                let link = (a || {{ href: '' }}).href;

                                if (!a || !link) {{
                                    continue;
                                }}

                                results.push({{
                                    likes: likes === '' ? 0 : parseInt(likes.trim()),
                                    comments: comments === '' ? 0 : parseInt(comments.trim()),
                                    link
                                }});
                            }} catch (error) {{
                            }}
                        }}

                        return JSON.stringify(results);
                    }})()"
                    ));
                    std::thread::sleep(std::time::Duration::from_secs(5));
                    result
                })
                .await?;

            let posts: Vec<TwitterPostPrimary> = serde_json::from_str(&posts)?;
            let mut futures = Vec::new();

            for post in posts.clone() {
                futures.push(async move {
                    match TwitterScraper::get_time_and_link(post.link).await {
                        Ok(result) => Some(result),
                        Err(_) => Some(TwitterPostSecondary {
                            time: String::new(),
                            link: String::new(),
                        }),
                    }
                });
            }

            let results = join_all(futures).await;
            let times_and_links: Vec<TwitterPostSecondary> =
                results.into_iter().filter_map(|result| result).collect();
            let mut futures = Vec::new();

            for post in times_and_links.clone() {
                futures.push(async move {
                    match TwitterScraper::get_followers(post.link).await {
                        Ok(result) => Some(result),
                        Err(_) => Some(String::new()),
                    }
                });
            }

            let results = join_all(futures).await;
            let followers: Vec<String> = results.into_iter().filter_map(|result| result).collect();
            let posts: Vec<TwitterPost> = posts
                .into_iter()
                .zip(followers)
                .zip(times_and_links)
                .map(|((post, follower), time_and_link)| TwitterPost {
                    likes: post.likes,
                    comments: post.comments,
                    link: post.link,
                    time: time_and_link.time,
                    followers: Utils::parse_human_number(&follower),
                })
                .collect();

            return Ok(posts);
        }

        Err(anyhow::anyhow!("No cookies found"))
    }
}
