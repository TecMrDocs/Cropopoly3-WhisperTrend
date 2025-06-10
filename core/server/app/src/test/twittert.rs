use crate::scraping::twitter::TwitterScraper;

#[tokio::test]
async fn test_login_to_twitter_runs() {
    let result = TwitterScraper::login().await;
    assert!(result.is_ok());
}

#[tokio::test]
async fn test_apply_login_runs() {
    let result = TwitterScraper::apply_login().await;
    assert!(result.is_ok());
}

#[tokio::test]
async fn test_get_posts_runs() {
    let result = TwitterScraper::get_posts("openai".to_string()).await;
    assert!(result.is_ok());
}

// #[tokio::test]
// async fn test_get_time_and_link_runs() {
//     let html = r#"<article><a href="/openai/status/123"><time datetime="2025-01-01T00:00:00.000Z">1 Jan</time></a></article>"#;
//     let document = scraper::Html::parse_document(html);
//     let selector = scraper::Selector::parse("article").unwrap();
//     let node = document.select(&selector).next().unwrap();
//     let node_html = node.html();
//     let result = TwitterScraper::get_time_and_link(node_html).await;
//     assert!(result.is_ok());
// }

// #[tokio::test]
// async fn test_get_followers_runs() {
//     let result = TwitterScraper::get_followers("https://twitter.com/openai".to_string()).await;
//     assert!(result.is_ok());
// }