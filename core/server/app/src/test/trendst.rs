/**
 * Pruebas unitarias para el módulo scraping::trends
 *
 * Este archivo verifica que el scraper de tendencias esté funcionando correctamente para Reddit
 * e Instagram. Usa entradas simuladas (`Info`) para evaluar que las métricas obtenidas contengan
 * datos reales y que cada post incluya engagement como likes, votos, comentarios o followers.
 *
 * Tester: Santiago Villazón Ponce de León
 * Fecha: 05-06-2025
 * Proyecto: WhisperTrend
 */

use crate::scraping::notices::Details;
use crate::scraping::trends::TrendsScraper;
use crate::scraping::notices::Info;

/**
 *
 * Prueba la función `get_reddit_metrics` del scraper de tendencias.
 *
 * Envía un arreglo con un objeto `Info` apuntando a un subreddit y valida que el resultado contenga
 * al menos una métrica con posts válidos.
 *
 * @param details Arreglo con título, url y keywords relacionadas a un subreddit.
 * @assert El resultado debe incluir al menos una entrada de métricas.
 * @assert El primer post debe tener título y al menos algún tipo de engagement.
 */
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

/**
 *
 * Prueba la función `get_instagram_metrics` del scraper de tendencias.
 *
 * Usa una entrada `Info` simulada para hashtag de Instagram y valida que la métrica retornada contenga
 * publicaciones con datos relevantes como likes, comentarios o followers.
 *
 * @param details Arreglo con título, URL y palabras clave relacionadas con el hashtag.
 * @assert La función debe retornar al menos una métrica con publicaciones.
 * @assert Cada post debe tener engagement en alguna métrica.
 */
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
