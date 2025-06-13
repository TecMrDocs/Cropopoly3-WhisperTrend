use actix_web::{http::StatusCode, test, App};
use crate::nosql::controllers::analytics;

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
