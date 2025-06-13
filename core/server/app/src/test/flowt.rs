use actix_web::{http::StatusCode, test, web, App};
use crate::controllers::flow;
use dotenv::dotenv;

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

#[actix_rt::test]
async fn test_generate_prompt_test_mode() {
    dotenv().ok(); 

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
