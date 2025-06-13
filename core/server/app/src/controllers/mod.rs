/**
* Módulo Principal de Controladores
* 
* Define la estructura modular del sistema organizando controladores
* especializados para autenticación, análisis, gestión y administración.
* 
* Autor: Renato García Morán
* Contributor: Arturo Barrios Mendoza, Julio César Vivas Medina
*/

/**
* Autenticación de usuarios y gestión de sesiones
*/
pub mod auth;

/**
* Interfaz web y manejo de rutas principales
*/
pub mod web;

/**
* Sistema de chat en tiempo real
*/
pub mod chat;

/**
* Gestión de recursos del sistema
*/
pub mod recurso;

/**
* Operaciones CRUD de usuarios
*/
pub mod user;

/**
* Procesamiento y análisis de ventas
*/
pub mod sale;

/**
* Funcionalidades administrativas del sistema
*/
pub mod admin;

/**
* Orquestador de análisis con IA y scraping
*/
pub mod flow;

/**
* Sistema de correo electrónico
*/
pub mod email;

/**
* Autenticación multifactor (MFA)
*/
pub mod auth_mfa;

/**
* Análisis de datos y métricas
*/
pub mod analysis;