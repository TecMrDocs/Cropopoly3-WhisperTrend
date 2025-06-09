// Copyright 2025 WhisperTrend
// Este archivo pertenece al proyecto WhisperTrend
// Tester: Santiago Villazón Ponce de León
// Fecha: 05-06-2025

// Este módulo contiene pruebas unitarias para el funcionamiento de las rutas en notices.rs


use actix_web::{test, web, App};
use serde_json::json;
use crate::controllers::web::{get_notices, get_details, Query};

#[actix_web::test]
async fn test_get_notices_returns_valid_response() {
    let app = test::init_service(
        App::new()
            .service(get_notices)
    ).await;

    let payload = json!({
        "query": "mexico",
        "startdatetime": "2024-01-01",
        "enddatetime": "2024-12-31",
        "language": "english"
    });

    let req = test::TestRequest::post()
        .uri("/notices/get-notices")
        .set_json(&payload)
        .to_request();

    let resp = test::call_service(&app, req).await;
    assert!(resp.status().is_success());

    let body = test::read_body(resp).await;
    let body_str = std::str::from_utf8(&body).unwrap();
    assert!(body_str.contains("title"));
}

#[actix_web::test]
async fn test_get_details_returns_valid_response() {
    let app = test::init_service(
        App::new()
            .service(get_details)
    ).await;

    let payload = json!({
        "query": "mexico",
        "startdatetime": "2024-01-01",
        "enddatetime": "2024-12-31",
        "language": "english"
    });

    let req = test::TestRequest::post()
        .uri("/notices/get-details")
        .set_json(&payload)
        .to_request();

    let resp = test::call_service(&app, req).await;
    assert!(resp.status().is_success());

    let body = test::read_body(resp).await;
    let body_str = std::str::from_utf8(&body).unwrap();
    assert!(body_str.contains("title"));
}