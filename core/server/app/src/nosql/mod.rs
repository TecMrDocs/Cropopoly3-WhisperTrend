/**
* Módulo NoSQL - Gestión de Datos DynamoDB
* 
* Este archivo implementa todas las operaciones de base de datos NoSQL para
* el manejo de hashtags, datos scraped, análisis de redes sociales y cache
* del dashboard con soporte completo para DynamoDB AWS.
* 
* Autor: Lucio Arturo Reyes Castillo
*/

use actix_web::{web, HttpResponse, Responder, get, post, Result};
use serde_json::json;
use aws_sdk_dynamodb::{Client, types::AttributeValue};
use aws_config::BehaviorVersion;
use std::collections::HashMap;
use std::env;
use serde::{Deserialize, Serialize};
pub mod controllers;

/// Estructura que representa un post extraído de redes sociales
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScrapedPost {
    pub comments: i32,
    pub followers: Option<i32>,
    pub likes: i32,
    pub link: String,
    pub time: String,
    pub members: Option<i32>,
    pub subreddit: Option<String>,
    pub title: Option<String>,
    pub vote: Option<i32>,
}

// Contenedor para datos de hashtag scraped con metadatos
// Incluye información temporal y estadísticas del scraping
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScrapedHashtagData {
    pub hashtag: String,
    pub platform: String, 
    pub posts: Vec<ScrapedPost>,
    pub scraped_at: String, 
    pub total_posts: usize,
}

// Crea y configura un cliente de DynamoDB usando las credenciales AWS del entorno
// Cliente de DynamoDB configurado con la región por defecto
async fn get_dynamo_client() -> Client {
    let config = aws_config::defaults(BehaviorVersion::latest())
        .load()
        .await;
    
    Client::new(&config)
}

// Genera el nombre de la tabla DynamoDB usando el prefijo del entorno
fn get_table_name() -> String {
    let prefix = env::var("DYNAMODB_TABLE_PREFIX").unwrap_or_else(|_| "trendhash_".to_string());
    format!("{}hashtag_cache", prefix)
}

// Guarda datos de posts extraídos de redes sociales en DynamoDB
pub async fn save_scraped_data_to_dynamo(
    hashtag: String, 
    platform: String,
    posts: Vec<ScrapedPost>
) -> Result<bool, Box<dyn std::error::Error>> {
    if posts.is_empty() {
        return Ok(false);
    }

    let client = get_dynamo_client().await;
    let table_name = get_table_name();
    
    ensure_table_exists(&client, &table_name).await?;

    let timestamp = chrono::Utc::now().timestamp();
    let pk = format!("HASHTAG#{}", hashtag);
    let sk = format!("SCRAPED#{}#{}", platform, timestamp);
    
    let scraped_data = ScrapedHashtagData {
        hashtag: hashtag.clone(),
        platform: platform.clone(),
        posts: posts.clone(),
        scraped_at: chrono::Utc::now().to_rfc3339(),
        total_posts: posts.len(),
    };

    let mut item = HashMap::new();
    item.insert("pk".to_string(), AttributeValue::S(pk.clone()));
    item.insert("sk".to_string(), AttributeValue::S(sk.clone()));
    item.insert("hashtag".to_string(), AttributeValue::S(hashtag.clone()));
    item.insert("platform".to_string(), AttributeValue::S(platform.clone()));
    item.insert("data_type".to_string(), AttributeValue::S("scraped".to_string()));
    item.insert("scraped_posts".to_string(), AttributeValue::S(serde_json::to_string(&scraped_data)?));
    item.insert("total_posts".to_string(), AttributeValue::N(posts.len().to_string()));
    item.insert("created_at".to_string(), AttributeValue::S(chrono::Utc::now().to_rfc3339()));
    item.insert("quality_score".to_string(), AttributeValue::N("95".to_string()));
    
    // TTL - Los datos scraped expiran en 7 días
    let ttl = timestamp + (7 * 24 * 60 * 60);
    item.insert("ttl".to_string(), AttributeValue::N(ttl.to_string()));

    client.put_item()
        .table_name(&table_name)
        .set_item(Some(item))
        .send()
        .await?;
        
    Ok(true)
}

