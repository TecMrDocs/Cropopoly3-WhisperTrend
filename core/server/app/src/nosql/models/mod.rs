/**
 * Models Module - Definiciones de Estructuras de Datos del Sistema
 * 
 * Este módulo centraliza todas las estructuras de datos y modelos utilizados
 * en el sistema de análisis de tendencias y métricas de dashboard. Proporciona
 * una interfaz unificada para el acceso a los diferentes tipos de datos manejados
 * por la aplicación, incluyendo cache de hashtags, resultados de análisis,
 * métricas del dashboard y historial de tendencias.
 * 
 * Autor: Renato García Morán
 */

pub mod hashtag_cache;
pub mod analysis_result;
pub mod dashboard_metrics;
pub mod trends_history;

pub use hashtag_cache::HashtagCache;
pub use analysis_result::AnalysisResult;
pub use dashboard_metrics::DashboardMetrics;
pub use trends_history::TrendsHistory;