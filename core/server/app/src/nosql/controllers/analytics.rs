use actix_web::{web, HttpResponse, Responder, post, Result};
use serde::{Deserialize, Serialize};
use tracing::{info, warn};

// 🔢 TUS FÓRMULAS ORIGINALES (sin cambios)
pub fn x_viral_rate(reposts: u32, likes: u32, comments: u32, followers: u32) -> f64 {
    if followers == 0 {
        return 0.0;
    }
    ((reposts + likes + comments) as f64 / followers as f64) * 100.0
}

pub fn x_interaction_rate(reposts: u32, likes: u32, comments: u32, views: u32) -> f64 {
    if views == 0 {
        return 0.0;
    }
    ((reposts + likes + comments) as f64 / views as f64) * 100.0
}

pub fn reddit_hourly_ratio(upvotes: u32, comments: u32, hours_since_posted: f64) -> f64 {
    if hours_since_posted == 0.0 {
        return 0.0;
    }
    (upvotes + comments) as f64 / hours_since_posted
}

pub fn reddit_viral_rate(upvotes: u32, comments: u32, subreddit_subs: u32) -> f64 {
    if subreddit_subs == 0 {
        return 0.0;
    }
    ((upvotes + comments) as f64 / subreddit_subs as f64) * 100.0
}

pub fn insta_ratio(likes: u32, comments: u32, views: u32) -> f64 {
    if views == 0 {
        return 0.0;
    }
    ((likes + comments) as f64 / views as f64) * 100.0
}

pub fn insta_viral_rate(comments: u32, shares: u32, followers: u32) -> f64 {
    if followers == 0 {
        return 0.0;
    }
    ((comments + shares) as f64 / followers as f64) * 100.0
}

// 🆕 STRUCTS PARA RECIBIR DATOS DE FLOW.RS

#[derive(Deserialize, Debug)]
pub struct InstagramPost {
    pub date: String,
    pub likes: u32,
    pub comments: u32,
    pub views: u32,
    pub followers: u32,
    pub shares: u32,
}

#[derive(Deserialize, Debug)]
pub struct RedditPost {
    pub date: String,
    pub upvotes: u32,
    pub comments: u32,
    pub subscribers: u32,
    pub hours: f64,
}

#[derive(Deserialize, Debug)]
pub struct TwitterPost {
    pub date: String,
    pub likes: u32,
    pub retweets: u32,
    pub comments: u32,
    pub views: u32,
    pub followers: u32,
}

#[derive(Deserialize, Debug)]
pub struct HashtagData {
    pub keyword: String,
    pub posts: Vec<serde_json::Value>, // Genérico para recibir cualquier estructura
}

#[derive(Deserialize, Debug)]
pub struct TrendsData {
    pub instagram: Vec<HashtagData>,
    pub reddit: Vec<HashtagData>,
    pub twitter: Vec<HashtagData>,
}

#[derive(Deserialize, Debug)]
pub struct AnalyticsRequest {
    pub hashtags: Vec<String>,
    pub trends: TrendsData,
    pub sales: Vec<serde_json::Value>, // Para futuro uso
}

// 🆕 STRUCTS PARA DEVOLVER RESULTADOS (NÚMEROS PUROS)

#[derive(Serialize, Debug)]
pub struct HashtagMetrics {
    pub name: String,
    pub instagram_interaction: f64,
    pub instagram_virality: f64,
    pub reddit_interaction: f64,
    pub reddit_virality: f64,
    pub twitter_interaction: f64,
    pub twitter_virality: f64,
}

#[derive(Serialize, Debug)]
pub struct AnalyticsResponse {
    pub hashtags: Vec<HashtagMetrics>,
    pub total_hashtags: usize,
    pub processing_time_ms: u128,
    pub data_source: String,
}

// 🧮 FUNCIONES DE PROCESAMIENTO

pub fn process_instagram_hashtag(posts: &[InstagramPost]) -> (f64, f64) {
    if posts.is_empty() {
        return (0.0, 0.0);
    }

    let mut total_interaction = 0.0;
    let mut total_virality = 0.0;
    let mut count = 0;

    for post in posts {
        let interaction = insta_ratio(post.likes, post.comments, post.views);
        let virality = insta_viral_rate(post.comments, post.shares, post.followers);
        
        total_interaction += interaction;
        total_virality += virality;
        count += 1;
    }

    if count > 0 {
        (total_interaction / count as f64, total_virality / count as f64)
    } else {
        (0.0, 0.0)
    }
}

pub fn process_reddit_hashtag(posts: &[RedditPost]) -> (f64, f64) {
    if posts.is_empty() {
        return (0.0, 0.0);
    }

    let mut total_interaction = 0.0;
    let mut total_virality = 0.0;
    let mut count = 0;

    for post in posts {
        let interaction = reddit_hourly_ratio(post.upvotes, post.comments, post.hours);
        let virality = reddit_viral_rate(post.upvotes, post.comments, post.subscribers);
        
        total_interaction += interaction;
        total_virality += virality;
        count += 1;
    }

    if count > 0 {
        (total_interaction / count as f64, total_virality / count as f64)
    } else {
        (0.0, 0.0)
    }
}

pub fn process_twitter_hashtag(posts: &[TwitterPost]) -> (f64, f64) {
    if posts.is_empty() {
        return (0.0, 0.0);
    }

    let mut total_interaction = 0.0;
    let mut total_virality = 0.0;
    let mut count = 0;

    for post in posts {
        let interaction = x_interaction_rate(post.retweets, post.likes, post.comments, post.views);
        let virality = x_viral_rate(post.retweets, post.likes, post.comments, post.followers);
        
        total_interaction += interaction;
        total_virality += virality;
        count += 1;
    }

    if count > 0 {
        (total_interaction / count as f64, total_virality / count as f64)
    } else {
        (0.0, 0.0)
    }
}