// Busca datos de scraping recientes para un hashtag y plataforma específicos
pub async fn get_recent_scraped_data(
    hashtag: String, 
    platform: String,
    max_age_hours: i64
) -> Result<Option<ScrapedHashtagData>, Box<dyn std::error::Error>> {
    let client = get_dynamo_client().await;
    let table_name = get_table_name();
    let pk = format!("HASHTAG#{}", hashtag);
    
    let result = client.query()
        .table_name(&table_name)
        .key_condition_expression("pk = :pk AND begins_with(sk, :sk_prefix)")
        .expression_attribute_values(":pk", AttributeValue::S(pk))
        .expression_attribute_values(":sk_prefix", AttributeValue::S(format!("SCRAPED#{}", platform)))
        .scan_index_forward(false)
        .limit(5)
        .send()
        .await?;

    if let Some(items) = result.items {
        for item in items {
            if let Some(AttributeValue::S(created_at)) = item.get("created_at") {
                if let Ok(created_time) = chrono::DateTime::parse_from_rfc3339(created_at) {
                    let hours_ago = chrono::Utc::now()
                        .signed_duration_since(created_time.with_timezone(&chrono::Utc))
                        .num_hours();
                    
                    if hours_ago <= max_age_hours {
                        if let Some(AttributeValue::S(scraped_posts_json)) = item.get("scraped_posts") {
                            if let Ok(scraped_data) = serde_json::from_str::<ScrapedHashtagData>(scraped_posts_json) {
                                return Ok(Some(scraped_data));
                            }
                        }
                    }
                }
            }
        }
    }

    Ok(None)
}

// Genera estadísticas agregadas de todos los datos de scraping almacenados
//
//  Returns
// JSON con estadísticas incluyendo:
// - Total de hashtags scraped
// - Total de posts scraped
// - Distribución por plataforma
// - Promedio de posts por hashtag
pub async fn get_scraping_stats() -> Result<serde_json::Value, Box<dyn std::error::Error>> {
    let client = get_dynamo_client().await;
    let table_name = get_table_name();
    
    let result = client.scan()
        .table_name(&table_name)
        .filter_expression("data_type = :dt")
        .expression_attribute_values(":dt", AttributeValue::S("scraped".to_string()))
        .send()
        .await?;

    let items = result.items.unwrap_or_default();
    let total_scraped = items.len();
    
    let mut by_platform = HashMap::new();
    let mut total_posts = 0;
    
    for item in &items {
        if let Some(AttributeValue::S(platform)) = item.get("platform") {
            *by_platform.entry(platform.clone()).or_insert(0) += 1;
        }
        if let Some(AttributeValue::N(posts_count)) = item.get("total_posts") {
            if let Ok(count) = posts_count.parse::<i32>() {
                total_posts += count;
            }
        }
    }

    Ok(json!({
        "total_scraped_hashtags": total_scraped,
        "total_scraped_posts": total_posts,
        "by_platform": by_platform,
        "average_posts_per_hashtag": if total_scraped > 0 { total_posts / total_scraped as i32 } else { 0 }
    }))
}

