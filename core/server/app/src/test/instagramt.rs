// Copyright 2025 WhisperTrend
// Este archivo pertenece al proyecto WhisperTrend
// Tester: Santiago Villazón Ponce de León
// Fecha: 05-06-2025

// Este módulo contiene pruebas unitarias para el funcionamiento de las rutas en instagram.rs

use crate::scraping::instagram::InstagramScraper;
use tokio::time::{timeout, Duration};

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


