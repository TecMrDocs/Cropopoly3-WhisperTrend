/**
 * Módulo para scraping de contenido de Twitter/X.
 * 
 * Este módulo proporciona funcionalidades para autenticación automática en X (Twitter)
 * y extracción de tweets mediante búsquedas por hashtags. Incluye manejo de cookies
 * persistentes, scraping de datos completos de tweets (likes, retweets, replies),
 * obtención de información de perfiles de usuarios y conteo de seguidores.
 * Implementa técnicas avanzadas de scraping con scrolling automático y evaluación
 * de JavaScript para extraer contenido dinámico.
 * 
 * Autor: Renato García Morán
 */

use crate::{
    config::Config,
    scraping::{SCRAPER, Utils},
};
use futures_util::future::join_all;
use once_cell::sync::OnceCell;
use serde::{Deserialize, Serialize};
use tracing::info;

/**
 * Constantes de configuración para la autenticación y navegación en Twitter/X.
 * 
 * Define user agents, scripts JavaScript embebidos, URLs de endpoints
 * y selectores CSS para los elementos de la interfaz de Twitter.
 */
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

/**
 * Estructuras de datos para representar tweets y información de perfiles.
 * 
 * Define los modelos de datos para tweets con diferentes niveles de detalle,
 * incluyendo información básica, temporal y completa con datos de engagement
 * y seguidores.
 */
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
    pub followers: u32,
}

/**
 * Scraper principal para Twitter/X con manejo de autenticación y extracción de datos.
 * 
 * Proporciona métodos para login automático, manejo de cookies persistentes
 * y scraping de tweets con información completa de engagement y perfiles.
 */
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
        if Config::get_twitter_username().is_empty() || Config::get_twitter_password().is_empty() {
            return Ok(Vec::new());
        }
        
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
                        std::thread::sleep(std::time::Duration::from_secs(1));
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
    
            #[derive(Deserialize)]
            struct PartialTweetData {
                username: String,
                handle: String,
                text: String,
                link: String,
                time: String,
                likes: u32,
                retweets: u32,
                replies: u32,
            }
    
            let mut partial_tweets: Vec<PartialTweetData> = serde_json::from_str(&json)?;
            let mut full_tweets = Vec::new();
    
            for tweet in partial_tweets.drain(..) {
                let handle = tweet.handle.clone();
                let handle_trimmed = handle.trim_start_matches('@').to_string();
                let profile_url = format!("https://x.com/{}", handle_trimmed);
            
                let followers_count_str = SCRAPER
                    .execute({
                        let cookies = cookies.clone();
                        let handle_trimmed = handle_trimmed.clone();
                        move |context| {
                            context.set_user_agent(USER_AGENT);
                            context.set_string_cookies(cookies.clone());
                            context.navigate(profile_url.clone());
                            std::thread::sleep(std::time::Duration::from_secs(4));
            
                            context.evaluate(&format!(
                                r#"
                                (() => {{
                                    const followersElement = document.querySelector('a[href="/{}/verified_followers"] span span');
                                    return followersElement?.textContent || '0';
                                }})()
                                "#,
                                handle_trimmed
                            ))
                        }
                    })
                    .await?;
            
                let followers = Self::parse_followers_count(&followers_count_str);
            
                full_tweets.push(TweetData {
                    username: tweet.username,
                    handle: tweet.handle,
                    text: tweet.text,
                    link: tweet.link,
                    time: tweet.time,
                    likes: tweet.likes,
                    retweets: tweet.retweets,
                    replies: tweet.replies,
                    followers,
                });
            }
            
    
            Ok(full_tweets)
        } else {
            Err(anyhow::anyhow!("No cookies found"))
        }
    }

    fn parse_followers_count(s: &str) -> u32 {
        let s = s.trim().to_uppercase();
        if s.ends_with('K') {
            s.trim_end_matches('K').parse::<f32>().map(|n| (n * 1_000.0) as u32).unwrap_or(0)
        } else if s.ends_with('M') {
            s.trim_end_matches('M').parse::<f32>().map(|n| (n * 1_000_000.0) as u32).unwrap_or(0)
        } else if s.ends_with('B') {
            s.trim_end_matches('B').parse::<f32>().map(|n| (n * 1_000_000_000.0) as u32).unwrap_or(0)
        } else {
            s.replace(",", "").parse::<u32>().unwrap_or(0)
        }
    }
}