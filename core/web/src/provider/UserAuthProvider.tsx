/**
 * Proveedor de autenticación para usuarios generales de la plataforma.
 * 
 * Este componente gestiona el flujo de autenticación incluyendo:
 * - Verificación de tokens persistidos (JWT o token de 2FA)
 * - Inicio de sesión
 * - Verificación de código 2FA (Multi-Factor Authentication)
 * - Cierre de sesión
 * 
 * Define y expone el contexto `AuthContext` con los estados y funciones necesarias.
 * 
 * Autor: Sebastian Antonio
 * Contribuyentes: Iván Alexander Ramos Ramírez, Mariana Balderrabano Aguilar
 */

import React, { useState, useEffect, useCallback } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import user from '@/utils/api/user';
import { useNavigate, useLocation } from 'react-router-dom';


/**
 *
 * Componente que proporciona el contexto de autenticación para usuarios generales.
 * Maneja el estado de autenticación, verificación 2FA y navegación.
 *
 * @param {React.ReactNode} children - Elementos hijos que se renderizarán dentro del contexto.
 * @return {JSX.Element} Proveedor de contexto con el estado de autenticación.
 *
 */
export default function UserAuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [isDefault, setIsDefault] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();
  const publicRoutes = ['/', '/login'];

  /**
   *
   * Efecto que se ejecuta al montar el componente.
   * Determina si el usuario tiene un token válido o necesita pasar por 2FA.
   * 
   * - Si hay JWT (`token`), intenta validarlo con el backend.
   * - Si hay token temporal (`mfa_token`), redirige a la pantalla de verificación.
   * - Si no hay token, marca al usuario como no autenticado.
   *
   */
  useEffect(() => {
    const fullToken = localStorage.getItem("token");
    const tempToken = localStorage.getItem("mfa_token");

    if (fullToken) {
      user.user.check()
        .then(() => setIsAuthenticated(true))
        .catch(err => {
          if (err?.response?.status === 404) {
            console.warn("check endpoint no existe, asumiendo token válido");
            setIsAuthenticated(true);
          } else {
            setIsAuthenticated(false);
          }
        })
        .finally(() => {
          setNeedsVerification(false);
          setIsLoading(false);
        });
    }
    else if (tempToken) {
      setIsAuthenticated(false);
      setNeedsVerification(true);
      setIsLoading(false);

      if (!publicRoutes.includes(location.pathname)) {
        navigate("/holaDeNuevo", { replace: true });
      }
    }
    else {
      setIsAuthenticated(false);
      setNeedsVerification(false);
      setIsLoading(false);
    }
  }, [navigate, location.pathname]);

  /**
   *
   * Cierra la sesión del usuario.
   * Elimina los tokens del almacenamiento local y redirige a la pantalla de login.
   *
   */
  function signOut() {
    localStorage.removeItem("token");
    localStorage.removeItem("mfa_token");
    setIsAuthenticated(false);
    setNeedsVerification(false);
    navigate("/login");
  }

  /**
   *
   * Función para iniciar sesión.
   * Envía credenciales al backend y guarda el token temporal para el paso de verificación.
   * 
   * @param {string} email - Correo electrónico del usuario.
   * @param {string} password - Contraseña del usuario.
   * 
   * @return {Promise<void>} - Respuesta de la función.
   *
   */
  function signIn(email: string, password: string) {
    return user.user.signIn({ email, password })
      .then((result) => {
        const { mfa_token } = result;
        if (!mfa_token) {
          throw new Error("No se recibió token intermedio para 2FA");
        }

        localStorage.setItem("mfa_token", mfa_token);
        setNeedsVerification(true);
        setIsAuthenticated(false);
        navigate("/holaDeNuevo");
      })
      .catch((error) => {
        throw error;
      });
  }

  /**
   *
   * Verifica el código 2FA ingresado por el usuario.
   * Si es válido, obtiene el JWT definitivo y actualiza el estado de sesión.
   * 
   * @param {string} code - Código de verificación ingresado por el usuario.
   * 
   * @return {Promise<void>} - Respuesta de la función.
   *
   */
  const verifyCode = useCallback(async (code: string) => {
    if (!code.trim()) {
      throw new Error("El código de verificación es requerido");
    }

    const result = await user.user.verifyMfa({ code });
    const { token } = result;

    if (!token) {
      throw new Error("No se recibió JWT definitivo");
    }

    localStorage.setItem("token", token);
    localStorage.removeItem("mfa_token");
    setIsAuthenticated(true);
    setNeedsVerification(false);
  }, []);

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      isLoading,
      needsVerification,
      isDefault,
      signOut,
      signIn,
      verifyCode
    }}>
      {children}
    </AuthContext.Provider>
  );
}
