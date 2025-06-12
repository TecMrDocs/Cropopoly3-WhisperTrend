/**
 * Contexto de autenticación para la aplicación.
 * Define el estado y funciones clave relacionadas con el flujo de autenticación, incluyendo
 * inicio de sesión, verificación 2FA, cierre de sesión y validación de datos de empresa.
 * Este contexto permite compartir estos datos y funciones globalmente a través de la aplicación.
 *
 * Autor: Sebastián Antonio Almanza
 * Contribuyentes: Iván Alexander (Lógica adicional)
 */

import { createContext } from 'react';

/**
 *
 * Interfaz que define la estructura del contexto de autenticación.
 * Proporciona el estado del usuario y funciones de control como `signIn`, `signOut` y `verifyCode`.
 *
 * @property {boolean} isLoading - Indica si la autenticación aún está en proceso.
 * @property {boolean} isAuthenticated - Verdadero sólo si el usuario ha pasado correctamente el 2FA.
 * @property {boolean} needsVerification - Verdadero si el usuario inició sesión pero aún no ha pasado el 2FA.
 * @property {boolean} isDefault - Verdadero si el usuario aún no ha editado los datos por defecto de la empresa.
 * @property {Function} signOut - Función para cerrar la sesión del usuario.
 * @property {Function} signIn - Función para iniciar sesión con email y contraseña.
 * @property {Function} verifyCode - Función para validar el código de verificación (2FA).
 *
 */
export type AuthContextType = {
  isLoading: boolean;
  isAuthenticated: boolean;
  needsVerification: boolean;
  isDefault: boolean;
  signOut: () => void;
  signIn: (email: string, password: string) => Promise<void>; 
  verifyCode: (code: string) => Promise<void>;
};

/**
 *
 * Contexto global de autenticación.
 * Define valores iniciales por defecto para el estado de autenticación y funciones.
 * Este contexto será utilizado junto con un proveedor (`AuthProvider`) para administrar
 * el acceso y la identidad del usuario a lo largo de la aplicación.
 *
 */
export const AuthContext = createContext<AuthContextType>({
  isLoading: true,
  isAuthenticated: false,
  needsVerification: false,
  isDefault: false,
  signOut: () => {},
  signIn: () => Promise.resolve(),
  verifyCode: async () => {},
});