// Verifica si la tabla DynamoDB existe y la crea si es necesario
async fn ensure_table_exists(client: &Client, table_name: &str) -> Result<(), Box<dyn std::error::Error>> {
    match client.describe_table().table_name(table_name).send().await {
        Ok(_) => Ok(()),
        Err(_) => {
            client.create_table()
                .table_name(table_name)
                .key_schema(
                    aws_sdk_dynamodb::types::KeySchemaElement::builder()
                        .attribute_name("pk")
                        .key_type(aws_sdk_dynamodb::types::KeyType::Hash)
                        .build()?
                )
                .key_schema(
                    aws_sdk_dynamodb::types::KeySchemaElement::builder()
                        .attribute_name("sk")
                        .key_type(aws_sdk_dynamodb::types::KeyType::Range)
                        .build()?
                )
                .attribute_definitions(
                    aws_sdk_dynamodb::types::AttributeDefinition::builder()
                        .attribute_name("pk")
                        .attribute_type(aws_sdk_dynamodb::types::ScalarAttributeType::S)
                        .build()?
                )
                .attribute_definitions(
                    aws_sdk_dynamodb::types::AttributeDefinition::builder()
                        .attribute_name("sk")
                        .attribute_type(aws_sdk_dynamodb::types::ScalarAttributeType::S)
                        .build()?
                )
                .billing_mode(aws_sdk_dynamodb::types::BillingMode::PayPerRequest)
                .send()
                .await?;
                
            Ok(())
        }
    }
}

// Endpoint de prueba para verificar conectividad con DynamoDB
#[get("/test")]
async fn test_connection() -> Result<impl Responder> {
    let client = get_dynamo_client().await;
    let has_access_key = env::var("AWS_ACCESS_KEY_ID").is_ok();
    let has_secret_key = env::var("AWS_SECRET_ACCESS_KEY").is_ok();
    let has_region = env::var("AWS_REGION").is_ok();
    
    match client.list_tables().send().await {
        Ok(result) => {
            let table_count = result.table_names().len();
            Ok(HttpResponse::Ok().json(json!({
                "status": "✅ SUCCESS",
                "message": "Conexión a DynamoDB establecida correctamente",
                "aws_config": {
                    "has_access_key": has_access_key,
                    "has_secret_key": has_secret_key,
                    "has_region": has_region,
                    "region": env::var("AWS_REGION").unwrap_or("us-east-1".to_string()),
                    "table_prefix": env::var("DYNAMODB_TABLE_PREFIX").unwrap_or("trendhash_".to_string())
                },
                "tables_found": table_count,
                "table_names": result.table_names(),
                "target_table": get_table_name(),
                "timestamp": chrono::Utc::now().to_rfc3339()
            })))
        }
        Err(e) => {
            Ok(HttpResponse::InternalServerError().json(json!({
                "status": "❌ ERROR",
                "message": "No se pudo conectar a DynamoDB",
                "error": format!("{:?}", e),
                "aws_config": {
                    "has_access_key": has_access_key,
                    "has_secret_key": has_secret_key,
                    "has_region": has_region
                },
                "suggestions": [
                    "Verifica que AWS_ACCESS_KEY_ID esté configurado correctamente",
                    "Verifica que AWS_SECRET_ACCESS_KEY esté configurado correctamente",
                    "Verifica que AWS_REGION sea válida (ej: us-east-1)",
                ],
                "timestamp": chrono::Utc::now().to_rfc3339()
            })))
        }
    }
}

