use crate::common::Config;
use actix_web::web;
use diesel::prelude::*;
use diesel::r2d2::{self, ConnectionManager, PooledConnection};
use diesel_migrations::{EmbeddedMigrations, MigrationHarness, embed_migrations};
use once_cell::sync::OnceCell;
use std::env;
use tracing::error;

pub const MIGRATIONS: EmbeddedMigrations = embed_migrations!("migrations");

fn setup_database(connection: &mut PgConnection) {
    connection
        .run_pending_migrations(MIGRATIONS)
        .expect("error running migrations");
}

#[derive(Clone)]
pub struct Database {
    pub pool: r2d2::Pool<ConnectionManager<PgConnection>>,
}

static INSTANCE: OnceCell<Database> = OnceCell::new();

impl Database {
    pub fn init(config: &Config) -> anyhow::Result<()> {
        let manager = ConnectionManager::<PgConnection>::new(
            env::var("DATABASE_URL").expect("DATABASE_URL must be set"),
        );

        let pool = r2d2::Pool::builder()
            // Set the maximum number of connections to the database
            .max_size(config.max_pool_size)
            .build(manager)
            .expect("Failed to create pool.");

        if config.with_migrations {
            let mut connection = pool.get().expect("Failed to get connection.");
            setup_database(&mut connection);
        }

        INSTANCE
            .set(Self { pool })
            .map_err(|_| anyhow::anyhow!("Failed to set database"))
    }

    pub fn get_connection() -> anyhow::Result<PooledConnection<ConnectionManager<PgConnection>>> {
        INSTANCE
            .get()
            .ok_or(anyhow::anyhow!("Database not initialized"))?
            .pool
            .get()
            .map_err(|e| anyhow::anyhow!(e))
    }

    pub async fn query_wrapper<F, T>(f: F) -> anyhow::Result<T>
    where
        F: FnOnce(&mut PgConnection) -> Result<T, diesel::result::Error> + Send + 'static,
        T: Send + 'static,
    {
        let mut conn = Self::get_connection()?;

        // Execute the query
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
