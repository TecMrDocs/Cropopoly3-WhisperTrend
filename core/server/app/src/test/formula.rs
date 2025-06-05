// Copyright 2025 WhisperTrend
// Este archivo pertenece al proyecto WhisperTrend
// Tester: Lucio Arturo Reyes Castillo
// Fecha: 04-06-2025

// Este módulo contiene funciones para calcular métricas de viralidad e interacción en redes sociales como X (Twitter), Reddit e Instagram.

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

// ===================== MÓDULO DE PRUEBAS =====================
/* 
    X(twitter) VIRAL RATE
        -- Prueba #1 (test_x_viral_rate_normal_case)
        Cálculo: (100 reposts + 500 likes + 50 comments) / 1000 followers * 100 = 650 / 1000 * 100 = 0.65 * 100 = 65.0%
        Resultado: 65.0%
        
        -- Prueba #2 (test_x_viral_rate_zero_followers)
        Cálculo: División por cero (followers = 0), función retorna 0.0 por seguridad
        Resultado: 0.0%
        
        -- Prueba #3 (test_x_viral_rate_zero_engagement)
        Cálculo: (0 reposts + 0 likes + 0 comments) / 1000 followers * 100 = 0 / 1000 * 100 = 0.0%
        Resultado: 0.0%

    X(twitter) INTERACTION RATE
        -- Prueba #4 (test_x_interaction_rate_normal_case)
        Cálculo: (10 reposts + 100 likes + 20 comments) / 1000 views * 100 = 130 / 1000 * 100 = 0.13 * 100 = 13.0%
        Resultado: 13.0%
        
        -- Prueba #5 (test_x_interaction_rate_zero_views)
        Cálculo: División por cero (views = 0), función retorna 0.0 por seguridad
        Resultado: 0.0%
        
        -- Prueba #6 (test_x_interaction_rate_high_engagement)
        Cálculo: (50 reposts + 200 likes + 30 comments) / 100 views * 100 = 280 / 100 * 100 = 2.8 * 100 = 280.0%
        Resultado: 280.0%
*/

/* 
    Reddit HOURLY RATIO
        -- Prueba #7 (test_reddit_hourly_ratio_normal_case)
        Cálculo: (120 upvotes + 30 comments) / 2.0 horas = 150 / 2.0 = 75.0 puntos por hora
        Resultado: 75.0 puntos por hora
        
        -- Prueba #8 (test_reddit_hourly_ratio_zero_hours)
        Cálculo: División por cero (hours = 0.0), función retorna 0.0 por seguridad
        Resultado: 0.0 puntos por hora
        
        -- Prueba #9 (test_reddit_hourly_ratio_fraction_hours)
        Cálculo: (50 upvotes + 10 comments) / 0.5 horas = 60 / 0.5 = 120.0 puntos por hora
        Resultado: 120.0 puntos por hora

    Reddit VIRAL RATE
        -- Prueba #10 (test_reddit_viral_rate_normal_case)
        Cálculo: (500 upvotes + 100 comments) / 10000 suscriptores * 100 = 600 / 10000 * 100 = 0.06 * 100 = 6.0%
        Resultado: 6.0%
        
        -- Prueba #11 (test_reddit_viral_rate_zero_subs)
        Cálculo: División por cero (suscriptores = 0), función retorna 0.0 por seguridad
        Resultado: 0.0%
        
        -- Prueba #12 (test_reddit_viral_rate_small_subreddit)
        Cálculo: (10 upvotes + 5 comments) / 50 suscriptores * 100 = 15 / 50 * 100 = 0.3 * 100 = 30.0%
        Resultado: 30.0%
*/

/* 
    Instagram RATIO (SIN SHARES - ACTUALIZADO)
        -- Prueba #13 (test_insta_ratio_normal_case)
        Cálculo: (800 likes + 50 comments) / 5000 views * 100 = 850 / 5000 * 100 = 0.17 * 100 = 17.0%
        Resultado: 17.0%
        
        -- Prueba #14 (test_insta_ratio_zero_views)
        Cálculo: División por cero (views = 0), función retorna 0.0 por seguridad
        Resultado: 0.0%
        
        -- Prueba #15 (test_insta_ratio_high_engagement)
        Cálculo: (1000 likes + 200 comments) / 1000 views * 100 = 1200 / 1000 * 100 = 1.2 * 100 = 120.0%
        Resultado: 120.0%

    Instagram VIRAL RATE
        -- Prueba #16 (test_insta_viral_rate_normal_case)
        Cálculo: (100 comments + 25 shares) / 2000 followers * 100 = 125 / 2000 * 100 = 0.0625 * 100 = 6.25%
        Resultado: 6.25%
        
        -- Prueba #17 (test_insta_viral_rate_zero_followers)
        Cálculo: División por cero (followers = 0), función retorna 0.0 por seguridad
        Resultado: 0.0%
        
        -- Prueba #18 (test_insta_viral_rate_only_comments)
        Cálculo: (50 comments + 0 shares) / 500 followers * 100 = 50 / 500 * 100 = 0.1 * 100 = 10.0%
        Resultado: 10.0%
        
        -- Prueba #19 (test_insta_viral_rate_only_shares)
        Cálculo: (0 comments + 25 shares) / 500 followers * 100 = 25 / 500 * 100 = 0.05 * 100 = 5.0%
        Resultado: 5.0%
*/

