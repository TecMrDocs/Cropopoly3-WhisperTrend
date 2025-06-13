/**
 * Utilidad para obtener la configuración de autenticación para las peticiones HTTP.
 * Esta configuración incluye el token almacenado en `localStorage` y la bandera `withCredentials`
 * para permitir el envío de cookies o cabeceras necesarias para la autenticación en el backend.
 *
 * Autor: Sebastián Antonio Almanza
 * Contribuyentes: -
 */

interface Config {
  withCredentials: boolean;
  headers: {
    token: string;
  };
}

/**
 *
 * Genera la configuración necesaria para las peticiones protegidas,
 * obteniendo el token desde `localStorage`. El token se incluye en los headers
 * bajo la clave `token`.
 *
 * @return {Config} Objeto con `withCredentials` habilitado y token de autenticación en headers.
 *
 */
export function getConfig(): Config {
  const token = localStorage.getItem('token');
  return {
    withCredentials: true,
    headers: {
      token: token || "",
    }
  }
}
