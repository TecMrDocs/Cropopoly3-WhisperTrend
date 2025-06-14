/**
 * Scraper de Instagram con login automatizado y extracción de datos de publicaciones.
 *
 * Este módulo permite automatizar la autenticación en Instagram y realizar scraping de publicaciones
 * relacionadas con un hashtag específico. Extrae información como likes, comentarios, timestamp,
 * enlace de la publicación y número de seguidores del autor. Utiliza cookies persistentes para evitar
 * múltiples inicios de sesión y ejecutar código JavaScript en el navegador controlado.
 *
 * Autor: Santiago Villazón Ponce de León
 */

use crate::{
    config::Config,
    scraping::{SCRAPER, Utils},
};
use futures_util::future::join_all;
use once_cell::sync::OnceCell;
use serde::{Deserialize, Serialize};
use tracing::info;

// Variables globales y constantes

/// User Agent usado para simular un navegador real y evitar bloqueos por parte de Instagram.
static USER_AGENT: &str = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

/// Código JavaScript externo para forzar efectos de hover sobre publicaciones.
static JS_HOVER: &str = include_str!("hover.js");

/// Almacenamiento global de cookies de sesión para evitar múltiples logins.
static COOKIES: OnceCell<String> = OnceCell::new();

/// URL de login de Instagram.
const INSTAGRAM_LOGIN_URL: &str = "https://www.instagram.com/accounts/login/";

/// URL base para explorar hashtags.
const INSTAGRAM_POST_URL: &str = "https://www.instagram.com/explore/tags";

/// Selectores CSS necesarios para interactuar con el formulario de login.
const USERNAME_SELECTOR: &str = "input[name='username']";
const PASSWORD_SELECTOR: &str = "input[name='password']";
const LOGIN_BUTTON_SELECTOR: &str = "button[type='submit']";

/// Selectores CSS para extraer información de las publicaciones y perfiles.
const POST_SELECTOR: &str = "main > div > div:nth-of-type(2) > div > div > div";
const TIME_SELECTOR: &str = "a span time";
const FOLLOWERS_SELECTOR: &str = "section a span span";

/// Estructura que contiene likes, comentarios y el enlace de un post
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct InstagramPostPrimary {
    pub likes: u32,
    pub comments: u32,
    pub link: String,
}

/// Estructura que contiene solo el timestamp y el link
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct InstagramPostSecondary {
    pub time: String,
    pub link: String,
}

/// Estructura final que agrupa todos los datos relevantes de un post
#[derive(Debug, Serialize, Deserialize)]
pub struct InstagramPost {
    pub likes: u32,
    pub comments: u32,
    pub link: String,
    pub time: String,
    pub followers: u32,
}

/// Scraper principal de Instagram que implementa todas las funciones de login y scraping.
pub struct InstagramScraper;

impl InstagramScraper {
    /**
     * Realiza el login en Instagram utilizando credenciales configuradas.
     *
     * Se navega al formulario de login, se rellenan los campos y se guarda la cookie resultante.
     * Este método no debe ser llamado directamente, a menos que se requiera regenerar cookies.
     *
     * @return Cookie de sesión en formato string.
     */
    pub async fn login() -> anyhow::Result<String> {
        SCRAPER
            .execute(move |context| {
                context.navigate(INSTAGRAM_LOGIN_URL);
                context.write_input(USERNAME_SELECTOR, Config::get_instagram_username());
                context.write_input(PASSWORD_SELECTOR, Config::get_instagram_password());
                context.click_element(LOGIN_BUTTON_SELECTOR);
                std::thread::sleep(std::time::Duration::from_secs(15));
                let cookies = context.string_cookies();
                cookies
            })
            .await
    }

