/**
 * Módulo para la gestión de autenticación de administradores.
 * Proporciona interfaces para credenciales y administrador, junto con
 * funciones para login y verificación del administrador.
 * 
 * Autor: Sebastián Antonio Almanza
 * Contribuyentes:-
 */

import { get, post } from "../methods";

export interface Credentials {
  token: string;
}


export interface Admin {
  email: string;
  password: string;
}

export default {
  admin: {
    /**
     *
     * Realiza el login del administrador enviando email y password.
     *
     * @param {string} email - Correo electrónico del administrador.
     * @param {string} password - Contraseña del administrador.
     * @return {Promise<Credentials>} Promesa que resuelve las credenciales con token.
     *
     */
    loginAdmin: (
      email: string, 
      password: string,
    ): Promise<Credentials> => {
      return post('/auth/admin/login', {email, password}, false);
    },

    /**
     *
     * Verifica el estado o validez del administrador autenticado.
     *
     * @return {Promise<Admin>} Promesa que resuelve con los datos del administrador.
     *
     */
    verifyAdmin: (): Promise<Admin> => {
      return get('/auth/admin/verify', false);
    }
  }
}
