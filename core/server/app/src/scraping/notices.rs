use futures::future::join_all;
use lazy_static::lazy_static;
use reqwest::Client;
use scraper::{Html, Selector};
use serde::{Deserialize, Serialize};
use url::Url;

lazy_static! {
    static ref TITLE_SELECTOR: Selector = Selector::parse("h1").unwrap();
    static ref KEYWORD_SELECTOR: Selector = Selector::parse("meta[name='keywords']").unwrap();
    static ref DESCRIPTION_SELECTOR: Selector =
        Selector::parse("meta[name='description']").unwrap();
}

const BASE_URL: &str = "https://api.gdeltproject.org/api/v2/doc/doc";
const MODE: &str = "artlist";
const FORMAT: &str = "JSON";

#[derive(Deserialize, Serialize, Debug)]
pub struct ApiResponse {
    pub articles: Vec<Articles>,
}

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

#[derive(Deserialize, Serialize, Debug, Default)]
pub struct Info {
    pub title: String,
    pub url: String,
    pub description: String,
    pub keywords: Vec<String>,
}

pub struct Params {
    query: String,
    mode: &'static str,
    startdatetime: String,
    enddatetime: String,
    format: &'static str,
    language: String,
}

impl Params {
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
    pub async fn get_articles(params: Params) -> anyhow::Result<Vec<Articles>> {
        let mut url = Url::parse(BASE_URL)?;

        let full_query = format!("{} sourcelang:{}", params.query, params.language);

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

        let articles = match serde_json::from_str::<ApiResponse>(&body) {
            Ok(response) => response.articles,
            Err(_) => match serde_json::from_str::<Vec<Articles>>(&body) {
                Ok(articles) => articles,
                Err(_) => Vec::new(),
            },
        };

        Ok(articles)
    }

    pub async fn get_details(params: Params) -> anyhow::Result<Vec<Info>> {
        let articles = Self::get_articles(params).await?;
        let client = Client::new();

        let futures = articles.into_iter().map(|article| {
            let client = client.clone();
            let article_url = article.url.clone();

            async move {
                match client.get(&article_url).send().await {
                    Ok(response) => match response.text().await {
                        Ok(body) => {
                            let document = Html::parse_document(&body);

                            if let Some(element) = document.select(&TITLE_SELECTOR).next() {
                                let title = element.text().collect::<Vec<_>>().join(" ");

                                if let Some(element) = document.select(&KEYWORD_SELECTOR).next() {
                                    let keywords_str = element.attr("content").unwrap_or_default();

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
                    Err(_) => {}
                }
                None
            }
        });

        let results = join_all(futures).await;
        let details: Vec<Info> = results.into_iter().filter_map(|result| result).collect();

        Ok(details)
    }
}
