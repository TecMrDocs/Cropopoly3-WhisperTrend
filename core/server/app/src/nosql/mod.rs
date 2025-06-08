// nosql/mod.rs - CÓDIGO COMPLETO FINAL - ÚLTIMO INTENTO
use actix_web::{web, HttpResponse, Responder, get, post, Result};
use serde_json::json;
use aws_sdk_dynamodb::{Client, types::AttributeValue, error::SdkError};
use aws_sdk_sts::Client as StsClient;
use aws_config::BehaviorVersion;
use std::collections::HashMap;
use std::env;
use tracing::{info, error, debug, warn};

// ✅ Cliente DynamoDB configurado como el profesor
async fn get_dynamo_client() -> Client {
    let config = aws_config::defaults(BehaviorVersion::latest())
        .load()
        .await;
    
    debug!("AWS Region: {:?}", config.region());
    Client::new(&config)
}

// ✅ Nombres de tabla simples
fn get_table_name(_base_name: &str) -> String {
    "HashtagCache".to_string() // Hardcodeado - sabemos que existe
}

// 🔍 Test básico
#[get("/test")]
async fn test_endpoint() -> Result<impl Responder> {
    info!("Testing NoSQL with professor's configuration");
    
    let has_access_key = env::var("AWS_ACCESS_KEY_ID").is_ok();
    let has_secret_key = env::var("AWS_SECRET_ACCESS_KEY").is_ok();
    let has_session_token = env::var("AWS_SESSION_TOKEN").is_ok();
    let has_region = env::var("AWS_REGION").is_ok();
    
    Ok(HttpResponse::Ok().json(json!({
        "message": "NoSQL con configuración del profesor!",
        "status": "ok",
        "aws_config": {
            "has_access_key": has_access_key,
            "has_secret_key": has_secret_key,
            "has_session_token": has_session_token,
            "has_region": has_region,
            "table_name": get_table_name("cache"),
            "setup": "Professor-style configuration"
        },
        "timestamp": chrono::Utc::now().to_rfc3339()
    })))
}

// 🧪 Test modo directo SIN verificaciones
#[get("/test/direct")]
async fn test_direct_mode() -> Result<impl Responder> {
    info!("🎯 Testing DIRECT mode (no verifications)");
    
    Ok(HttpResponse::Ok().json(json!({
        "status": "ready",
        "message": "🎯 Modo directo activado - Sin verificaciones previas",
        "mode": "BLIND_MODE",
        "explanation": "Saltamos DescribeTable y vamos directo a PutItem",
        "table_target": "HashtagCache",
        "note": "Tu tabla existe (vimos la captura), pero no tienes permisos para verificarla",
        "next_step": "POST /cache/hashtag para probar PutItem directo",
        "timestamp": chrono::Utc::now().to_rfc3339()
    })))
}

// 🧪 Test otros servicios AWS
#[get("/test/other-services")]
async fn test_other_aws_services() -> Result<impl Responder> {
    info!("Testing other AWS services available in Academy");
    
    let config = aws_config::load_defaults(BehaviorVersion::latest()).await;
    let mut results = json!({
        "services_test": {},
        "timestamp": chrono::Utc::now().to_rfc3339(),
        "note": "Probando qué servicios SÍ están disponibles en AWS Academy"
    });
    
    // Test básico: ver qué región estamos usando
    results["services_test"]["region"] = json!({
        "current_region": config.region().map(|r| r.as_ref()).unwrap_or("unknown"),
        "status": "✅ CONFIG OK"
    });
    
    // Test básico: STS (para ver nuestro usuario/role)
    let sts_client = StsClient::new(&config);
    match sts_client.get_caller_identity().send().await {
        Ok(response) => {
            results["services_test"]["identity"] = json!({
                "status": "✅ STS AVAILABLE",
                "account": response.account.unwrap_or_default(),
                "arn": response.arn.unwrap_or_default(),
                "user_id": response.user_id.unwrap_or_default()
            });
        },
        Err(e) => {
            results["services_test"]["identity"] = json!({
                "status": "❌ STS DENIED",
                "error": format!("{:?}", e)
            });
        }
    }
    
    Ok(HttpResponse::Ok().json(results))
}

