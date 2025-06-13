/**
 * Cliente Centralizado para Conexiones DynamoDB
 * 
 * Este archivo implementa un cliente unificado para interacciones con DynamoDB
 * que maneja configuración automática entre entornos locales y AWS, gestión
 * de prefijos de tablas y configuración de endpoints flexibles.
 * 
 * Autor: Lucio Arturo Reyes Castillo
 */

use aws_config::BehaviorVersion;
use aws_sdk_dynamodb::Client;
use std::env;
use tracing::{info, warn};

/**
 * Estructura principal para cliente DynamoDB centralizado
 * Encapsula la configuración y cliente AWS SDK proporcionando
 * una interfaz unificada para todas las operaciones de base de datos NoSQL
 */
pub struct DynamoClient {
    pub client: Client,
}

impl DynamoClient {

    pub async fn new() -> Self {
        let config = match env::var("DYNAMODB_ENDPOINT") {
            Ok(endpoint) => {
                info!("Using local DynamoDB endpoint: {}", endpoint);
                aws_config::defaults(BehaviorVersion::latest())
                    .endpoint_url(endpoint)
                    .load()
                    .await
            }
            Err(_) => {
                info!("Using AWS DynamoDB");
                aws_config::load_defaults(BehaviorVersion::latest()).await
            }
        };
        let client = Client::new(&config);
        Self { client }
    }

    /**
     * Método utilitario para generar nombres de tabla con prefijo
     * Construye nombres de tabla consistentes usando prefijo configurable
     * permitiendo separación de entornos y organización de recursos
     * 
     * @param base_name Nombre base de la tabla sin prefijo
     * @return Nombre completo de tabla con prefijo del entorno
     */
    pub fn get_table_name(&self, base_name: &str) -> String {
        let prefix = env::var("DYNAMODB_TABLE_PREFIX").unwrap_or_else(|_| "trendhash_".to_string());
        format!("{}{}", prefix, base_name)
    }
}