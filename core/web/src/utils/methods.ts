/**
 * Funciones utilitarias para realizar peticiones HTTP `GET` y `POST` hacia la API del backend.
 * Estas funciones están tipadas con genéricos para soportar distintos tipos de datos de entrada y respuesta.
 * También permiten agregar configuración adicional para incluir headers como tokens de autenticación.
 *
 * Autor: Sebastián Antonio Almanza
 * Contribuyentes: - 
 */

import { getConfig } from "./auth";
import { API_URL } from "./constants";
import axios from "axios";

/**
 *
 * Realiza una petición HTTP POST al backend.
 * Se utiliza principalmente para enviar datos a la API (crear recursos, hacer login, etc.).
 * Puede incluir configuración de autenticación si `withConfig` es `true`.
 *
 * @template T - Tipo de la respuesta esperada.
 * @template B - Tipo del cuerpo del request.
 * @param {string} path - Ruta relativa al endpoint, añadida a la `API_URL`.
 * @param {B} body - Cuerpo de la solicitud (payload).
 * @param {boolean} [withConfig=true] - Indica si se debe incluir configuración de headers (autenticación, etc.).
 * @return {Promise<T>} Respuesta tipada de la API.
 *
 */
export async function post<T, B>(path: string, body: B, withConfig = true) {
  return axios
    .post(`${API_URL}${path}`, body, withConfig ? getConfig() : undefined)
    .then(({ data }: { data: T }) => data);
}

/**
 *
 * Realiza una petición HTTP GET al backend.
 * Se utiliza para obtener datos desde la API.
 * Puede incluir configuración de autenticación si `withConfig` es `true`.
 *
 * @template T - Tipo de la respuesta esperada.
 * @param {string} path - Ruta relativa al endpoint, añadida a la `API_URL`.
 * @param {boolean} [withConfig=true] - Indica si se debe incluir configuración de headers (autenticación, etc.).
 * @return {Promise<T>} Respuesta tipada de la API.
 *
 */
export async function get<T>(path: string, withConfig = true) {
  return axios
    .get(`${API_URL}${path}`, withConfig ? getConfig() : undefined)
    .then(({ data }: { data: T }) => data);
}
