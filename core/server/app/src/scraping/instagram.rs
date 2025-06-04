use chromiumoxide::browser::Browser;
use chromiumoxide::cdp::browser_protocol::network::{
    Cookie, CookieParam, GetCookiesParams, SetCookiesParams, TimeSinceEpoch,
};
use chromiumoxide::cdp::js_protocol::runtime::CallFunctionOnReturns;
use chromiumoxide::page::Page;
use futures_util::stream::StreamExt;
use serde::Serialize;
use std::fs;
use std::time::Duration;
use tokio::time::sleep;

#[derive(Debug, Serialize)]
pub struct InstagramPost {
    pub url: String,
    pub caption: String,
    pub likes: Option<u32>,
}

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

    pub async fn get_one_post() -> anyhow::Result<InstagramPost> {
        let browser = Self::login().await?;
        let page = browser
            .new_page("https://www.instagram.com/reels/DIaAh_WSuMN/")
            .await?;
        page.wait_for_navigation().await?;
        sleep(Duration::from_secs(5)).await;

        let caption_el = page.find_element("meta[property='og:title']").await?;
        let js_result: CallFunctionOnReturns = caption_el
            .call_js_fn("function() { return this.getAttribute('content'); }", false)
            .await?;

        let caption_text = js_result
            .result
            .value
            .and_then(|v| v.as_str().map(|s| s.to_string()))
            .unwrap_or_default();

        Ok(InstagramPost {
            url: page.url().await?.unwrap_or_default(),
            caption: caption_text,
            likes: None,
        })
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