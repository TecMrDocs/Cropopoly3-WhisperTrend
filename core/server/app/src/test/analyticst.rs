/**
 * Pruebas unitarias para las rutas del módulo analytics.rs
 *
 * Este archivo contiene pruebas automatizadas usando Actix Web para validar que las rutas del 
 * controlador `analytics.rs` respondan correctamente. Se testean los endpoints:
 * - `/analytics/process`: Procesa datos de tendencias y ventas.
 * - `/analytics/test`: Endpoint de prueba para validar el servicio.
 *
 * Tester: Santiago Villazón Ponce de León
 * Fecha: 12-06-2025
 * Proyecto: WhisperTrend
 */

use actix_web::{http::StatusCode, test, App};
use crate::nosql::controllers::analytics;

/**
 *
 * Prueba el endpoint POST `/analytics/process`.
 *
 * Envía un JSON simulado con datos de un hashtag y sus métricas de Instagram para verificar que
 * el procesamiento funcione correctamente.
 *
 * @param hashtags Lista de hashtags analizados.
 * @param trends Objeto con plataformas y sus publicaciones.
 * @param sales Lista de ventas simuladas (en este test está vacía).
 *
 * @assert El servidor debe responder con StatusCode::OK (200).
 */
#[actix_rt::test]
async fn test_process_analytics_endpoint() {
    let app = test::init_service(
        App::new().service(analytics::routes()),
    )
    .await;

    let req = test::TestRequest::post()
        .uri("/analytics/process")
        .set_json(&serde_json::json!({
            "hashtags": ["TestTag"],
            "trends": {
                "instagram": [
                    {
                        "keyword": "TestTag",
                        "posts": [
                            {
                                "date": "01/01/25 - 31/01/25",
                                "likes": 1200,
                                "comments": 100,
                                "views": 15000,
                                "followers": 50000,
                                "shares": 80
                            }
                        ]
                    }
                ],
                "reddit": [],
                "twitter": []
            },
            "sales": []
        }))
        .to_request();

    let resp = test::call_service(&app, req).await;
    assert_eq!(resp.status(), StatusCode::OK);
}

/**
 *
 * Prueba el endpoint POST `/analytics/test`.
 *
 * Esta ruta es usada como prueba para verificar que el servidor responde correctamente a un test básico.
 * No se requiere body en el request.
 *
 * @assert El servidor debe devolver StatusCode::OK (200).
 */
#[actix_rt::test]
async fn test_test_analytics_endpoint() {
    let app = test::init_service(
        App::new().service(analytics::routes()),
    )
    .await;

    let req = test::TestRequest::post()
        .uri("/analytics/test")
        .to_request();

    let resp = test::call_service(&app, req).await;
    assert_eq!(resp.status(), StatusCode::OK);
}
