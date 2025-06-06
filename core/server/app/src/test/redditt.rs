use crate::scraping::reddit::{RedditScraper, SimplePost, SimplePostWithMembers};

#[tokio::test]
async fn test_get_simple_posts_by_keyword_returns_data() {
    let posts = RedditScraper::get_simple_posts_by_keyword("rust".to_string()).await;
    assert!(!posts.is_empty(), "Expected posts from subreddit search");
    
    let post = &posts[0];
    assert!(!post.title.is_empty(), "Post title should not be empty");
    assert!(post.vote > 0 || post.comments > 0, "Engagement should not be zero");
    assert!(post.subreddit.contains("reddit.com"), "Subreddit should be a valid link");
}

#[tokio::test]
async fn test_get_simple_posts_with_members_returns_data() {
    let posts = RedditScraper::get_simple_posts_with_members("technology".to_string()).await;
    assert!(!posts.is_empty(), "Expected posts from subreddit with members");

    let post = &posts[0];
    assert!(!post.title.is_empty(), "Post title should not be empty");
    assert!(post.vote > 0 || post.comments > 0 || post.members > 0, "Post should have engagement or audience");
    assert!(post.subreddit.contains("reddit.com"), "Subreddit should be a valid link");
}