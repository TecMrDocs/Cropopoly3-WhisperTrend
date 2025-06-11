// Copyright 2025 WhisperTrend
// Este archivo pertenece al proyecto WhisperTrend
// Tester: Santiago Villazón Ponce de León
// Fecha: 10-06-2025

// Este módulo contiene pruebas unitarias para el funcionamiento de las rutas en twitter.rs

use crate::scraping::twitter::TwitterScraper;

#[tokio::test]
async fn test_login_to_twitter_runs() {
    let result = TwitterScraper::login().await;
    assert!(result.is_ok());
}

#[tokio::test]
async fn test_get_posts_runs() {
    let result = TwitterScraper::get_posts("openai".to_string()).await;
    assert!(result.is_ok());
}