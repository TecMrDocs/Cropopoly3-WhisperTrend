use std::env;

pub struct FlowConfig {
    web_base_url: String,
    sales_base_url: String,
}

impl FlowConfig {
    pub fn new() -> Self {
        let default_url = "http://localhost:8080/api/v1/web/".to_string();
        let default_sales_url = "http://localhost:8080/api/v1/sale/".to_string();
        let web_base_url = env::var("WEB_BASE_URL").unwrap_or(default_url);
        let sales_base_url = env::var("SALES_BASE_URL").unwrap_or(default_sales_url);
        FlowConfig { web_base_url, sales_base_url, }
    }

    pub fn get_web_url(&self, path: &str) -> String {
        format!("{}/{}", self.web_base_url.trim_end_matches('/'), path)
    }
    pub fn get_sales_url(&self, path: &str) -> String {
        format!("{}/{}", self.sales_base_url.trim_end_matches('/'), path)
    }
}

lazy_static::lazy_static! {
    pub static ref FLOW_CONFIG: FlowConfig = FlowConfig::new();
}
