/**
 * Módulo para scraping de noticias y artículos utilizando la API de GDELT.
 * 
 * Este módulo proporciona funcionalidades para buscar artículos de noticias a través
 * de la API de GDELT Project y realizar scraping de contenido detallado de cada artículo.
 * Incluye extracción de títulos, descripciones, palabras clave y procesamiento de hashtags.
 * 
 * Autor: Carlos Alberto Zamudio Velázquez
 * Contribuyentes: [Lista de contribuyentes]
 */

use futures::future::join_all;
use lazy_static::lazy_static;
use reqwest::Client;
use scraper::{Html, Selector};
use serde::{Deserialize, Serialize};
use std::time::Duration;
use tokio::time::timeout;
use url::Url;

// CSS selectors for scraping HTML content
lazy_static! {
    static ref TITLE_SELECTOR: Selector = Selector::parse("h1").unwrap();
    static ref KEYWORD_SELECTOR: Selector = Selector::parse("meta[name='keywords']").unwrap();
    static ref DESCRIPTION_SELECTOR: Selector =
        Selector::parse("meta[name='description']").unwrap();
}

// GDELT API configuration constants
const BASE_URL: &str = "https://api.gdeltproject.org/api/v2/doc/doc";
const MODE: &str = "artlist";
const FORMAT: &str = "JSON";
const MAX_ARTICLES: usize = 3;
const MAX_HASHTAGS: usize = 1;
const MAX_TIMEOUT: u64 = 3;

pub type Details = Vec<Info>;

// Response structure from GDELT API
#[derive(Deserialize, Serialize, Debug)]
pub struct ApiResponse {
    pub articles: Vec<Articles>,
}

// Article data structure returned by GDELT API
#[derive(Deserialize, Serialize, Debug, Default)]
pub struct Articles {
    pub url: String,
    pub url_mobile: String,
    pub title: String,
    pub seendate: String,
    pub socialimage: String,
    pub domain: String,
    pub language: String,
    pub sourcecountry: String,
}

// Detailed information extracted from article scraping
#[derive(Deserialize, Serialize, Debug, Default)]
pub struct Info {
    pub title: String,
    pub url: String,
    pub description: String,
    pub keywords: Vec<String>,
}

// Parameters for GDELT API requests
pub struct Params {
    query: String,
    mode: &'static str,
    startdatetime: String,
    enddatetime: String,
    format: &'static str,
    language: String,
}

impl Params {
    // Create new parameters with formatted datetime strings
    pub fn new(
        query: String,
        startdatetime: chrono::NaiveDate,
        enddatetime: chrono::NaiveDate,
        language: String,
    ) -> Self {
        let start_str = format!("{}000000", startdatetime.format("%Y%m%d"));
        let end_str = format!("{}235959", enddatetime.format("%Y%m%d"));

        Self {
            query,
            mode: MODE,
            startdatetime: start_str,
            enddatetime: end_str,
            format: FORMAT,
            language,
        }
    }
}

pub struct NoticesScraper;

impl NoticesScraper {
    // Fetch articles from GDELT API
    pub async fn get_articles(params: Params) -> anyhow::Result<Vec<Articles>> {
        let mut url = Url::parse(BASE_URL)?;

        // Build query with language filter
        let full_query = format!("{} sourcelang:{}", params.query, params.language);

        // Add query parameters to URL
        url.query_pairs_mut()
            .append_pair("query", &full_query)
            .append_pair("mode", params.mode)
            .append_pair("startdatetime", &params.startdatetime)
            .append_pair("enddatetime", &params.enddatetime)
            .append_pair("format", params.format)
            .append_pair("language", &params.language);

        let client = Client::new();
        let response = client.get(url).send().await?;
        let body = response.text().await?;

        if body.trim().is_empty() {
            return Ok(Vec::new());
        }

        // Try to parse response as ApiResponse first, then as direct Vec<Articles>
        let articles = match serde_json::from_str::<ApiResponse>(&body) {
            Ok(response) => response.articles,
            Err(_) => match serde_json::from_str::<Vec<Articles>>(&body) {
                Ok(articles) => articles,
                Err(_) => Vec::new(),
            },
        };

        Ok(articles)
    }

    // Get detailed information by scraping individual article pages
    pub async fn get_details(params: Params) -> anyhow::Result<Details> {
        let articles = Self::get_articles(params).await?;
        let client = Client::new();

        // Create concurrent futures for scraping each article
        let futures = articles.into_iter().map(|article| {
            let client = client.clone();
            let article_url = article.url.clone();

            async move {
                let request_future = client.get(&article_url).send();
                
                // Apply timeout to prevent hanging requests
                match timeout(Duration::from_secs(MAX_TIMEOUT), request_future).await {
                    Ok(Ok(response)) => match response.text().await {
                        Ok(body) => {
                            let document = Html::parse_document(&body);

                            // Extract title from h1 tag
                            if let Some(element) = document.select(&TITLE_SELECTOR).next() {
                                let title = element.text().collect::<Vec<_>>().join(" ");

                                // Extract keywords from meta tag
                                if let Some(element) = document.select(&KEYWORD_SELECTOR).next() {
                                    let keywords_str = element.attr("content").unwrap_or_default();

                                    // Extract description from meta tag
                                    if let Some(element) =
                                        document.select(&DESCRIPTION_SELECTOR).next()
                                    {
                                        let description =
                                            element.attr("content").unwrap_or_default().to_string();

                                        return Some(Info {
                                            title,
                                            url: article_url,
                                            description,
                                            keywords: keywords_str
                                                .split(',')
                                                .map(|s| s.trim().to_string())
                                                .collect(),
                                        });
                                    }
                                }
                            }
                        }
                        Err(_) => {}
                    },
                    Ok(Err(_)) => {},
                    Err(_) => {} // Timeout occurred
                }
                None
            }
        });

        // Wait for all scraping operations to complete
        let results = join_all(futures).await;
        let mut details: Vec<Info> = results.into_iter().filter_map(|result| result).collect();
        
        // Sort by number of keywords (descending) and limit results
        details.sort_by(|a, b| b.keywords.len().cmp(&a.keywords.len()));
        details = details.into_iter().take(MAX_ARTICLES).collect();

        // Process keywords: sort by word count, limit quantity, and format as hashtags
        for detail in &mut details {
            detail.keywords.sort_by_key(|keyword| keyword.split(" ").count());
            detail.keywords = detail.keywords.clone().into_iter().take(MAX_HASHTAGS).collect();
            // Convert keywords to PascalCase format for hashtags
            detail.keywords = detail.keywords.iter().map(|keyword| {
                keyword.to_lowercase().split(' ')
                    .filter(|s| !s.is_empty())
                    .map(|word| {
                        let mut chars = word.chars();
                        match chars.next() {
                            None => String::new(),
                            Some(first) => first.to_uppercase().collect::<String>() + chars.as_str(),
                        }
                    })
                    .collect::<String>()
            }).collect();
        }

        Ok(details)
    }
}