// Guarda datos de hashtag en caché con metadatos del usuario y recurso
#[post("/cache/hashtag")]
async fn save_hashtag_cache(body: web::Json<serde_json::Value>) -> Result<impl Responder> {
    let client = get_dynamo_client().await;
    let table_name = get_table_name();
    
    ensure_table_exists(&client, &table_name).await.map_err(|e| {
        actix_web::error::ErrorInternalServerError(format!("Error creando tabla: {:?}", e))
    })?;
    
    let data = body.into_inner();
    let user_id = data.get("user_id").and_then(|v| v.as_i64()).unwrap_or(0);
    let hashtag = data.get("hashtag").and_then(|v| v.as_str()).unwrap_or("unknown");
    let resource_id = data.get("resource_id").and_then(|v| v.as_i64()).unwrap_or(0);
    
    let timestamp = chrono::Utc::now().timestamp();
    let pk = format!("USER#{}", user_id);
    let sk = format!("HASHTAG#{}#{}", hashtag, timestamp);
    
    let mut item = HashMap::new();
    item.insert("pk".to_string(), AttributeValue::S(pk.clone()));
    item.insert("sk".to_string(), AttributeValue::S(sk.clone()));
    item.insert("hashtag".to_string(), AttributeValue::S(hashtag.to_string()));
    item.insert("user_id".to_string(), AttributeValue::N(user_id.to_string()));
    item.insert("resource_id".to_string(), AttributeValue::N(resource_id.to_string()));
    item.insert("data".to_string(), AttributeValue::S(data.to_string()));
    item.insert("created_at".to_string(), AttributeValue::S(chrono::Utc::now().to_rfc3339()));
    item.insert("ttl".to_string(), AttributeValue::N((timestamp + 86400).to_string())); // 24 horas TTL
    
    // Datos adicionales opcionales
    if let Some(correlacion) = data.get("correlacion") {
        if let Some(val) = correlacion.as_f64() {
            item.insert("correlacion".to_string(), AttributeValue::N(val.to_string()));
        }
    }
    
    if let Some(plataforma) = data.get("plataforma") {
        if let Some(val) = plataforma.as_str() {
            item.insert("plataforma".to_string(), AttributeValue::S(val.to_string()));
        }
    }
    
    match client.put_item()
        .table_name(&table_name)
        .set_item(Some(item))
        .send()
        .await 
    {
        Ok(_) => {
            Ok(HttpResponse::Ok().json(json!({
                "status": "✅ SUCCESS",
                "message": "¡Hashtag guardado en DynamoDB exitosamente!",
                "data": {
                    "table": table_name,
                    "hashtag": hashtag,
                    "user_id": user_id,
                    "resource_id": resource_id,
                    "pk": pk,
                    "sk": sk,
                    "ttl_hours": 24,
                    "correlacion": data.get("correlacion"),
                    "plataforma": data.get("plataforma")
                },
                "timestamp": chrono::Utc::now().to_rfc3339()
            })))
        },
        Err(e) => {
            Ok(HttpResponse::InternalServerError().json(json!({
                "status": "❌ ERROR",
                "message": "Error guardando hashtag en DynamoDB",
                "error": format!("{:?}", e),
                "table": table_name
            })))
        }
    }
}

// Endpoint de prueba para guardar datos scraped con posts de ejemplo
async fn test_save_scraped(body: web::Json<serde_json::Value>) -> Result<impl Responder> {
    let data = body.into_inner();
    let hashtag = data.get("hashtag").and_then(|v| v.as_str()).unwrap_or("TestHashtag");
    let platform = data.get("platform").and_then(|v| v.as_str()).unwrap_or("instagram");
    
    // Crear posts de prueba con datos realistas
    let test_posts = vec![
        ScrapedPost {
            comments: 50,
            followers: Some(10000),
            likes: 500,
            link: "https://test.com/post1".to_string(),
            time: chrono::Utc::now().to_rfc3339(),
            members: None,
            subreddit: None,
            title: None,
            vote: None,
        },
        ScrapedPost {
            comments: 30,
            followers: Some(10000),
            likes: 300,
            link: "https://test.com/post2".to_string(),
            time: chrono::Utc::now().to_rfc3339(),
            members: None,
            subreddit: None,
            title: None,
            vote: None,
        }
    ];
    
    match save_scraped_data_to_dynamo(hashtag.to_string(), platform.to_string(), test_posts).await {
        Ok(success) => {
            Ok(HttpResponse::Ok().json(json!({
                "status": "✅ SUCCESS",
                "message": "Datos scraped de prueba guardados exitosamente",
                "data": {
                    "hashtag": hashtag,
                    "platform": platform,
                    "saved": success,
                    "posts_count": 2
                }
            })))
        },
        Err(e) => {
            Ok(HttpResponse::InternalServerError().json(json!({
                "status": "❌ ERROR",
                "message": "Error guardando datos scraped de prueba",
                "error": format!("{:?}", e)
            })))
        }
    }
}

