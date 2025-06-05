import React, { useState, useEffect, useCallback } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import user from '@/utils/api/user';
import { useNavigate } from 'react-router-dom';



export default function UserAuthProvider({ children }: {children: React.ReactNode}){
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const navigate = useNavigate();

 // Al montar, chequeamos si ya hay token y si está verificado en localStorage
  useEffect(() => {
    const token = localStorage.getItem("token");
    const verified = localStorage.getItem("verified"); // "true" / "false"
    if (token) {
      if (verified === "true") {
        // Si ya habíamos pasado 2FA en sesión anterior, validamos el token
        user.user.check()
          .then(() => {
            setIsAuthenticated(true);
            setNeedsVerification(false);
            setIsLoading(false);
          })
          .catch(() => {
            // token inválido o expirado
            localStorage.removeItem("token");
            localStorage.removeItem("verified");
            setIsAuthenticated(false);
            setNeedsVerification(false);
            setIsLoading(false);
          });
      } else {
        // Hay token pero no verificado → vamos a la pantalla de 2FA
        setIsAuthenticated(false);
        setNeedsVerification(true);
        setIsLoading(false);
        navigate("/holaDeNuevo");
      }
    } else {
      // No hay token: usuario no está logueado
      setIsAuthenticated(false);
      setNeedsVerification(false);
      setIsLoading(false);
    }
  }, [navigate]); 

  function signOut() {
    localStorage.removeItem("token");
    localStorage.removeItem("verified");
    setIsAuthenticated(false);
    setNeedsVerification(false);
    navigate("/login");
  }

  // Maneja el inicio de sesión del usuario
  function signIn(email: string, password: string) {
    return user.user.signIn({ email, password })
      .then((result) => {
        
        if (!result || !result.token) {
          throw new Error("No se recibió token de autenticación");
        }
        
        const { token } = result;
        localStorage.setItem("token", token);
        localStorage.setItem("verified", "false");
        setNeedsVerification(true);
        setIsAuthenticated(false);
        navigate("/holaDeNuevo");
      })
      .catch((error) => {
        throw error;
      });
  }

    // verifyCode: ACEPTA cualquier código de verificación que no esté vacío
    const verifyCode = useCallback(async (code: string) => {
      if (!code.trim()) {
        throw new Error("Código vacío");
      }
      // Aquí, en lugar de llamar a la API real, simplemente aceptamos cualquier valor:
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
      signOut,
      signIn,
      verifyCode
    }}>
      {children}
    </AuthContext.Provider>
  );
}