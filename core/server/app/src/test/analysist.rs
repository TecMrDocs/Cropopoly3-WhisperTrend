// Copyright 2025 WhisperTrend
// Este archivo pertenece al proyecto WhisperTrend
// Tester: Santiago Villazón Ponce de León
// Fecha: 12-06-2025

// Este módulo contiene pruebas unitarias para el funcionamiento de las rutas en analysis.rs

use actix_web::{http::StatusCode, test, App};
use crate::controllers::analysis;
use dotenv::dotenv;
use std::env;

#[actix_rt::test]
async fn test_analysis_base() {
    dotenv().ok(); // ⬅️ Carga el .env

    // Opcional: puedes loguear si se cargó bien
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
