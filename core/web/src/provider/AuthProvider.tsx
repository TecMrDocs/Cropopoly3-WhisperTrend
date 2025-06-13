/**
 * Proveedor de autenticación para la sección de administración.
 * 
 * Maneja el flujo de login, verificación de dos pasos (2FA), logout y 
 * persistencia de sesión basada en tokens guardados en `localStorage`.
 * 
 * También define el contexto `AuthContext` que expone el estado de autenticación
 * y las funciones necesarias para gestionarlo.
 * 
 * Autor: Sebastian Antonio
 * Contribuyentes: Iván Alexander Ramos Ramírez, Carlos Zamudio Velázquez
 */

import React, { useState, useEffect, useCallback } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import api from '@/utils/api/admin';
import { useNavigate } from 'react-router-dom';


/**
 *
 * Componente que proporciona el contexto de autenticación para la aplicación.
 * Maneja el estado de autenticación, verificación 2FA y navegación.
 *
 * @param {React.ReactNode} children - Elementos hijos que se renderizarán dentro del contexto.
 * @return {JSX.Element} Proveedor de contexto con el estado de autenticación.
 *
 */
export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDefault] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const navigate = useNavigate();

  /**
   *
   * Efecto inicial que verifica el token en localStorage y determina el estado de autenticación.
   * 
   * Si el token existe y la verificación 2FA fue completada anteriormente,
   * se intenta validar con el servidor.
   * Si no se ha verificado 2FA, se redirige al paso de verificación.
   *
   */
  useEffect(() => {
    const token = localStorage.getItem("token");
    const verified = localStorage.getItem("verified"); 

    if (token) {
      if (verified === "true") {
        api.admin.verifyAdmin()
          .then(() => {
            setIsAuthenticated(true);
            setNeedsVerification(false);
            setIsLoading(false);
          })
          .catch(() => {
            localStorage.removeItem("token");
            localStorage.removeItem("verified");
            setIsAuthenticated(false);
            setNeedsVerification(false);
            setIsLoading(false);
          });
      } else {
        setIsAuthenticated(false);
        setNeedsVerification(true);
        setIsLoading(false);
        navigate("/holaDeNuevo");
      }
    } else {
      setIsAuthenticated(false);
      setNeedsVerification(false);
      setIsLoading(false);
    }
  }, [navigate]);

  /**
   *
   * Función para cerrar sesión del usuario.
   * 
   * Elimina el token y el estado de verificación 2FA del localStorage,
   * actualiza los estados locales y redirige al login.
   */
  function signOut() {
    localStorage.removeItem("token");
    localStorage.removeItem("verified");
    setIsAuthenticated(false);
    setNeedsVerification(false);
    navigate("/login");
  }

  /**
   *
   * Función de inicio de sesión.
   * 
   * Intenta autenticar al usuario con su correo y contraseña.
   * Si es exitoso, guarda el token y fuerza la verificación 2FA en el flujo.
   * 
   * @param {string} email - Correo electrónico del usuario.
   * @param {string} password - Contraseña del usuario.
   * 
   * @return {Promise<void>} - Respuesta de la función.
   *
   */
  async function signIn(email: string, password: string) {
    api.admin.loginAdmin(email, password)
      .then(({ token }) => {
        localStorage.setItem("token", token);
        localStorage.setItem("verified", "false");
        setNeedsVerification(true);
        setIsAuthenticated(false);
        navigate("/holaDeNuevo");
      })
      .catch(err => {
        console.error("Error en loginAdmin:", err);
      });
  }

  /**
   *
   * Función de verificación del código 2FA.
   * 
   * Actualmente acepta cualquier código no vacío.
   * Aquí podría ir una llamada real al backend con el código para su validación.
   *
   * @param {string} code - Código de verificación ingresado por el usuario.
   * 
   * @return {Promise<void>} - Respuesta de la función.
   *
   */
  const verifyCode = useCallback(async (code: string) => {
    if (!code.trim()) throw new Error("Código vacío");

    // Simulación de validación exitosa
    localStorage.setItem("verified", "true");
    setIsAuthenticated(true);
    setNeedsVerification(false);
    navigate("/productos");
  }, [navigate]);

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
