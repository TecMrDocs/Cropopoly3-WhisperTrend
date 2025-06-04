use crate::scraping::{
    instagram::{InstagramPost, InstagramScraper},
    notices::{Details, NoticesScraper, Params},
    reddit::{RedditScraper, SimplePostWithMembers},
};
use futures::future::join_all;
use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize, Debug)]
pub struct RedditMetrics {
    keyword: String,
    posts: Vec<SimplePostWithMembers>,
}

#[derive(Deserialize, Serialize, Debug)]
pub struct InstagramMetrics {
    keyword: String,
    posts: Vec<InstagramPost>,
}

#[derive(Deserialize, Serialize, Debug)]
pub struct Data {
    reddit: Vec<RedditMetrics>,
    instagram: Vec<InstagramMetrics>,
    twitter: Vec<()>,
}

#[derive(Deserialize, Serialize, Debug)]
pub struct Trends {
    metadata: Details,
    data: Data,
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

    pub async fn get_trends(params: Params) -> anyhow::Result<Trends> {
        let details = NoticesScraper::get_details(params).await?;

        let reddit_future = Self::get_reddit_metrics(&details);
        let instagram_future = Self::get_instagram_metrics(&details);

        let (reddit, instagram) = futures::future::join(reddit_future, instagram_future).await;

        Ok(Trends {
            metadata: details,
            data: Data {
                reddit,
                instagram,
                twitter: Vec::new(),
            },
        })
    }
}
