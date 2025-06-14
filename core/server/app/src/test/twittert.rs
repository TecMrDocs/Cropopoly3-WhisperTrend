/**
 * Pruebas unitarias para el módulo scraping::twitter
 *
 * Este archivo contiene pruebas básicas para validar que las funciones principales del scraper
 * de Twitter se ejecutan sin errores. Se verifica que el login funcione y que se puedan obtener
 * publicaciones usando una palabra clave real.
 *
 * Tester: Santiago Villazón Ponce de León
 * Fecha: 10-06-2025
 * Proyecto: WhisperTrend
 */

use crate::scraping::twitter::TwitterScraper;

/**
 *
 * Prueba la función `TwitterScraper::login`.
 *
 * Verifica que el proceso de login automatizado no arroje errores.
 * No se valida el contenido de las cookies ni sesión, solo que el resultado sea `Ok`.
 *
 * @assert El resultado de login debe ser `Result::Ok`.
 */
#[tokio::test]
async fn test_login_to_twitter_runs() {
    let result = TwitterScraper::login().await;
    assert!(result.is_ok());
}

/**
 *
 * Prueba la función `TwitterScraper::get_posts`.
 *
 * Se busca que la función sea capaz de ejecutar una búsqueda por palabra clave (en este caso "openai")
 * y que no devuelva error. Esta prueba asume que existe contenido público relacionado.
 *
 * @param keyword Palabra clave a buscar (en este caso, "openai").
 * @assert La función debe ejecutarse correctamente y retornar `Ok`.
 */
#[tokio::test]
async fn test_get_posts_runs() {
    let result = TwitterScraper::get_posts("openai".to_string()).await;
    assert!(result.is_ok());
}
