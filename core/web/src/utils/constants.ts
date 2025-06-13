/**
 * Configuración dinámica de las URLs base para la comunicación con el servidor.
 * Este módulo construye la URL del backend a partir de variables de entorno y ajusta
 * automáticamente el hostname si la app corre en un dominio diferente al configurado.
 *
 * Autor: Sebastián Antonio Almanza
 * Contribuyentes: Carlos Zamudio Velazquez (Configuración para despliegue)
 */
const SERVER_PROTOCOL = import.meta.env.VITE_APP_SERVER_PROTOCOL || "http";
const SERVER_PORT = import.meta.env.VITE_APP_SERVER_PORT || "80";
const SERVER_HOSTNAME = import.meta.env.VITE_APP_SERVER_HOST || "localhost";
let SERVER_HOST = `${SERVER_HOSTNAME}:${SERVER_PORT}`;

/**
 *
 * En caso de que el dominio actual (en el que corre la app) sea distinto al configurado
 * en las variables de entorno, se reemplaza dinámicamente por el dominio actual.
 * Esto permite que la app se adapte automáticamente al entorno en el que se despliegue.
 *
 */
SERVER_HOST =
  window.location.hostname === SERVER_HOSTNAME
    ? SERVER_HOST
    : window.location.hostname + ":" + SERVER_PORT;

export const API_ROUTE = import.meta.env.VITE_APP_API_ROUTE || "api/v1/";
export const API_URL = `${SERVER_PROTOCOL}://${SERVER_HOST}/${API_ROUTE}`;
export const SERVER = `${SERVER_PROTOCOL}://${SERVER_HOST}`;