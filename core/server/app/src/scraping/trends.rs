use crate::scraping::{
    instagram::{InstagramPost, InstagramScraper},
    notices::{Details, NoticesScraper, Params},
    reddit::{RedditScraper, SimplePostWithMembers},
    twitter::{TweetData, TwitterScraper},
};
use futures::future::join_all;
use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize, Debug)]
pub struct RedditMetrics {
    pub keyword: String,
    pub posts: Vec<SimplePostWithMembers>,
}

#[derive(Deserialize, Serialize, Debug)]
pub struct InstagramMetrics {
    pub keyword: String,
    pub posts: Vec<InstagramPost>,
}

#[derive(Deserialize, Serialize, Debug)]
pub struct TwitterMetrics {
    pub keyword: String,
    pub posts: Vec<TweetData>,
}

#[derive(Deserialize, Serialize, Debug)]
pub struct Data {
    pub reddit: Vec<RedditMetrics>,
    pub instagram: Vec<InstagramMetrics>,
    pub twitter: Vec<TwitterMetrics>,
}

#[derive(Deserialize, Serialize, Debug)]
pub struct Trends {
    pub metadata: Details,
    pub data: Data,
}

pub struct TrendsScraper;

impl TrendsScraper {
    pub async fn get_reddit_metrics(details: &Details) -> Vec<RedditMetrics> {
        let mut futures = Vec::new();

        for detail in details {
            for keyword in &detail.keywords {
                let future = async move {
                    let posts = RedditScraper::get_simple_posts_with_members(keyword.clone()).await;
                    RedditMetrics {
                        keyword: keyword.clone(),
                        posts,
                    }
                };

                futures.push(future);
            }
        }

        let results = join_all(futures).await;
        results.into_iter().collect()
    }

    pub async fn get_instagram_metrics(details: &Details) -> Vec<InstagramMetrics> {
        let mut futures = Vec::new();

        for detail in details {
            for keyword in &detail.keywords {
                let future = async move {
                    match InstagramScraper::get_posts(keyword.clone()).await {
                        Ok(posts) => InstagramMetrics {
                            keyword: keyword.clone(),
                            posts,
                        },
                        Err(_) => InstagramMetrics {
                            keyword: keyword.clone(),
                            posts: Vec::new(),
                        },
                    }
                };

                futures.push(future);
            }
        }

        let results = join_all(futures).await;
        results.into_iter().collect()
    }

    // Nuevas funciones para hashtags
    pub async fn get_reddit_metrics_from_hashtags(hashtags: &[String]) -> Vec<RedditMetrics> {
        let mut futures = Vec::new();
        for hashtag in hashtags {
            let hashtag_clone = hashtag.clone();
            let future = async move {
                let posts = RedditScraper::get_simple_posts_with_members(hashtag_clone.clone()).await;
                RedditMetrics {
                    keyword: hashtag_clone,
                    posts,
                }
            };
            futures.push(future);
        }
        let results = join_all(futures).await;
        results.into_iter().collect()
    }

    pub async fn get_instagram_metrics_from_hashtags(hashtags: &[String]) -> Vec<InstagramMetrics> {
        let mut futures = Vec::new();
        for hashtag in hashtags {
            let hashtag_clone = hashtag.clone();
            let future = async move {
                match InstagramScraper::get_posts(hashtag_clone.clone()).await {
                    Ok(posts) => InstagramMetrics {
                        keyword: hashtag_clone,
                        posts,
                    },
                    Err(_) => InstagramMetrics {
                        keyword: hashtag_clone,
                        posts: Vec::new(),
                    },
                }
            };
            futures.push(future);
        }
        let results = join_all(futures).await;
        results.into_iter().collect()
    }

