use crate::scraping::notices::Details;
use crate::scraping::trends::TrendsScraper;
use crate::scraping::notices::Info;

#[tokio::test]
async fn test_get_reddit_metrics_returns_data() {
    let details = vec![Info {
        title: "rust".to_string(),
        url: "https://www.reddit.com/r/rust/".to_string(),
        description: "Testing Reddit metrics".to_string(),
        keywords: vec!["rust".to_string()],
    }];

    let result = TrendsScraper::get_reddit_metrics(&details).await;
    assert!(!result.is_empty(), "Expected at least one RedditMetrics entry");

    let reddit_metric = &result[0];
    assert!(!reddit_metric.keyword.is_empty(), "Keyword should not be empty");
    assert!(!reddit_metric.posts.is_empty(), "Expected posts in Reddit metric");

    let post = &reddit_metric.posts[0];
    assert!(!post.title.is_empty(), "Post title should not be empty");
    assert!(
        post.vote > 0 || post.comments > 0 || post.members > 0,
        "Post should show engagement"
    );
}

#[tokio::test]
async fn test_get_instagram_metrics_returns_data() {
    let details = vec![Info {
        title: "nature".to_string(),
        url: "https://www.instagram.com/explore/tags/nature/".to_string(),
        description: "Testing Instagram metrics".to_string(),
        keywords: vec!["nature".to_string()],
    }];

    let result = TrendsScraper::get_instagram_metrics(&details).await;
    assert!(!result.is_empty(), "Expected at least one InstagramMetrics entry");

    let insta_metric = &result[0];
    assert!(!insta_metric.keyword.is_empty(), "Keyword should not be empty");
    assert!(!insta_metric.posts.is_empty(), "Expected posts in Instagram metric");

    let post = &insta_metric.posts[0];
    assert!(
        post.likes > 0 || post.comments > 0 || post.followers > 0,
        "Post should show engagement"
    );
}