    /**
     * Aplica las cookies almacenadas o realiza login si no se encuentran cookies previas.
     *
     * Se verifica la existencia de un archivo `cookies.json`, en cuyo caso se cargan. 
     * De lo contrario, se realiza login y se genera el archivo con las cookies.
     */
    pub async fn apply_login() -> anyhow::Result<()> {
        if COOKIES.get().is_some() {
            return Ok(());
        }

        if std::path::Path::new("cookies.json").exists() {
            info!("Loading cookies from file");
            let cookies = std::fs::read_to_string("cookies.json")?;
            let _ = COOKIES.set(cookies);
        } else {
            info!("No cookies found, logging in");
            let cookies = InstagramScraper::login().await?;
            std::fs::write("cookies.json", cookies.clone())?;
            let _ = COOKIES.set(cookies);
        }

        Ok(())
    }

    /**
     * Extrae el timestamp (`datetime`) y link de una publicación individual de Instagram.
     *
     * Se accede al DOM con cookies activadas y se ejecuta un script que busca los datos requeridos.
     *
     * @param link Enlace a la publicación específica de Instagram.
     * @return Estructura con el tiempo y enlace de la publicación.
     */
    pub async fn get_time_and_link(link: String) -> anyhow::Result<InstagramPostSecondary> {
        InstagramScraper::apply_login().await?;
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

            let result: InstagramPostSecondary = serde_json::from_str(&result)?;
            return Ok(result);
        }

        Err(anyhow::anyhow!("No cookies found"))
    }

    /**
     * Extrae el número de seguidores del autor de una publicación.
     *
     * Se navega al perfil del usuario (tomado desde el post) y se ejecuta JavaScript
     * para obtener el valor visible en el DOM.
     *
     * @param link Enlace al perfil o post que redirige al autor.
     * @return Cantidad de seguidores como string.
     */
    pub async fn get_followers(link: String) -> anyhow::Result<String> {
        InstagramScraper::apply_login().await?;
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

    /**
     * Realiza scraping de publicaciones asociadas a un hashtag.
     *
     * Esta función tiene 3 fases:
     * 1. Extraer likes, comentarios y enlaces de los posts.
     * 2. Obtener la fecha y link real de cada post.
     * 3. Acceder al perfil del autor y obtener su número de seguidores.
     *
     * @param hashtag Hashtag sin el símbolo `#` (ej. sustainability).
     * @return Vector con estructuras completas de cada post.
     */
    pub async fn get_posts(hashtag: String) -> anyhow::Result<Vec<InstagramPost>> {
        InstagramScraper::apply_login().await?;
        if let Some(cookies) = COOKIES.get() {
            // Fase 1: Obtener likes, comments y link de cada publicación
            let posts = SCRAPER
                .execute(move |context| {
                    context.set_user_agent(USER_AGENT);
                    context.set_string_cookies(cookies.clone());
                    context.navigate(format!("{}/{}", INSTAGRAM_POST_URL, hashtag));
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

            let posts: Vec<InstagramPostPrimary> = serde_json::from_str(&posts)?;
            let mut futures = Vec::new();

            // Fase 2: Obtener fecha y link real de cada post en paralelo
            for post in posts.clone() {
                futures.push(async move {
                    match InstagramScraper::get_time_and_link(post.link).await {
                        Ok(result) => Some(result),
                        Err(_) => Some(InstagramPostSecondary {
                            time: String::new(),
                            link: String::new(),
                        }),
                    }
                });
            }

            let results = join_all(futures).await;
            let times_and_links: Vec<InstagramPostSecondary> =
                results.into_iter().filter_map(|result| result).collect();
            let mut futures = Vec::new();

            // Fase 3: Obtener seguidores del autor de cada post en paralelo
            for post in times_and_links.clone() {
                futures.push(async move {
                    match InstagramScraper::get_followers(post.link).await {
                        Ok(result) => Some(result),
                        Err(_) => Some(String::new()),
                    }
                });
            }

            let results = join_all(futures).await;
            let followers: Vec<String> = results.into_iter().filter_map(|result| result).collect();

            // Ensamblar todos los datos en la estructura final
            let posts: Vec<InstagramPost> = posts
                .into_iter()
                .zip(followers)
                .zip(times_and_links)
                .map(|((post, follower), time_and_link)| InstagramPost {
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
