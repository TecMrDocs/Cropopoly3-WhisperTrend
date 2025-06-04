use chromiumoxide::browser::Browser;
use chromiumoxide::cdp::browser_protocol::network::{
    Cookie, CookieParam, GetCookiesParams, SetCookiesParams, TimeSinceEpoch,
};
use chromiumoxide::page::Page;
use futures_util::stream::StreamExt;
use fake::{faker::internet::en::UserAgent, Fake};
use scraper::{Html, Selector};
use std::{fs, time::Duration};
use tokio::time::sleep;
use serde_json;

use crate::scraping::SCRAPER;

pub struct InstagramScraper;

impl InstagramScraper {

    pub async fn login() -> anyhow::Result<Browser> {
        let ws_url = std::env::var("BROWSERLESS_WS")?;
        let (browser, mut handler) = Browser::connect(ws_url).await?;

        tokio::spawn(async move {
            while let Some(_event) = handler.next().await {}
        });

        let page = browser.new_page("https://www.instagram.com/").await?;
        load_cookies(&page).await?;
        page.reload().await?;
        page.wait_for_navigation().await?;
        sleep(Duration::from_secs(3)).await;

        let current_url = page.url().await?.unwrap_or_default();
        if !current_url.contains("login") {
            return Ok(browser);
        }

        let page = browser
            .new_page("https://www.instagram.com/accounts/login/")
            .await?;
        page.wait_for_navigation().await?;
        sleep(Duration::from_secs(3)).await;

        let username = std::env::var("INSTAGRAM_USERNAME")?;
        let password = std::env::var("INSTAGRAM_PASSWORD")?;

        let username_el = page.find_element("input[name='username']").await?;
        username_el.click().await?;
        username_el.type_str(&username).await?;

        let password_el = page.find_element("input[name='password']").await?;
        password_el.click().await?;
        password_el.type_str(&password).await?;

        let login_btn = page.find_element("button[type='submit']").await?;
        login_btn.click().await?;

        sleep(Duration::from_secs(5)).await;

        let url = page.url().await?.unwrap_or_default();
        if url.contains("login") {
            anyhow::bail!("Login fallido: sigue en la página de login");
        }

        save_cookies(&page).await?;
        Ok(browser)
    }

pub async fn get_post_links_from_hashtag_scraper(hashtag: &str) -> Result<Vec<String>, anyhow::Error> {
    let url = format!("https://www.instagram.com/explore/tags/{}/", hashtag);
    let scraper = crate::scraping::SCRAPER.clone();

    let html = scraper
        .execute(move |context| {
            // User-Agent móvil realista
            let user_agent = "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) \
                              AppleWebKit/605.1.15 (KHTML, like Gecko) \
                              Version/16.0 Mobile/15E148 Safari/604.1";
            context.set_user_agent(user_agent);

            context.navigate(&url);
            context.wait_for_element("a[href^='/p/']", 8000);

            // Simula scroll hacia abajo (a veces Instagram carga más posts así)
            context.evaluate("window.scrollTo(0, document.body.scrollHeight)");

            // Espera adicional para cargar contenido tras scroll
            std::thread::sleep(std::time::Duration::from_secs(4));

            context.get_html()
        })
        .await;

    let document = Html::parse_document(&html);
    let selector = Selector::parse(r#"a[href^="/p/"]"#).unwrap();

    let mut urls = vec![];
    for element in document.select(&selector) {
        if let Some(href) = element.value().attr("href") {
            let full_url = format!("https://www.instagram.com{}", href);
            if !urls.contains(&full_url) {
                urls.push(full_url);
            }
        }
        if urls.len() >= 10 {
            break;
        }
    }

    Ok(urls)
}
}

// =========================
// Cookies: guardar y cargar
// =========================

async fn get_all_cookies(page: &Page) -> anyhow::Result<Vec<Cookie>> {
    let resp = page.execute(GetCookiesParams::default()).await?;
    Ok(resp.cookies.clone())
}

async fn set_all_cookies(page: &Page, cookies: Vec<Cookie>) -> anyhow::Result<()> {
    let cookie_params: Vec<CookieParam> = cookies
        .into_iter()
        .map(|c| {
            let expires = if c.expires != 0.0 {
                Some(TimeSinceEpoch::new(c.expires))
            } else {
                None
            };

            CookieParam {
                name: c.name,
                value: c.value,
                url: None,
                domain: Some(c.domain),
                path: Some(c.path),
                secure: Some(c.secure),
                http_only: Some(c.http_only),
                same_site: c.same_site,
                expires,
                priority: None,
                same_party: None,
                source_scheme: None,
                source_port: None,
                partition_key: None,
            }
        })
        .collect();

    page.execute(SetCookiesParams::new(cookie_params)).await?;
    Ok(())
}


async fn save_cookies(page: &Page) -> anyhow::Result<()> {
    let cookies = get_all_cookies(page).await?;
    let serialized = serde_json::to_string(&cookies)?;
    fs::write("cookies.json", serialized)?;
    Ok(())
}

async fn load_cookies(page: &Page) -> anyhow::Result<()> {
    if let Ok(data) = fs::read_to_string("cookies.json") {
        if let Ok(cookies) = serde_json::from_str::<Vec<Cookie>>(&data) {
            set_all_cookies(page, cookies).await?;
        }
    }
    Ok(())
}
