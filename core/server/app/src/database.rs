/**
* Módulo de gestión de base de datos y pool de conexiones.
* 
* Este módulo proporciona funcionalidades para la inicialización y gestión
* de conexiones a base de datos PostgreSQL utilizando Diesel ORM y R2D2
* connection pool. Incluye manejo de migraciones automáticas, singleton
* thread-safe para el pool de conexiones y wrappers para ejecutar queries
* de forma asíncrona sin bloquear el runtime de Actix Web.
* 
* Autor: Carlos Alberto Zamudio Velázquez
*/

use actix_web::web;
use diesel::prelude::*;
use diesel::r2d2::{self, ConnectionManager, PooledConnection};
use diesel_migrations::{EmbeddedMigrations, MigrationHarness, embed_migrations};
use once_cell::sync::OnceCell;
use std::env;
use tracing::error;

// Embed database migrations at compile time
pub const MIGRATIONS: EmbeddedMigrations = embed_migrations!("migrations");

/// Sets up the database by running all pending migrations
/// 
/// # Arguments
/// * `connection` - Mutable reference to a PostgreSQL connection
fn setup_database(connection: &mut PgConnection) {
    connection
        .run_pending_migrations(MIGRATIONS)
        .expect("error running migrations");
}

/// Database struct that holds the connection pool
/// This struct is cloneable to allow sharing across multiple threads
#[derive(Clone)]
pub struct Database {
    /// R2D2 connection pool for managing PostgreSQL connections
    pub pool: r2d2::Pool<ConnectionManager<PgConnection>>,
}

/// Global singleton instance of the Database
/// Uses OnceCell to ensure thread-safe initialization
static INSTANCE: OnceCell<Database> = OnceCell::new();

/// Trait for converting database results to web responses
/// This trait helps handle database errors and convert them to HTTP responses
pub trait DbResponder<T> {
    /// Converts a database result to an Actix Web result
    fn to_web(self) -> actix_web::Result<T, actix_web::Error>;
}

/// Implementation of DbResponder for anyhow::Result<T> where T implements Serialize
/// This allows automatic conversion of database results to JSON responses
impl<T: serde::Serialize> DbResponder<T> for anyhow::Result<T> {
    fn to_web(self) -> actix_web::Result<T, actix_web::Error> {
        match self {
            // If successful, return the data
            Ok(data) => Ok(data),
            // If error, log it and return a bad request response
            Err(e) => {
                error!("Database error: {:?}", e);
                Err(actix_web::error::ErrorBadRequest("Failed"))
            }
        }
    }
}

impl Database {
    /// Initializes the database singleton with a connection pool
    /// 
    /// # Arguments
    /// * `max_pool_size` - Maximum number of connections in the pool
    /// * `with_migrations` - Whether to run migrations during initialization
    /// 
    /// # Returns
    /// * `anyhow::Result<()>` - Ok if successful, Err if initialization fails
    pub fn init(max_pool_size: u32, with_migrations: bool) -> anyhow::Result<()> {
        // Create a connection manager for PostgreSQL
        // DATABASE_URL environment variable must be set
        let manager = ConnectionManager::<PgConnection>::new(
            env::var("DATABASE_URL").expect("DATABASE_URL must be set"),
        );

        // Build the connection pool with specified maximum size
        let pool = r2d2::Pool::builder()
            // Set the maximum number of connections to the database
            .max_size(max_pool_size)
            .build(manager)
            .expect("Failed to create pool.");

        // Run migrations if requested
        if with_migrations {
            let mut connection = pool.get().expect("Failed to get connection.");
            setup_database(&mut connection);
        }

        // Set the global instance (can only be done once)
        INSTANCE
            .set(Self { pool })
            .map_err(|_| anyhow::anyhow!("Failed to set database"))
    }

    /// Gets a connection from the connection pool
    /// 
    /// # Returns
    /// * `anyhow::Result<PooledConnection<ConnectionManager<PgConnection>>>` - A pooled connection or error
    pub fn get_connection() -> anyhow::Result<PooledConnection<ConnectionManager<PgConnection>>> {
        INSTANCE
            .get()
            .ok_or(anyhow::anyhow!("Database not initialized"))?
            .pool
            .get()
            .map_err(|e| anyhow::anyhow!(e))
    }

    /// Executes a database query asynchronously using Actix Web's blocking executor
    /// This wrapper ensures that blocking database operations don't block the async runtime
    /// 
    /// # Arguments
    /// * `f` - A closure that takes a mutable PostgreSQL connection and returns a Diesel result
    /// 
    /// # Returns
    /// * `anyhow::Result<T>` - The result of the query execution
    /// 
    /// # Type Parameters
    /// * `F` - The closure type that must be Send + 'static
    /// * `T` - The return type of the query, must be Send + 'static
    pub async fn query_wrapper<F, T>(f: F) -> anyhow::Result<T>
    where
        F: FnOnce(&mut PgConnection) -> Result<T, diesel::result::Error> + Send + 'static,
        T: Send + 'static,
    {
        // Get a connection from the pool
        let mut conn = Self::get_connection()?;

        // Execute the query in a blocking thread to avoid blocking the async runtime
        let result = web::block(move || f(&mut conn))
            .await
            .map_err(|e| {
                error!("Database error: {:?}", e);
                anyhow::anyhow!(e)
            })?
            .map_err(|e| {
                error!("Database error: {:?}", e);
                anyhow::anyhow!(e)
            })?;

        Ok(result)
    }
}