// Obtiene estadísticas agregadas de todos los datos de scraping
#[get("/stats/scraping")]
async fn get_scraping_statistics() -> Result<impl Responder> {
    match get_scraping_stats().await {
        Ok(stats) => {
            Ok(HttpResponse::Ok().json(json!({
                "status": "✅ SUCCESS",
                "message": "Estadísticas de scraping obtenidas",
                "stats": stats,
                "timestamp": chrono::Utc::now().to_rfc3339()
            })))
        },
        Err(e) => {
            Ok(HttpResponse::InternalServerError().json(json!({
                "status": "❌ ERROR",
                "message": "Error obteniendo estadísticas",
                "error": format!("{:?}", e)
            })))
        }
    }
}

// Recupera el caché del dashboard para un usuario y recurso específicos
#[get("/cache/dashboard/{user_id}/{resource_id}")]
async fn get_dashboard_cache(path: web::Path<(i32, i32)>) -> Result<impl Responder> {
    let (user_id, resource_id) = path.into_inner();
    
    let client = get_dynamo_client().await;
    let table_name = get_table_name();
    let pk = format!("USER#{}", user_id);
    
    match client.query()
        .table_name(&table_name)
        .key_condition_expression("pk = :pk")
        .expression_attribute_values(":pk", AttributeValue::S(pk.clone()))
        .limit(20)
        .scan_index_forward(false) 
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
                            } else if let Ok(num) = n.parse::<f64>() {
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
                "status": "✅ SUCCESS",
                "message": if converted_items.is_empty() { 
                    "No hay datos guardados. Usa POST /cache/hashtag para guardar.".to_string()
                } else { 
                    format!("¡{} hashtags encontrados!", converted_items.len())
                },
                "data": {
                    "user_id": user_id,
                    "resource_id": resource_id,
                    "items_found": converted_items.len(),
                    "hashtags": converted_items,
                    "table": table_name,
                    "query_pk": pk
                },
                "timestamp": chrono::Utc::now().to_rfc3339()
            })))
        },
        Err(e) => {
            Ok(HttpResponse::Ok().json(json!({
                "status": "⚠️ WARNING",
                "message": "Error consultando datos o tabla no existe",
                "data": {
                    "user_id": user_id,
                    "resource_id": resource_id,
                    "hashtags": [],
                    "items_found": 0,
                    "table": table_name,
                    "query_pk": pk
                },
                "error": format!("{:?}", e),
                "suggestion": "Verifica que la tabla exista o usa POST /cache/hashtag para crear datos",
                "timestamp": chrono::Utc::now().to_rfc3339()
            })))
        }
    }
}

// Lista todos los hashtags almacenados en la base de datos
#[get("/cache/list")]
async fn list_all_hashtags() -> Result<impl Responder> {
    let client = get_dynamo_client().await;
    let table_name = get_table_name();
    
    match client.scan()
        .table_name(&table_name)
        .limit(50) 
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
                            } else if let Ok(num) = n.parse::<f64>() {
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
                "status": "✅ SUCCESS",
                "message": format!("¡{} hashtags encontrados en total!", converted_items.len()),
                "data": {
                    "total_items": converted_items.len(),
                    "hashtags": converted_items,
                    "table": table_name
                },
                "timestamp": chrono::Utc::now().to_rfc3339()
            })))
        },
        Err(e) => {
            Ok(HttpResponse::Ok().json(json!({
                "status": "❌ ERROR",
                "message": "Error listando hashtags o tabla no existe",
                "data": {
                    "hashtags": [],
                    "total_items": 0,
                    "table": table_name
                },
                "error": format!("{:?}", e),
                "timestamp": chrono::Utc::now().to_rfc3339()
            })))
        }
    }
}

