use crate::scraping::instagram::InstagramScraper;

#[tokio::test]
async fn test_instagram_login_executes_successfully() {
    let result = InstagramScraper::login().await;
    assert!(result.is_ok(), "Login should return Ok result");
    let cookies = result.unwrap();
    assert!(!cookies.is_empty(), "Cookies should not be empty after login");
}

#[tokio::test]
async fn test_instagram_get_followers_from_profile() {
    let link = "https://www.instagram.com/natgeo/".to_string(); // perfil público real
    let result = InstagramScraper::get_followers(link).await;
    assert!(result.is_ok(), "Expected Ok result from get_followers");
    let count = result.unwrap();
    assert!(!count.is_empty(), "Followers count should not be empty");
}

#[tokio::test]
async fn test_instagram_get_time_and_link_from_post() {
    let link = "https://www.instagram.com/reel/C6mlO0DPGik/".to_string(); // reel público real
    let result = InstagramScraper::get_time_and_link(link).await;
    assert!(result.is_ok(), "Expected Ok result from get_time_and_link");
    let data = result.unwrap();
    assert!(!data.time.is_empty(), "Time should not be empty");
    assert!(data.link.contains("instagram.com"), "Link should be a valid Instagram link");
}

#[tokio::test]
async fn test_instagram_get_posts_from_hashtag() {
    let hashtag = "nature".to_string(); // hashtag común
    let result = InstagramScraper::get_posts(hashtag).await;
    assert!(result.is_ok(), "Expected Ok result from get_posts");

    let posts = result.unwrap();
    assert!(!posts.is_empty(), "Expected non-empty post list");

    let post = &posts[0];
    assert!(post.likes > 0 || post.comments > 0 || post.followers > 0, "Post seems empty");
}