    pub async fn get_twitter_metrics(details: &Details) -> Vec<TwitterMetrics> {
        let mut futures = Vec::new();

        for detail in details {
            for keyword in &detail.keywords {
                let future = async move {
                    match TwitterScraper::get_posts(keyword.clone()).await {
                        Ok(posts) => TwitterMetrics {
                            keyword: keyword.clone(),
                            posts,
                        },
                        Err(_) => TwitterMetrics {
                            keyword: keyword.clone(),
                            posts: Vec::new(),
                        },
                    }
                };

                futures.push(future);
            }
        }

        let results = join_all(futures).await;
        results.into_iter().collect()
    }


    pub async fn get_twitter_metrics_from_hashtags(hashtags: &[String]) -> Vec<TwitterMetrics> {
        let mut futures = Vec::new();
        for hashtag in hashtags {
            let hashtag_clone = hashtag.clone();
            let future = async move {
                match TwitterScraper::get_posts(hashtag_clone.clone()).await {
                    Ok(posts) => TwitterMetrics {
                        keyword: hashtag_clone,
                        posts,
                    },
                    Err(_) => TwitterMetrics {
                        keyword: hashtag_clone,
                        posts: Vec::new(),
                    },
                }
            };
            futures.push(future);
        }
        let results = join_all(futures).await;
        results.into_iter().collect()
    }

    pub async fn get_trends(params: Params) -> anyhow::Result<Trends> {
        let details = NoticesScraper::get_details(params).await?;

        let reddit_future = Self::get_reddit_metrics(&details);
        let instagram_future = Self::get_instagram_metrics(&details);
        let twitter_future = Self::get_twitter_metrics(&details);

        let (reddit, instagram, twitter) = futures::future::join3(reddit_future, instagram_future, twitter_future).await;

        Ok(Trends {
            metadata: details,
            data: Data {
                reddit,
                instagram,
                twitter,
            },
        })
    }

    // Nueva función que incluye hashtags
    pub async fn get_trends_with_hashtags(params: Params, hashtags: Option<Vec<String>>) -> anyhow::Result<Trends> {
        let details = NoticesScraper::get_details(params).await?;
        
        // Obtener métricas de las palabras clave de las noticias
        let reddit_keywords_future = Self::get_reddit_metrics(&details);
        let instagram_keywords_future = Self::get_instagram_metrics(&details);
        // let twitter_keywords_future = Self::get_twitter_metrics(&details);
        
        // Si hay hashtags, también obtener métricas de los hashtags
        let (mut reddit_results, mut instagram_results, mut twitter_results) = if let Some(ref hashtags) = hashtags {
            let reddit_hashtags_future = Self::get_reddit_metrics_from_hashtags(hashtags);
            let instagram_hashtags_future = Self::get_instagram_metrics_from_hashtags(hashtags);
            // let twitter_hashtags_future = Self::get_twitter_metrics_from_hashtags(hashtags);
            
            let (
                reddit_keywords, 
                instagram_keywords, 
                // twitter_keywords,
                reddit_hashtags, 
                instagram_hashtags, 
                // twitter_hashtags
            ) = futures::join!(
                reddit_keywords_future, 
                instagram_keywords_future,
                // twitter_keywords_future, 
                reddit_hashtags_future,
                instagram_hashtags_future,
                // twitter_hashtags_future
            );
            
            // Combinar resultados de keywords y hashtags
            let mut combined_reddit = reddit_keywords;
            combined_reddit.extend(reddit_hashtags);
            
            let mut combined_instagram = instagram_keywords;
            combined_instagram.extend(instagram_hashtags);
            

            // let mut combined_twitter = twitter_keywords;
            // combined_twitter.extend(twitter_hashtags);
            
            (combined_reddit, combined_instagram, Vec::new())
        } else {
            // Solo usar las keywords de las noticias
            futures::future::join3(reddit_keywords_future, instagram_keywords_future, async { Vec::new() }).await
        };

        Ok(Trends {
            metadata: details,
            data: Data {
                reddit: reddit_results,
                instagram: instagram_results,
                twitter: twitter_results,
            },
        })
    }
}
