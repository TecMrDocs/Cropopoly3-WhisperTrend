/**
* Módulo de gestión de caché para códigos OTP (One-Time Password).
* 
* Este módulo proporciona estructuras de datos y funcionalidades para el
* almacenamiento temporal de códigos de autenticación de un solo uso.
* Utiliza DashMap para acceso concurrente thread-safe y manejo de expiración
* basado en timestamps UTC para garantizar la seguridad temporal de los códigos.
* 
* Autor: Iván Alexander Ramos Ramírez
*/

use dashmap::DashMap;
use chrono::{DateTime, Utc};

/**
* Tipo de caché para códigos OTP con expiración temporal.
* 
* Estructura de datos concurrente que asocia IDs de usuario con tuplas
* que contienen el código OTP y su timestamp de expiración UTC.
*/
pub type OtpCache = DashMap<i32, (String, DateTime<Utc>)>;