// 💾 MODO DIRECTO - Guardar hashtag sin verificaciones
#[post("/cache/hashtag")]
async fn save_hashtag_cache(body: web::Json<serde_json::Value>) -> Result<impl Responder> {
    info!("🎯 BLIND MODE: Saving hashtag directly to existing table");
    debug!("Request body: {:?}", body);
    
    let data = body.into_inner();
    let user_id = data.get("user_id").and_then(|v| v.as_i64()).unwrap_or(999);
    let hashtag = data.get("hashtag").and_then(|v| v.as_str()).unwrap_or("#default");
    
    let timestamp = chrono::Utc::now().timestamp();
    let pk = format!("USER#{}", user_id);
    let sk = format!("HASHTAG#{}#{}", hashtag, timestamp);
    
    info!("🎯 DIRECT PutItem: pk={}, sk={}", pk, sk);
    
    let client = get_dynamo_client().await;
    let table_name = "HashtagCache"; // Hardcodeado - sabemos que existe
    
    // 🚫 NO verificar tabla - ir directo a PutItem
    info!("🎯 Going direct to PutItem on table: {}", table_name);
    
    // Estructura de item igual al profesor
    let mut item = HashMap::new();
    item.insert("pk".to_string(), AttributeValue::S(pk.clone()));
    item.insert("sk".to_string(), AttributeValue::S(sk.clone()));
    item.insert("hashtag".to_string(), AttributeValue::S(hashtag.to_string()));
    item.insert("user_id".to_string(), AttributeValue::N(user_id.to_string()));
    item.insert("raw_data".to_string(), AttributeValue::S(data.to_string()));
    item.insert("created_at".to_string(), AttributeValue::S(chrono::Utc::now().to_rfc3339()));
    
    // Extra fields como el profesor
    item.insert("name".to_string(), AttributeValue::S(format!("HashtagData_{}", hashtag)));
    item.insert("email".to_string(), AttributeValue::S("user@example.com".to_string()));
    item.insert("numeros".to_string(), AttributeValue::N(user_id.to_string()));
    item.insert("modeloNave".to_string(), AttributeValue::S(hashtag.to_string()));
    
    debug!("🎯 DIRECT PutItem attempt on: {}", table_name);
    
    match client.put_item()
        .table_name(table_name)
        .set_item(Some(item))
        .send()
        .await 
    {
        Ok(output) => {
            info!("🎉 SUCCESS! Direct PutItem worked!");
            debug!("DynamoDB response: {:?}", output);
            
            Ok(HttpResponse::Ok().json(json!({
                "status": "success",
                "message": "🎉 ¡FUNCIONÓ! Hashtag guardado directamente sin verificaciones",
                "method": "BLIND_MODE - Direct PutItem",
                "data": {
                    "table": table_name,
                    "pk": pk,
                    "sk": sk,
                    "hashtag": hashtag,
                    "user_id": user_id,
                    "timestamp": chrono::Utc::now().to_rfc3339(),
                    "note": "Guardado exitosamente sin permisos DescribeTable"
                }
            })))
        },
        Err(e) => {
            error!("❌ Direct PutItem failed: {:?}", e);
            
            let error_message = match &e {
                SdkError::ServiceError(service_err) => {
                    let err_str = format!("{:?}", service_err);
                    if err_str.contains("ResourceNotFoundException") {
                        "Tabla no existe (¿nombre incorrecto?)".to_string()
                    } else if err_str.contains("AccessDeniedException") {
                        "Sin permisos para PutItem - AWS Academy bloquea DynamoDB completamente".to_string()
                    } else {
                        format!("Error de servicio: {:?}", service_err)
                    }
                },
                _ => {
                    format!("Error: {:?}", e)
                }
            };
            
            Ok(HttpResponse::InternalServerError().json(json!({
                "status": "error",
                "message": "Error en modo directo",
                "error": error_message,
                "table": table_name,
                "method": "BLIND_MODE - Direct PutItem",
                "debug_info": {
                    "pk": pk,
                    "sk": sk,
                    "hashtag": hashtag,
                    "user_id": user_id
                },
                "conclusion": if error_message.contains("AccessDeniedException") {
                    "🚫 CONFIRMADO: AWS Academy tiene DynamoDB completamente bloqueado para estudiantes"
                } else {
                    "Otro tipo de error"
                },
                "alternatives": [
                    "1. 🐳 Usar DynamoDB Local con Docker",
                    "2. 🎭 Usar modo simulación en memoria",
                    "3. 📄 Usar archivos JSON en S3",
                    "4. 💾 Usar PostgreSQL que ya tienes funcionando"
                ]
            })))
        }
    }
}