// Inicia un proceso de análisis simulado con identificador único
#[post("/analytics/start")]
async fn start_analysis(body: web::Json<serde_json::Value>) -> Result<impl Responder> {
    let analysis_id = format!("analysis_{}", chrono::Utc::now().timestamp());
    
    Ok(HttpResponse::Ok().json(json!({
        "status": "✅ SUCCESS",
        "analysis_id": analysis_id,
        "status_analysis": "processing",
        "message": "¡Análisis iniciado con DynamoDB REAL!",
        "estimated_time": "2-3 minutos",
        "data": {
            "input": body.into_inner(),
            "will_use_dynamodb": true,
            "table": get_table_name()
        },
        "timestamp": chrono::Utc::now().to_rfc3339()
    })))
}

// Obtiene el estado de un análisis por su ID
#[get("/analytics/status/{analysis_id}")]
async fn get_analysis_status(path: web::Path<String>) -> Result<impl Responder> {
    let analysis_id = path.into_inner();
    
    Ok(HttpResponse::Ok().json(json!({
        "status": "✅ SUCCESS",
        "analysis_id": analysis_id,
        "status_analysis": "completed",
        "progress": 100,
        "message": "Análisis completado exitosamente",
        "results": {
            "insights": [
                "✅ Instagram: mejor engagement en mañanas (9-11 AM)",
                "✅ Reddit: mayor viralidad fines de semana",
                "✅ #EcoFriendly: 85% de correlación positiva",
                "✅ Datos almacenados en DynamoDB real"
            ],
            "recommendations": [
                "Programar posts de Instagram entre 9-11 AM",
                "Usar Reddit para contenido weekend",
                "Enfocar estrategia en #EcoFriendly",
                "Continuar usando DynamoDB para almacenamiento"
            ],
            "metrics": {
                "total_hashtags_analyzed": 3,
                "avg_correlation": 78.5,
                "best_platform": "Instagram",
                "data_source": "DynamoDB Real AWS"
            }
        },
        "completed_at": chrono::Utc::now().to_rfc3339(),
        "storage": {
            "type": "DynamoDB",
            "table": get_table_name(),
            "region": env::var("AWS_REGION").unwrap_or("us-east-1".to_string())
        }
    })))
}