#[cfg(test)]
mod tests {
    use super::*;
    
    // ===================== X (TWITTER) VIRAL RATE TESTS =====================
    
    //Prueba #1
    #[test]
    fn test_x_viral_rate_normal_case() {
        let result = x_viral_rate(100, 500, 50, 1000);
        assert_eq!(result, 65.0); 
    }

    //Prueba #2
    #[test]
    fn test_x_viral_rate_zero_followers() {
        let result = x_viral_rate(100, 500, 50, 0);
        assert_eq!(result, 0.0); 
    }
    
    //Prueba #3
    #[test]
    fn test_x_viral_rate_zero_engagement() {
        let result = x_viral_rate(0, 0, 0, 1000);
        assert_eq!(result, 0.0); 
    }

    // ===================== X (TWITTER) INTERACTION RATE TESTS =====================

    //Prueba #4
    #[test]
    fn test_x_interaction_rate_normal_case() {
        let result = x_interaction_rate(10, 100, 20, 1000);
        assert_eq!(result, 13.0);
    }
    
    //Prueba #5
    #[test]
    fn test_x_interaction_rate_zero_views() {
        let result = x_interaction_rate(10, 100, 20, 0);
        assert_eq!(result, 0.0);
    }

    //Prueba #6
    #[test] 
    fn test_x_interaction_rate_high_engagement() {
        let result = x_interaction_rate(50, 200, 30, 100);
        assert_eq!(result, 280.0);
    }

    // ===================== REDDIT HOURLY RATIO TESTS =====================

    //Prueba #7
    #[test]
    fn test_reddit_hourly_ratio_normal_case() {
        let result = reddit_hourly_ratio(120, 30, 2.0);
        assert_eq!(result, 75.0);
    }
    
    //Prueba #8
    #[test]
    fn test_reddit_hourly_ratio_zero_hours() {
        let result = reddit_hourly_ratio(120, 30, 0.0);
        assert_eq!(result, 0.0);
    }
    
    //Prueba #9
    #[test]
    fn test_reddit_hourly_ratio_fraction_hours() {
        let result = reddit_hourly_ratio(50, 10, 0.5);
        assert_eq!(result, 120.0);
    }

    // ===================== REDDIT VIRAL RATE TESTS =====================

    //Prueba #10
    #[test]
    fn test_reddit_viral_rate_normal_case() {
        let result = reddit_viral_rate(500, 100, 10000);
        assert_eq!(result, 6.0);
    }
    
    //Prueba #11
    #[test]
    fn test_reddit_viral_rate_zero_subs() {
        let result = reddit_viral_rate(500, 100, 0);
        assert_eq!(result, 0.0);
    }
    
    //Prueba #12
    #[test]
    fn test_reddit_viral_rate_small_subreddit() {
        let result = reddit_viral_rate(10, 5, 50);
        assert_eq!(result, 30.0);
    }

    // ===================== INSTAGRAM RATIO TESTS =====================

    //Prueba #13
    #[test]
    fn test_insta_ratio_normal_case() {
        let result = insta_ratio(800, 50, 5000);
        assert_eq!(result, 17.0); 
    }
    
    //Prueba #14
    #[test]
    fn test_insta_ratio_zero_views() {
        let result = insta_ratio(800, 50, 0);
        assert_eq!(result, 0.0);
    }
    
    //Prueba #15
    #[test]
    fn test_insta_ratio_high_engagement() {
        let result = insta_ratio(1000, 200, 1000);
        assert_eq!(result, 120.0);
    }

    // ===================== INSTAGRAM VIRAL RATE TESTS =====================

    //Prueba #16
    #[test]
    fn test_insta_viral_rate_normal_case() {
        let result = insta_viral_rate(100, 25, 2000);
        assert_eq!(result, 6.25);
    }
    
    //Prueba #17
    #[test]
    fn test_insta_viral_rate_zero_followers() {
        let result = insta_viral_rate(100, 25, 0);
        assert_eq!(result, 0.0);
    }
    
    //Prueba #18
    #[test]
    fn test_insta_viral_rate_only_comments() {
        let result = insta_viral_rate(50, 0, 500);
        assert_eq!(result, 10.0);
    }
    
    //Prueba #19
    #[test]
    fn test_insta_viral_rate_only_shares() {
        let result = insta_viral_rate(0, 25, 500);
        assert_eq!(result, 5.0);
    }
}