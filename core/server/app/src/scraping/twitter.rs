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
const TWITTER_POST_URL: &str = "https://x.com/search?q=%23";

const INIT_LOGIN_BUTTON_SELECTOR: &str = "[data-testid='loginButton']";
const USERNAME_SELECTOR: &str = "input[name='text']";
const PASSWORD_SELECTOR: &str = "input[name='password']";
const LOGIN_BUTTON_SELECTOR: &str = "button[data-testid='LoginForm_Login_Button']";

const POST_SELECTOR: &str = "main > div > div:nth-of-type(2) > div > div > div";
const TIME_SELECTOR: &str = "a span time";

const FOLLOWERS_SELECTOR: &str = "section a span span";

#[derive(Debug, Deserialize, Serialize)]
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

#[derive(Debug, Serialize, Deserialize)]
pub struct TweetData {
    pub username: String,
    pub handle: String,
    pub text: String,
    pub link: String,
    pub time: String,
    pub likes: u32,
    pub retweets: u32,
    pub replies: u32,
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

    pub async fn get_posts(hashtag: String) -> anyhow::Result<Vec<TweetData>> {
        TwitterScraper::apply_login().await?;
    
        if let Some(cookies) = COOKIES.get() {
            let url = format!("https://x.com/search?q=%23{}", hashtag);
    
            let json = SCRAPER
                .execute(move |context| {
                    context.set_user_agent(USER_AGENT);
                    context.set_string_cookies(cookies.clone());
                    context.navigate(url.clone());
                    std::thread::sleep(std::time::Duration::from_secs(5));
                    for _ in 0..30 {
                        context.evaluate(
                            r#"
                            (() => {
                                window.scrollBy(0, window.innerHeight);
                            })()
                            "#
                        );
                        std::thread::sleep(std::time::Duration::from_secs(1)); // Espera a que cargue más tweets
                    }
                    context.evaluate(
                        "(() => {
                            const articles = Array.from(document.querySelectorAll('article[data-testid=\\\"tweet\\\"]'));
                            const tweets = [];
                    
                            for (const article of articles) {
                                try {
                                    const username = article.querySelector('[data-testid=\\\"User-Name\\\"] span')?.innerText || '';
                                    const handle = Array.from(article.querySelectorAll('a span'))
                                        .map(span => span.innerText)
                                        .find(text => text.startsWith('@')) || '';
                                    const text = article.querySelector('[data-testid=\\\"tweetText\\\"]')?.innerText || '';
                                    const time = article.querySelector('time')?.getAttribute('datetime') || '';
                                    const linkPath = article.querySelector('a[href*=\\\"/status/\\\"]')?.getAttribute('href') || '';
                                    const link = linkPath ? `https://x.com${linkPath}` : '';
                    
                                    const replies = parseInt(
                                        article.querySelector('button[data-testid=\\\"reply\\\"] span')?.textContent?.replace(/[^0-9]/g, '') || '0'
                                    );
                                    const retweets = parseInt(
                                        article.querySelector('button[data-testid=\\\"retweet\\\"] span')?.textContent?.replace(/[^0-9]/g, '') || '0'
                                    );
                                    const likes = parseInt(
                                        article.querySelector('button[data-testid=\\\"like\\\"] span')?.textContent?.replace(/[^0-9]/g, '') || '0'
                                    );
                    
                                    tweets.push({
                                        username,
                                        handle,
                                        text,
                                        time,
                                        link,
                                        likes,
                                        retweets,
                                        replies
                                    });
                                } catch (e) {
                                    continue;
                                }
                            }
                    
                            return JSON.stringify(tweets);
                        })()"
                    )
                    
                })
                .await?;
    
            let tweets: Vec<TweetData> = serde_json::from_str(&json)?;
            Ok(tweets)
        } else {
            Err(anyhow::anyhow!("No cookies found"))
        }
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
}