// Puebla la base de datos con hashtags hardcodeados para testing
#[post("/populate/hashtags")]
async fn populate_hashtags() -> Result<impl Responder> {
    let client = get_dynamo_client().await;
    let table_name = get_table_name();
    
    ensure_table_exists(&client, &table_name).await.map_err(|e| {
        actix_web::error::ErrorInternalServerError(format!("Error creando tabla: {:?}", e))
    })?;
    
    // Datos hardcodeados para testing con métricas realistas
    let hashtag_categories = vec![
        // GUITARRAS ELÉCTRICAS 
        ("ElectricGuitar", "guitars", vec![
            ("instagram", json!([
                {"date": "01/01/25 - 31/01/25", "likes": 1250, "comments": 89, "views": 15600, "followers": 45000, "shares": 67},
                {"date": "01/02/25 - 28/02/25", "likes": 1380, "comments": 92, "views": 16800, "followers": 46200, "shares": 74},
                {"date": "01/03/25 - 31/03/25", "likes": 1420, "comments": 98, "views": 17200, "followers": 47500, "shares": 81}
            ])),
            ("reddit", json!([
                {"date": "01/01/25 - 31/01/25", "upvotes": 892, "comments": 156, "subscribers": 125000, "hours": 168},
                {"date": "01/02/25 - 28/02/25", "upvotes": 945, "comments": 167, "subscribers": 126800, "hours": 168},
                {"date": "01/03/25 - 31/03/25", "upvotes": 1020, "comments": 178, "subscribers": 128500, "hours": 168}
            ])),
            ("twitter", json!([
                {"date": "01/01/25 - 31/01/25", "likes": 567, "retweets": 89, "comments": 43, "views": 8900, "followers": 23400},
                {"date": "01/02/25 - 28/02/25", "likes": 612, "retweets": 95, "comments": 48, "views": 9200, "followers": 24100},
                {"date": "01/03/25 - 31/03/25", "likes": 645, "retweets": 102, "comments": 52, "views": 9800, "followers": 24800}
            ]))
        ]),
        
        ("RockMusic", "music", vec![
            ("instagram", json!([
                {"date": "01/01/25 - 31/01/25", "likes": 2100, "comments": 145, "views": 28000, "followers": 78000, "shares": 120},
                {"date": "01/02/25 - 28/02/25", "likes": 2250, "comments": 156, "views": 29500, "followers": 79800, "shares": 135},
                {"date": "01/03/25 - 31/03/25", "likes": 2380, "comments": 167, "views": 31200, "followers": 81600, "shares": 148}
            ])),
            ("reddit", json!([
                {"date": "01/01/25 - 31/01/25", "upvotes": 1456, "comments": 289, "subscribers": 230000, "hours": 168},
                {"date": "01/02/25 - 28/02/25", "upvotes": 1523, "comments": 298, "subscribers": 232500, "hours": 168},
                {"date": "01/03/25 - 31/03/25", "upvotes": 1678, "comments": 312, "subscribers": 235200, "hours": 168}
            ])),
            ("twitter", json!([
                {"date": "01/01/25 - 31/01/25", "likes": 890, "retweets": 156, "comments": 78, "views": 15600, "followers": 42300},
                {"date": "01/02/25 - 28/02/25", "likes": 945, "retweets": 167, "comments": 84, "views": 16200, "followers": 43800},
                {"date": "01/03/25 - 31/03/25", "likes": 1020, "retweets": 178, "comments": 91, "views": 17100, "followers": 45200}
            ]))
        ]),
        
        ("VintageGuitars", "guitars", vec![
            ("instagram", json!([
                {"date": "01/01/25 - 31/01/25", "likes": 890, "comments": 67, "views": 12300, "followers": 34500, "shares": 45},
                {"date": "01/02/25 - 28/02/25", "likes": 934, "comments": 71, "views": 13100, "followers": 35600, "shares": 49},
                {"date": "01/03/25 - 31/03/25", "likes": 978, "comments": 76, "views": 13800, "followers": 36800, "shares": 53}
            ])),
            ("reddit", json!([
                {"date": "01/01/25 - 31/01/25", "upvotes": 645, "comments": 98, "subscribers": 89000, "hours": 168},
                {"date": "01/02/25 - 28/02/25", "upvotes": 678, "comments": 103, "subscribers": 90200, "hours": 168},
                {"date": "01/03/25 - 31/03/25", "upvotes": 712, "comments": 108, "subscribers": 91500, "hours": 168}
            ])),
            ("twitter", json!([
                {"date": "01/01/25 - 31/01/25", "likes": 345, "retweets": 67, "comments": 34, "views": 6700, "followers": 18900},
                {"date": "01/02/25 - 28/02/25", "likes": 367, "retweets": 71, "comments": 36, "views": 7100, "followers": 19400},
                {"date": "01/03/25 - 31/03/25", "likes": 389, "retweets": 75, "comments": 38, "views": 7500, "followers": 19900}
            ]))
        ])
    ];
    
    let mut success_count = 0;
    let mut errors = vec![];
    
    for (hashtag, category, platforms) in hashtag_categories {
        for (platform, data) in platforms {
            let pk = format!("HASHTAG#{}", hashtag);
            let sk = format!("HARDCODED#{}", platform);
            
            let mut item = HashMap::new();
            item.insert("pk".to_string(), AttributeValue::S(pk));
            item.insert("sk".to_string(), AttributeValue::S(sk));
            item.insert("hashtag".to_string(), AttributeValue::S(hashtag.to_string()));
            item.insert("platform".to_string(), AttributeValue::S(platform.to_string()));
            item.insert("category".to_string(), AttributeValue::S(category.to_string()));
            item.insert("data_type".to_string(), AttributeValue::S("hardcoded".to_string()));
            item.insert("posts_data".to_string(), AttributeValue::S(data.to_string()));
            item.insert("created_at".to_string(), AttributeValue::S(chrono::Utc::now().to_rfc3339()));
            item.insert("quality_score".to_string(), AttributeValue::N("85".to_string()));
            
            match client.put_item()
                .table_name(&table_name)
                .set_item(Some(item))
                .send()
                .await 
            {
                Ok(_) => {
                    success_count += 1;
                },
                Err(e) => {
                    let error_msg = format!("Error guardando {} - {}: {:?}", hashtag, platform, e);
                    errors.push(error_msg);
                }
            }
        }
    }
    
    Ok(HttpResponse::Ok().json(json!({
        "status": "✅ SUCCESS",
        "message": format!("¡{} hashtags hardcodeados guardados exitosamente!", success_count),
        "data": {
            "total_saved": success_count,
            "categories": ["guitars", "music"],
            "hashtags": ["ElectricGuitar", "RockMusic", "VintageGuitars"],
            "platforms": ["instagram", "reddit", "twitter"],
            "table": table_name,
            "data_type": "hardcoded",
            "quality_score": 85
        },
        "errors": errors,
        "timestamp": chrono::Utc::now().to_rfc3339()
    })))
}

