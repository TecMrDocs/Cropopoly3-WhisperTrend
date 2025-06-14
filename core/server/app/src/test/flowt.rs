/**
 * Pruebas unitarias para las rutas del módulo flow.rs
 *
 * Este archivo verifica que las rutas definidas en `controllers/flow.rs` respondan correctamente
 * al realizar solicitudes POST simuladas. Se validan tres endpoints:
 * - `/flow/debug/check-scraped-data`
 * - `/flow/debug/force-save-empty-hashtags`
 * - `/flow/test-generate-prompt`
 *
 * Tester: Santiago Villazón Ponce de León
 * Fecha: 12-06-2025
 * Proyecto: WhisperTrend
 */

use actix_web::{http::StatusCode, test, web, App};
use crate::controllers::flow;
use dotenv::dotenv;

/**
 *
 * Prueba el endpoint POST `/flow/debug/check-scraped-data`.
 *
 * Esta ruta permite revisar los datos scrapeados antes de que sean procesados.
 * En este test se envía un JSON vacío para `instagram`, `reddit` y `twitter`.
 *
 * @param data Objeto con listas vacías de redes sociales.
 * @assert El servidor debe responder con StatusCode::OK.
 */
#[actix_rt::test]
async fn test_check_scraped_data() {
    let app = test::init_service(
        App::new().service(web::scope("/api/v1").service(flow::routes())),
    )
    .await;

    let req = test::TestRequest::post()
        .uri("/api/v1/flow/debug/check-scraped-data")
        .set_json(&serde_json::json!({
            "data": {
                "instagram": [],
                "reddit": [],
                "twitter": []
            }
        }))
        .to_request();

    let resp = test::call_service(&app, req).await;
    assert_eq!(resp.status(), StatusCode::OK);
}

/**
 *
 * Prueba el endpoint POST `/flow/debug/force-save-empty-hashtags`.
 *
 * Esta ruta simula la operación de guardar hashtags vacíos cuando no se detectan tendencias.
 * Es útil para pruebas de edge case donde no se encontró información relevante.
 *
 * @param metadata Lista vacía (metadatos).
 * @param data Listas vacías de datos por red social.
 * @assert La respuesta debe ser 200 OK.
 */
#[actix_rt::test]
async fn test_force_save_empty_hashtags() {
    let app = test::init_service(
        App::new().service(web::scope("/api/v1").service(flow::routes())),
    )
    .await;

    let req = test::TestRequest::post()
        .uri("/api/v1/flow/debug/force-save-empty-hashtags")
        .set_json(&serde_json::json!({
            "metadata": [],
            "data": {
                "instagram": [],
                "reddit": [],
                "twitter": []
            }
        }))
        .to_request();

    let resp = test::call_service(&app, req).await;
    assert_eq!(resp.status(), StatusCode::OK);
}

/**
 *
 * Prueba el endpoint POST `/flow/test-generate-prompt`.
 *
 * Esta ruta genera un prompt de prueba basado en un `resource_id`. Es utilizada como modo
 * de testeo interno para validar el motor de generación de prompts antes de un despliegue real.
 *
 * @param resource_id Identificador de recurso simulado.
 * @assert Debe responder con StatusCode::OK si todo está configurado correctamente.
 */
#[actix_rt::test]
async fn test_generate_prompt_test_mode() {
    dotenv().ok(); // Carga variables de entorno del .env si existen

    let app = test::init_service(
        App::new().service(web::scope("/api/v1").service(flow::routes())),
    )
    .await;

    let req = test::TestRequest::post()
        .uri("/api/v1/flow/test-generate-prompt")
        .set_json(&serde_json::json!({
            "resource_id": 1
        }))
        .to_request();

    let resp = test::call_service(&app, req).await;
    assert_eq!(resp.status(), StatusCode::OK);
}
