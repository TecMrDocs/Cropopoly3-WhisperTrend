use diesel::prelude::*;
use diesel::r2d2::{self, ConnectionManager, PooledConnection};

use actix_web::web;

use crate::{
    config::CONFIG, 
    models, 
    schema
};

pub type DbPool = r2d2::Pool<ConnectionManager<PgConnection>>;

const MAX_POOL_SIZE: u32 = 5;

#[derive(Clone)]
pub struct DataBase {
    pool: DbPool,
}

impl DataBase {
    pub fn new() -> Self {
        let manager = ConnectionManager::<PgConnection>::new(CONFIG.database_url.clone());
        let pool = r2d2::Pool::builder()
            .max_size(MAX_POOL_SIZE)
            .build(manager)
            .expect("Failed to create database pool");
        Self { pool }
    }

    pub fn get_connection(
        &self,
    ) -> anyhow::Result<PooledConnection<ConnectionManager<PgConnection>>> {
        self.pool
            .get()
            .map_err(|e| anyhow::anyhow!("Failed to get connection from pool: {}", e))
    }

    pub async fn query_wrapper<F, T>(&self, f: F) -> anyhow::Result<T>
    where
        F: FnOnce(&mut PgConnection) -> Result<T, diesel::result::Error> + Send + 'static,
        T: Send + 'static,
    {
        let mut conn = self.get_connection()?;
        let result = web::block(move || f(&mut conn))
            .await
            .map_err(|e| {
                log::error!("Database error: {:?}", e);
                anyhow::anyhow!(e)
            })?
            .map_err(|e| {
                log::error!("Database error: {:?}", e);
                anyhow::anyhow!(e)
            })?;
        Ok(result)
    }
    /////////////////////////////////////////////////////
    /////////////// Admin related methods ///////////////
    /////////////////////////////////////////////////////

    /////////////////////////////////////////////////////
    /////////////// User related methods ////////////////
    /////////////////////////////////////////////////////
    pub async fn get_users(&self) -> anyhow::Result<Vec<models::user::User>> {
        self.query_wrapper(move |conn| {
            schema::user::table.load::<models::user::User>(conn)
        })
        .await
    }

    pub async fn create_user(&self, new_user: models::user::User) -> anyhow::Result<i32> {
        let id = self
            .query_wrapper(move |conn| {
                conn.transaction(|pooled| {
                    let id: i32 = diesel::insert_into(schema::user::table)
                        .values(&new_user)
                        .returning(schema::user::id)
                        .get_result(pooled)?;

                    Ok(id)
                })
            })
            .await?;

        Ok(id)
    }

}