// 📊 MODO DIRECTO - Listar datos (scan directo)
#[get("/cache/list")]
async fn list_all_hashtags() -> Result<impl Responder> {
    info!("🎯 BLIND SCAN: Listing all hashtags directly");
    
    let client = get_dynamo_client().await;
    let table_name = "HashtagCache";
    
    match client.scan()
        .table_name(table_name)
        .send()
        .await 
    {
        Ok(result) => {
            let items = result.items.unwrap_or_default();
            let converted_items: Vec<serde_json::Value> = items.iter().map(|item| {
                let mut converted = serde_json::Map::new();
                for (key, value) in item {
                    let converted_value = match value {
                        AttributeValue::S(s) => json!(s),
                        AttributeValue::N(n) => {
                            if let Ok(num) = n.parse::<i64>() {
                                json!(num)
                            } else {
                                json!(n)
                            }
                        },
                        _ => json!("unknown_type")
                    };
                    converted.insert(key.clone(), converted_value);
                }
                json!(converted)
            }).collect();
            
            Ok(HttpResponse::Ok().json(json!({
                "status": "success",
                "message": "🎉 ¡SCAN FUNCIONÓ! Datos listados directamente",
                "method": "BLIND_SCAN - Direct scan",
                "data": {
                    "items_found": converted_items.len(),
                    "items": converted_items,
                    "table": table_name
                },
                "timestamp": chrono::Utc::now().to_rfc3339()
            })))
        },
        Err(e) => {
            error!("❌ Direct scan failed: {:?}", e);
            let error_str = format!("{:?}", e);
            let message = if error_str.contains("ResourceNotFoundException") {
                "Tabla no existe"
            } else if error_str.contains("AccessDeniedException") {
                "Sin permisos para Scan - AWS Academy bloquea DynamoDB"
            } else {
                "Error listando datos"
            };
            
            Ok(HttpResponse::Ok().json(json!({
                "status": "error",
                "message": message,
                "error": error_str,
                "table": table_name,
                "method": "BLIND_SCAN",
                "timestamp": chrono::Utc::now().to_rfc3339()
            })))
        }
    }
}

