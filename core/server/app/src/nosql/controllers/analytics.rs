use actix_web::{web, HttpResponse, Responder, post, Result};
use serde::{Deserialize, Serialize};
use tracing::{info, warn};


pub fn x_viral_rate(reposts: u32, likes: u32, comments: u32, followers: u32) -> f64 {
    if followers == 0 {
        return 0.0;
    }

    let engagement = (reposts + likes + comments) as f64;
    let followers_f = followers as f64;
    let log_engagement = (engagement + 1.0).ln();
    let log_followers = (followers_f + 1.0).ln();
    let viral_ratio = if log_followers > 0.0 {
        (log_engagement / log_followers) * 20.0 
    } else {
        0.0
    };
    viral_ratio.min(100.0).max(0.0)
}

pub fn x_interaction_rate(reposts: u32, likes: u32, comments: u32, views: u32) -> f64 {
    if views == 0 {
        return 0.0;
    }
    
    let engagement = (reposts + likes + comments) as f64;
    let views_f = views as f64;
    let interaction_rate = (engagement / views_f) * 100.0;
    interaction_rate.min(100.0).max(0.0)
}

pub fn reddit_hourly_ratio(upvotes: u32, comments: u32, hours_since_posted: f64) -> f64 {
    if hours_since_posted <= 0.0 {
        return 0.0;
    }
    
    let engagement = (upvotes + comments) as f64;
    let log_engagement = (engagement + 1.0).ln();
    let log_hours = (hours_since_posted + 1.0).ln();
    let hourly_ratio = if log_hours > 0.0 {
        (log_engagement / log_hours) * 15.0 
    } else {
        engagement / hours_since_posted
    };
    
    hourly_ratio.min(100.0).max(0.0)
}

pub fn reddit_viral_rate(upvotes: u32, comments: u32, subreddit_subs: u32) -> f64 {
    if subreddit_subs == 0 {
        return 0.0;
    }
    
    let engagement = (upvotes + comments) as f64;
    let subs_f = subreddit_subs as f64;
    let log_engagement = (engagement + 1.0).ln();
    let log_subs = (subs_f + 1.0).ln();
    let viral_ratio = if log_subs > 0.0 {
        (log_engagement / log_subs) * 25.0 
    } else {
        0.0
    };
    viral_ratio.min(100.0).max(0.0)
}

pub fn insta_ratio(likes: u32, comments: u32, views: u32) -> f64 {
    if views == 0 {
        return 0.0;
    }
    
    let engagement = (likes + comments) as f64;
    let views_f = views as f64;
    let ratio = (engagement / views_f) * 100.0;
    ratio.min(100.0).max(0.0)
}

pub fn insta_viral_rate(comments: u32, shares: u32, followers: u32) -> f64 {
    if followers == 0 {
        return 0.0;
    }
    
    let viral_actions = (comments + shares) as f64;
    let followers_f = followers as f64;
    let log_viral = (viral_actions + 1.0).ln();
    let log_followers = (followers_f + 1.0).ln();
    let viral_ratio = if log_followers > 0.0 {
        (log_viral / log_followers) * 30.0 
    } else {
        0.0
    };
    viral_ratio.min(100.0).max(0.0)
}

fn apply_percentage_cap(value: f64) -> f64 {
    ((value * 100.0).round() / 100.0).min(100.0).max(0.0)
}
fn normalize_extreme_value(value: f64, max_reasonable: f64) -> f64 {
    if value > max_reasonable {
        let log_value = value.ln();
        let log_max = max_reasonable.ln();
        ((log_value / log_max) * 100.0).min(100.0)
    } else {
        value.min(100.0)
    }
}

