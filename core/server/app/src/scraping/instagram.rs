use chromiumoxide::browser::Browser;
use futures_util::stream::StreamExt;
use serde::Serialize;
use std::time::Duration;
use tokio::time::sleep;

#[derive(Debug, Serialize)]
pub struct InstagramPost {
    pub url: String,
    pub caption: String,
    pub likes: u32,
}

pub struct InstagramScraper;

impl InstagramScraper {
    pub fn get_posts_by_hashtag(_tag: &str, _limit: usize) -> Vec<InstagramPost> {
        vec![
            InstagramPost {
                url: "https://instagram.com/p/example1".into(),
                caption: "Ejemplo caption 1".into(),
                likes: 120,
            },
            InstagramPost {
                url: "https://instagram.com/p/example2".into(),
                caption: "Ejemplo caption 2".into(),
                likes: 230,
            },
        ]
    }

    pub async fn login() -> anyhow::Result<String> {
        let ws_url = std::env::var("BROWSERLESS_WS")?;
        let (browser, mut handler) = Browser::connect(ws_url).await?;

        // Manejador del browser (no se usa, pero debe mantenerse vivo)
        tokio::spawn(async move {
            while let Some(_event) = handler.next().await {}
        });

        let page = browser.new_page("https://www.instagram.com/accounts/login/").await?;
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

        // En lugar de hacer click, presionamos Enter para enviar el formulario
        password_el.press_key("Enter").await?;

        sleep(Duration::from_secs(10)).await; // más tiempo para que cargue el home

        let url = page.url().await?.expect("URL no encontrada");
        if url.contains("login") {
            anyhow::bail!("Login fallido: sigue en la página de login");
        }

        Ok("Login exitoso".to_string())
    }
}
