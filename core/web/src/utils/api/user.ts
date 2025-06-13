/**
 * Módulo para la gestión de usuarios en la API.
 * Proporciona interfaces para el usuario y credenciales, y funciones para
 * verificar sesión, registrar usuarios, verificar MFA y realizar login.
 *
 * Autor: Sebastián Antonio Almanza
 * Contribuyentes: Iván Alexander (Lógica para el 2FA)
 */

import { get, post } from "../methods";
import axios from "axios";
import { API_URL } from "../constants";

export interface User {
  name: string;
  last_name: string;
  email: string;
  phone: string;
  position: string;
  password: string;
  plan: string;
  business_name: string;
  industry: string;
  company_size: string;
  scope: string;
  locations: string;
  num_branches: string;
}

export interface UserCredentials {
  email: string;
  password: string;
}

export default {
  user: {
    /**
     *
     * Verifica si el usuario está autenticado mediante un request a `auth/check`.
     *
     * @return {Promise<void>} Promesa que se resuelve si la sesión es válida.
     *
     */
    check: (): Promise<void> => {
      return get("auth/check", true);
    },

    /**
     *
     * Registra un nuevo usuario enviando sus datos a `auth/register`.
     *
     * @param {User} user - Datos completos del usuario a registrar.
     * @return {Promise<void>} Promesa que se resuelve al completar el registro.
     *
     */
    register: (
      user: User
    ): Promise<void> => {
      return post("auth/register", user, false);
    },

    /**
     *
     * Verifica el código MFA enviado por el usuario para completar la autenticación de dos factores.
     * Envía la petición con un token temporal guardado en localStorage en el header `mfa-token`.
     *
     * @param {{ code: string }} payload - Objeto que contiene el código MFA a verificar.
     * @return {Promise<{ token: string }>} Promesa con el token definitivo si la verificación es exitosa.
     *
     */
    verifyMfa: (payload: { code: string }): Promise<{ token: string }> => {
      const tempToken = localStorage.getItem("mfa_token") || "";
      return axios
        .post(
          `${API_URL}auth/mfa`,
          payload,
          {
            headers: { "mfa-token": tempToken }
          }
        )
        .then(({ data }) => data);
    },

    /**
     *
     * Realiza el login del usuario con email y password.
     * Devuelve un token MFA temporal que debe ser verificado posteriormente.
     *
     * @param {UserCredentials} user_credentials - Credenciales del usuario (email y password).
     * @return {Promise<{ mfa_token: string }>} Promesa con el token MFA temporal.
     *
     */
    signIn: (
      user_credentials: UserCredentials
    ): Promise<{ mfa_token: string }> => {
      return post("auth/signin", user_credentials, false);
    }
  }
}