// 🔄 CONVERTIR JSON GENÉRICO A STRUCTS ESPECÍFICOS

fn parse_instagram_posts(posts: &[serde_json::Value]) -> Vec<InstagramPost> {
    posts.iter().filter_map(|post| {
        serde_json::from_value::<InstagramPost>(post.clone()).ok()
    }).collect()
}

fn parse_reddit_posts(posts: &[serde_json::Value]) -> Vec<RedditPost> {
    posts.iter().filter_map(|post| {
        serde_json::from_value::<RedditPost>(post.clone()).ok()
    }).collect()
}

fn parse_twitter_posts(posts: &[serde_json::Value]) -> Vec<TwitterPost> {
    posts.iter().filter_map(|post| {
        serde_json::from_value::<TwitterPost>(post.clone()).ok()
    }).collect()
}

// 🚀 FUNCIÓN PRINCIPAL DE PROCESAMIENTO

pub fn process_all_hashtags(request: &AnalyticsRequest) -> Vec<HashtagMetrics> {
    let mut results = Vec::new();

    for hashtag_name in &request.hashtags {
        info!("🧮 Procesando hashtag: {}", hashtag_name);

        // Buscar datos en cada plataforma
        let instagram_data = request.trends.instagram.iter()
            .find(|h| h.keyword == *hashtag_name)
            .map(|h| parse_instagram_posts(&h.posts))
            .unwrap_or_default();

        let reddit_data = request.trends.reddit.iter()
            .find(|h| h.keyword == *hashtag_name)
            .map(|h| parse_reddit_posts(&h.posts))
            .unwrap_or_default();

        let twitter_data = request.trends.twitter.iter()
            .find(|h| h.keyword == *hashtag_name)
            .map(|h| parse_twitter_posts(&h.posts))
            .unwrap_or_default();

        // Procesar con tus fórmulas
        let (instagram_interaction, instagram_virality) = process_instagram_hashtag(&instagram_data);
        let (reddit_interaction, reddit_virality) = process_reddit_hashtag(&reddit_data);
        let (twitter_interaction, twitter_virality) = process_twitter_hashtag(&twitter_data);

        // Crear resultado limpio
        let metrics = HashtagMetrics {
            name: hashtag_name.clone(),
            instagram_interaction: (instagram_interaction * 100.0).round() / 100.0, // 2 decimales
            instagram_virality: (instagram_virality * 100.0).round() / 100.0,
            reddit_interaction: (reddit_interaction * 100.0).round() / 100.0,
            reddit_virality: (reddit_virality * 100.0).round() / 100.0,
            twitter_interaction: (twitter_interaction * 100.0).round() / 100.0,
            twitter_virality: (twitter_virality * 100.0).round() / 100.0,
        };

        info!("✅ Hashtag {} procesado: Insta({:.2}, {:.2}) Reddit({:.2}, {:.2}) Twitter({:.2}, {:.2})", 
               hashtag_name, metrics.instagram_interaction, metrics.instagram_virality,
               metrics.reddit_interaction, metrics.reddit_virality,
               metrics.twitter_interaction, metrics.twitter_virality);

        results.push(metrics);
    }

    results
}

// 🌐 ENDPOINT PARA RECIBIR DATOS DE FLOW.RS

#[post("/process")]
async fn process_analytics(req: web::Json<AnalyticsRequest>) -> Result<impl Responder> {
    let start_time = std::time::Instant::now();
    
    info!("🧮 Iniciando procesamiento de analytics...");
    info!("📊 Hashtags a procesar: {:?}", req.hashtags);

    // Procesar con tus fórmulas
    let hashtag_metrics = process_all_hashtags(&req);
    
    let processing_time = start_time.elapsed().as_millis();
    
    let response = AnalyticsResponse {
        hashtags: hashtag_metrics,
        total_hashtags: req.hashtags.len(),
        processing_time_ms: processing_time,
        data_source: "backend_calculations".to_string(),
    };

    info!("✅ Analytics procesado en {}ms", processing_time);

    Ok(HttpResponse::Ok().json(response))
}

// 🧪 ENDPOINT DE PRUEBA (para debug)

#[post("/test")]
async fn test_analytics() -> Result<impl Responder> {
    info!("🧪 Test de analytics con datos hardcodeados");

    let test_data = AnalyticsRequest {
        hashtags: vec!["RockMusic".to_string(), "ElectricGuitar".to_string()],
        trends: TrendsData {
            instagram: vec![
                HashtagData {
                    keyword: "RockMusic".to_string(),
                    posts: vec![
                        serde_json::json!({
                            "date": "01/01/25 - 31/01/25",
                            "likes": 2100,
                            "comments": 145,
                            "views": 28000,
                            "followers": 78000,
                            "shares": 120
                        })
                    ]
                }
            ],
            reddit: vec![],
            twitter: vec![]
        },
        sales: vec![]
    };

    let metrics = process_all_hashtags(&test_data);

    Ok(HttpResponse::Ok().json(serde_json::json!({
        "status": "✅ TEST SUCCESS",
        "message": "Analytics funcionando con tus fórmulas",
        "test_results": metrics,
        "formulas_used": [
            "insta_ratio()", "insta_viral_rate()",
            "reddit_hourly_ratio()", "reddit_viral_rate()",
            "x_interaction_rate()", "x_viral_rate()"
        ]
    })))
}

// 🚀 RUTAS

pub fn routes() -> actix_web::Scope {
    web::scope("/analytics")
        .service(process_analytics)  // POST /analytics/process
        .service(test_analytics)     // POST /analytics/test
}