fn sanitize_percentage(value: f64, context: &str) -> f64 {
    let sanitized = if value.is_nan() || value.is_infinite() {
        warn!("Valor inválido", context, value);
        0.0
    } else if value > 1000.0 {
        let normalized = normalize_extreme_value(value, 100.0);
        warn!("Valor fuera de límite", context, value, normalized);
        normalized
    } else {
        value.min(100.0).max(0.0)
    };
    
    info!("{} - Valor original: {:.2}%, Valor sanitizado: {:.2}%", context, value, sanitized);
    sanitized
}

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
    pub posts: Vec<serde_json::Value>, 
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
    pub sales: Vec<serde_json::Value>, 
}

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
        let sanitized_interaction = sanitize_percentage(interaction, "Instagram Interaction");
        let sanitized_virality = sanitize_percentage(virality, "Instagram Virality");
        
        total_interaction += sanitized_interaction;
        total_virality += sanitized_virality;
        count += 1;
    }

    if count > 0 {
        let avg_interaction = total_interaction / count as f64;
        let avg_virality = total_virality / count as f64;

        (
            apply_percentage_cap(avg_interaction),
            apply_percentage_cap(avg_virality)
        )
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
        let sanitized_interaction = sanitize_percentage(interaction, "Reddit Interaction");
        let sanitized_virality = sanitize_percentage(virality, "Reddit Virality");
        
        total_interaction += sanitized_interaction;
        total_virality += sanitized_virality;
        count += 1;
    }

    if count > 0 {
        let avg_interaction = total_interaction / count as f64;
        let avg_virality = total_virality / count as f64;

        (
            apply_percentage_cap(avg_interaction),
            apply_percentage_cap(avg_virality)
        )
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
        let sanitized_interaction = sanitize_percentage(interaction, "Twitter Interaction");
        let sanitized_virality = sanitize_percentage(virality, "Twitter Virality");
        
        total_interaction += sanitized_interaction;
        total_virality += sanitized_virality;
        count += 1;
    }

    if count > 0 {
        let avg_interaction = total_interaction / count as f64;
        let avg_virality = total_virality / count as f64;

        (
            ((avg_interaction * 100.0).round() / 100.0).min(100.0),
            ((avg_virality * 100.0).round() / 100.0).min(100.0)
        )
    } else {
        (0.0, 0.0)
    }
}

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

pub fn process_all_hashtags(request: &AnalyticsRequest) -> Vec<HashtagMetrics> {
    let mut results = Vec::new();

    for hashtag_name in &request.hashtags {
        info!("🧮 Procesando hashtag con caps: {}", hashtag_name);

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

        let (instagram_interaction, instagram_virality) = process_instagram_hashtag(&instagram_data);
        let (reddit_interaction, reddit_virality) = process_reddit_hashtag(&reddit_data);
        let (twitter_interaction, twitter_virality) = process_twitter_hashtag(&twitter_data);

        let metrics = HashtagMetrics {
            name: hashtag_name.clone(),
            instagram_interaction,
            instagram_virality,
            reddit_interaction,
            reddit_virality,
            twitter_interaction,
            twitter_virality,
        };

        info!("Hashtag {} procesado (caps aplicados): Insta({:.2}, {:.2}) Reddit({:.2}, {:.2}) Twitter({:.2}, {:.2})", 
               hashtag_name, metrics.instagram_interaction, metrics.instagram_virality,
               metrics.reddit_interaction, metrics.reddit_virality,
               metrics.twitter_interaction, metrics.twitter_virality);

        results.push(metrics);
    }

    results
}

// Endpoints sin cambios...
#[post("/process")]
async fn process_analytics(req: web::Json<AnalyticsRequest>) -> Result<impl Responder> {
    let start_time = std::time::Instant::now();
    
    info!("🧮 Iniciando procesamiento de analytics con caps...");
    info!("📊 Hashtags a procesar: {:?}", req.hashtags);

    let hashtag_metrics = process_all_hashtags(&req);
    
    let processing_time = start_time.elapsed().as_millis();
    
    let response = AnalyticsResponse {
        hashtags: hashtag_metrics,
        total_hashtags: req.hashtags.len(),
        processing_time_ms: processing_time,
        data_source: "backend_calculations_with_caps".to_string(),
    };

    info!("✅ Analytics procesado con caps en {}ms", processing_time);

    Ok(HttpResponse::Ok().json(response))
}

#[post("/test")]
async fn test_analytics() -> Result<impl Responder> {
    info!("🧪 Test de analytics con datos hardcodeados y caps");

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
        "message": "Analytics funcionando con caps y logaritmos",
        "test_results": metrics,
        "formulas_used": [
            "insta_ratio() [capped]", "insta_viral_rate() [log]",
            "reddit_hourly_ratio() [log]", "reddit_viral_rate() [log]",
            "x_interaction_rate() [capped]", "x_viral_rate() [log]"
        ]
    })))
}

pub fn routes() -> actix_web::Scope {
    web::scope("/analytics")
        .service(process_analytics)  
        .service(test_analytics)     
}