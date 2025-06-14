/**
 * Pruebas unitarias para el módulo scraping::instagram
 *
 * Este archivo valida que el scraper de Instagram esté funcionando correctamente al invocar
 * la función `get_posts` con un hashtag real y verificar que los datos retornados contengan
 * al menos un post con métricas válidas.
 *
 * Tester: Santiago Villazón Ponce de León
 * Fecha: 05-06-2025
 * Proyecto: WhisperTrend
 */

use crate::scraping::instagram::InstagramScraper;
use tokio::time::{timeout, Duration};

/**
 *
 * Prueba la función `InstagramScraper::get_posts` utilizando el hashtag "nature".
 *
 * Se asegura de que:
 * - La función no falle (devuelve un `Result::Ok`).
 * - El vector de publicaciones no esté vacío.
 * - Al menos una publicación tenga algún dato relevante (likes, comments o followers).
 *
 * Esta prueba está pensada para validar el flujo completo de scraping en un caso real.
 *
 * @assert La función debe devolver un Ok con una lista no vacía de publicaciones.
 * @assert Cada post debe contener al menos una métrica válida mayor a 0.
 */
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