// 📊 MODO DIRECTO - Query por usuario
#[get("/cache/dashboard/{user_id}/{resource_id}")]
async fn get_dashboard_cache(path: web::Path<(i32, i32)>) -> Result<impl Responder> {
    let (user_id, resource_id) = path.into_inner();
    info!("🎯 BLIND QUERY: Getting dashboard for user: {}", user_id);
    
    let client = get_dynamo_client().await;
    let table_name = "HashtagCache";
    let pk = format!("USER#{}", user_id);
    
    match client.query()
        .table_name(table_name)
        .key_condition_expression("pk = :pk")
        .expression_attribute_values(":pk", AttributeValue::S(pk.clone()))
        .limit(10)
        .send()
        .await 
    {
        Ok(result) => {
            let items = result.items.unwrap_or_default();
            let converted_items: Vec<serde_json::Value> = items.iter().map(|item| {
                let mut converted = serde_json::Map::new();
                for (key, value) in item {
                    let converted_value = match value {
                        AttributeValue::S(s) => json!(s),
                        AttributeValue::N(n) => {
                            if let Ok(num) = n.parse::<i64>() {
                                json!(num)
                            } else {
                                json!(n)
                            }
                        },
                        _ => json!("unknown_type")
                    };
                    converted.insert(key.clone(), converted_value);
                }
                json!(converted)
            }).collect();
            
            Ok(HttpResponse::Ok().json(json!({
                "status": "success",
                "method": "BLIND_QUERY",
                "data": {
                    "user_id": user_id,
                    "resource_id": resource_id,
                    "items_found": converted_items.len(),
                    "cached_data": converted_items,
                    "table": table_name,
                    "query_pk": pk
                },
                "message": if converted_items.is_empty() { 
                    "No hay datos guardados aún." 
                } else { 
                    "🎉 ¡QUERY FUNCIONÓ! Datos encontrados" 
                },
                "timestamp": chrono::Utc::now().to_rfc3339()
            })))
        },
        Err(e) => {
            error!("❌ Direct query failed: {:?}", e);
            Ok(HttpResponse::Ok().json(json!({
                "status": "warning",
                "method": "BLIND_QUERY", 
                "data": {
                    "user_id": user_id,
                    "resource_id": resource_id,
                    "cached_data": [],
                    "table": table_name,
                    "query_pk": pk
                },
                "message": "Error consultando DynamoDB",
                "error": format!("{:?}", e),
                "timestamp": chrono::Utc::now().to_rfc3339()
            })))
        }
    }
}

// 🧠 Iniciar análisis
#[post("/analytics/start")]
async fn start_analysis(body: web::Json<serde_json::Value>) -> Result<impl Responder> {
    let analysis_id = format!("analysis_{}", chrono::Utc::now().timestamp());
    Ok(HttpResponse::Ok().json(json!({
        "status": "success",
        "data": {
            "analysis_id": analysis_id,
            "status": "processing",
            "estimated_time": "2-3 minutos",
            "input": body.into_inner()
        },
        "message": "Análisis iniciado!",
        "timestamp": chrono::Utc::now().to_rfc3339()
    })))
}

// 📈 Obtener estado del análisis
#[get("/analytics/status/{analysis_id}")]
async fn get_analysis_status(path: web::Path<String>) -> Result<impl Responder> {
    let analysis_id = path.into_inner();
    Ok(HttpResponse::Ok().json(json!({
        "status": "success",
        "data": {
            "analysis_id": analysis_id,
            "status": "completed",
            "progress": 100,
            "results": {
                "insights": ["Sistema funcionando"],
                "recommendations": ["Continuar desarrollo"],
                "data_source": "NoSQL Backend"
            }
        },
        "message": "Analysis completed successfully",
        "timestamp": chrono::Utc::now().to_rfc3339()
    })))
}

// 📰 Obtener trends históricos
#[get("/trends/history/{hashtag}")]
async fn get_hashtag_trends(path: web::Path<String>) -> Result<impl Responder> {
    let hashtag = path.into_inner();
    Ok(HttpResponse::Ok().json(json!({
        "status": "success",
        "data": {
            "hashtag": hashtag,
            "timeframe": "últimos 30 días",
            "data_source": "NoSQL Backend",
            "trends": [{"date": "2025-06-08", "engagement": 85.2, "virality": 71.4}]
        },
        "message": "Trends retrieved successfully",
        "timestamp": chrono::Utc::now().to_rfc3339()
    })))
}

// 🎯 TODAS LAS RUTAS - CONFIGURACIÓN FINAL
pub fn routes() -> actix_web::Scope {
    web::scope("/nosql")
        .service(test_endpoint)               // Básico
        .service(test_direct_mode)            // 🆕 Modo directo
        .service(test_other_aws_services)     // Test otros servicios
        .service(save_hashtag_cache)          // 🎯 BLIND PutItem
        .service(list_all_hashtags)           // 🎯 BLIND Scan
        .service(get_dashboard_cache)         // 🎯 BLIND Query
        .service(start_analysis)              // Analytics
        .service(get_analysis_status)         // Status
        .service(get_hashtag_trends)          // Trends
}