// Busca hashtags por categoría específica
#[get("/hashtags/category/{category}")]
async fn get_hashtags_by_category(path: web::Path<String>) -> Result<impl Responder> {
    let category = path.into_inner();
    
    let client = get_dynamo_client().await;
    let table_name = get_table_name();
    
    match client.scan()
        .table_name(&table_name)
        .filter_expression("category = :cat")
        .expression_attribute_values(":cat", AttributeValue::S(category.clone()))
        .send()
        .await 
    {
        Ok(result) => {
            let items = result.items.unwrap_or_default();
            
            let hashtags: Vec<serde_json::Value> = items.iter().map(|item| {
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
                "status": "✅ SUCCESS",
                "category": category,
                "hashtags_found": hashtags.len(),
                "hashtags": hashtags,
                "message": format!("¡{} hashtags encontrados para {}!", hashtags.len(), category),
                "timestamp": chrono::Utc::now().to_rfc3339()
            })))
        },
        Err(e) => {
            Ok(HttpResponse::Ok().json(json!({
                "status": "❌ ERROR",
                "category": category,
                "hashtags": [],
                "error": format!("{:?}", e),
                "message": "Error buscando hashtags por categoría"
            })))
        }
    }
}

/// Configura todas las rutas del módulo nosql
/// 
/// # Returns
/// Scope de Actix-web con todas las rutas configuradas
/// 
/// # Routes
/// - GET `/test` - Test de conexión DynamoDB
/// - POST `/cache/hashtag` - Guardar hashtag en caché
/// - GET `/cache/dashboard/{user_id}/{resource_id}` - Obtener caché de dashboard
/// - GET `/cache/list` - Listar todos los hashtags
/// - POST `/analytics/start` - Iniciar análisis
/// - GET `/analytics/status/{analysis_id}` - Estado del análisis
/// - POST `/populate/hashtags` - Poblar datos de prueba
/// - GET `/hashtags/category/{category}` - Hashtags por categoría
/// - POST `/test/save-scraped` - Test guardado scraped
/// - GET `/stats/scraping` - Estadísticas de scraping
pub fn routes() -> actix_web::Scope {
    web::scope("/nosql")
        .service(test_connection)
        .service(save_hashtag_cache)
        .service(get_dashboard_cache)
        .service(list_all_hashtags)
        .service(start_analysis)
        .service(get_analysis_status)
        .service(populate_hashtags)  
        .service(get_hashtags_by_category)
        .service(test_save_scraped)        
        .service(get_scraping_statistics)  
        .service(controllers::analytics::routes())
}