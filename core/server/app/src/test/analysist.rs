/**
 * Pruebas unitarias para las rutas del módulo analysis.rs
 *
 * Este archivo contiene una serie de pruebas automatizadas usando Actix Web para validar
 * que las rutas principales del controlador `analysis.rs` respondan correctamente a las
 * solicitudes esperadas. Se incluyen pruebas para los endpoints `/analysis`, `/analysis/dummy`,
 * `/analysis/previous`, `/analysis/latest` y `/analysis/test-prompt-context`.
 *
 * Tester: Santiago Villazón Ponce de León
 * Fecha: 12-06-2025
 * Proyecto: WhisperTrend
 */

use actix_web::{http::StatusCode, test, App};
use crate::controllers::analysis;
use dotenv::dotenv;
use std::env;

/**
 *
 * Prueba el endpoint POST `/analysis`.
 *
 * Carga el archivo `.env`, obtiene la clave de API GROQ para confirmar que está disponible,
 * y luego simula una petición POST con un JSON representando datos de análisis.
 * 
 * @assert Verifica que la respuesta del servidor sea 200 OK.
 */
#[actix_rt::test]
async fn test_analysis_base() {
    dotenv().ok(); // Carga el archivo .env

    // Verifica que la variable de entorno esté disponible
    let key = env::var("GROQ_API_KEY").expect("Falta GROQ_API_KEY en el entorno");
    println!("GROQ_API_KEY desde test: {}", key);

    let app = test::init_service(
        App::new().service(analysis::routes()),
    )
    .await;

    let req = test::TestRequest::post()
        .uri("/analysis")
        .set_json(&serde_json::json!({
            "model": "llama3-8b-8192",
            "analysis_data": { "some": "data" }
        }))
        .to_request();

    let resp = test::call_service(&app, req).await;
    assert_eq!(resp.status(), StatusCode::OK);
}

/**
 *
 * Prueba el endpoint GET `/analysis/dummy`.
 *
 * Esta prueba verifica que el endpoint dummy para análisis responde correctamente.
 * No requiere cuerpo en la petición, solo el método GET.
 * 
 * @assert Respuesta debe ser 200 OK.
 */
#[actix_rt::test]
async fn test_analysis_dummy() {
    let app = test::init_service(
        App::new().service(crate::controllers::analysis::routes()),
    )
    .await;

    let req = test::TestRequest::get().uri("/analysis/dummy").to_request();
    let resp = test::call_service(&app, req).await;

    assert_eq!(resp.status(), actix_web::http::StatusCode::OK);
}

/**
 *
 * Prueba el endpoint GET `/analysis/previous`.
 *
 * Simula una petición GET al endpoint que debe devolver los análisis anteriores.
 * 
 * @assert Se espera respuesta 200 OK si está correctamente implementado.
 */
#[actix_rt::test]
async fn test_analysis_previous() {
    let app = test::init_service(
        App::new().service(crate::controllers::analysis::routes()),
    )
    .await;

    let req = test::TestRequest::get().uri("/analysis/previous").to_request();
    let resp = test::call_service(&app, req).await;

    assert_eq!(resp.status(), actix_web::http::StatusCode::OK);
}

/**
 *
 * Prueba el endpoint GET `/analysis/latest`.
 *
 * Valida que el controlador de análisis devuelva correctamente el análisis más reciente.
 * 
 * @assert Código de estado esperado: 200 OK.
 */
#[actix_rt::test]
async fn test_analysis_latest() {
    let app = test::init_service(
        App::new().service(crate::controllers::analysis::routes()),
    )
    .await;

    let req = test::TestRequest::get().uri("/analysis/latest").to_request();
    let resp = test::call_service(&app, req).await;

    assert_eq!(resp.status(), actix_web::http::StatusCode::OK);
}

/**
 *
 * Prueba el endpoint POST `/analysis/test-prompt-context`.
 *
 * Se simula el envío de un cuerpo JSON con distintos parámetros simulando un contexto de análisis.
 * 
 * @param sentence Oración base para el análisis.
 * @param hashtags Lista de hashtags relacionados.
 * @param trends Objeto con tendencias analizadas.
 * @param calculated_results Resultado del modelo (puede ser null).
 * @param sales Datos de ventas (puede ser null).
 * @param resource_name Nombre del recurso al que se está aplicando el análisis.
 * @param processing Información sobre el procesamiento (puede ser null).
 * 
 * @assert Se espera que el servidor acepte el JSON y devuelva 200 OK.
 */
#[actix_rt::test]
async fn test_analysis_test_prompt_context() {
    let app = test::init_service(
        App::new().service(crate::controllers::analysis::routes()),
    )
    .await;

    let req = test::TestRequest::post()
        .uri("/analysis/test-prompt-context")
        .set_json(&serde_json::json!({
            "sentence": "ejemplo",
            "hashtags": ["#trend"],
            "trends": {},
            "calculated_results": null,
            "sales": null,
            "resource_name": "demo",
            "processing": null
        }))
        .to_request();

    let resp = test::call_service(&app, req).await;
    assert_eq!(resp.status(), actix_web::http::StatusCode::OK);
}
