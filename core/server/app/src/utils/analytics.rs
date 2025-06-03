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

pub fn insta_ratio(likes: u32, comments: u32, shares: u32, views: u32) -> f64 {
    if views == 0 {
        return 0.0;
    }
    ((likes + comments + shares) as f64 / views as f64) * 100.0
}

pub fn insta_viral_rate(comments: u32, shares: u32, followers: u32) -> f64 {
    if followers == 0 {
        return 0.0;
    }
    ((comments + shares) as f64 / followers as f64) * 100.0
}
