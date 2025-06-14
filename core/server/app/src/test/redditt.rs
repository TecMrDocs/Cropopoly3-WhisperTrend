/**
 * Pruebas unitarias para el módulo scraping::reddit
 *
 * Este archivo contiene pruebas automatizadas para verificar que las funciones del scraper
 * de Reddit estén devolviendo resultados válidos. Se testean dos funciones principales:
 * - `get_simple_posts_by_keyword`: retorna posts simples dados unos keywords.
 * - `get_simple_posts_with_members`: retorna posts con información de miembros del subreddit.
 *
 * Tester: Santiago Villazón Ponce de León
 * Fecha: 05-06-2025
 * Proyecto: WhisperTrend
 */

use crate::scraping::reddit::{RedditScraper, SimplePost, SimplePostWithMembers};

/**
 *
 * Prueba la función `get_simple_posts_by_keyword`.
 *
 * Esta función busca posts relacionados con una palabra clave. En esta prueba se usa la keyword `"rust"`,
 * común en Reddit, para garantizar que haya resultados.
 *
 * @assert El resultado debe ser un vector no vacío.
 * @assert El primer post debe tener título.
 * @assert El post debe tener engagement (votos o comentarios).
 * @assert El campo `subreddit` debe contener un enlace válido a reddit.com.
 */
#[tokio::test]
async fn test_get_simple_posts_by_keyword_returns_data() {
    let posts = RedditScraper::get_simple_posts_by_keyword("rust".to_string()).await;
    assert!(!posts.is_empty(), "Expected posts from subreddit search");
    
    let post = &posts[0];
    assert!(!post.title.is_empty(), "Post title should not be empty");
    assert!(post.vote > 0 || post.comments > 0, "Engagement should not be zero");
    assert!(post.subreddit.contains("reddit.com"), "Subreddit should be a valid link");
}

/**
 *
 * Prueba la función `get_simple_posts_with_members`.
 *
 * Esta versión del scraper también devuelve el número de miembros del subreddit.
 * Se usa la keyword `"technology"` para garantizar actividad y presencia de audiencia.
 *
 * @assert Debe devolver una lista no vacía de publicaciones.
 * @assert El post debe tener título.
 * @assert Debe tener votos, comentarios o miembros para ser considerado válido.
 * @assert El campo `subreddit` debe tener un link válido de Reddit.
 */
#[tokio::test]
async fn test_get_simple_posts_with_members_returns_data() {
    let posts = RedditScraper::get_simple_posts_with_members("technology".to_string()).await;
    assert!(!posts.is_empty(), "Expected posts from subreddit with members");

    let post = &posts[0];
    assert!(!post.title.is_empty(), "Post title should not be empty");
    assert!(post.vote > 0 || post.comments > 0 || post.members > 0, "Post should have engagement or audience");
    assert!(post.subreddit.contains("reddit.com"), "Subreddit should be a valid link");
}
