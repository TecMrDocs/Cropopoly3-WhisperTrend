use reqwest::Client;
use serde::{Deserialize, Serialize};
use url::Url;

const MODE: &str = "artlist";
const FORMAT: &str = "JSON";

#[derive(Deserialize, Serialize, Debug)]
pub struct ApiResponse {
    #[serde(default)]
    pub articles: Vec<Articles>,
}

#[derive(Deserialize, Serialize, Debug, Default)]
pub struct Articles {
    #[serde(default)]
    pub url: String,
    #[serde(default)]
    pub url_mobile: String,
    #[serde(default)]
    pub title: String,
    #[serde(default)]
    pub seendate: String,
    #[serde(default)]
    pub socialimage: String,
    #[serde(default)]
    pub domain: String,
    #[serde(default)]
    pub language: String,
    #[serde(default)]
    pub sourcecountry: String,
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
        let base_url = "https://api.gdeltproject.org/api/v2/doc/doc";
        let mut url = Url::parse(base_url)?;

        url.query_pairs_mut()
            .append_pair("query", &params.query)
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
}
