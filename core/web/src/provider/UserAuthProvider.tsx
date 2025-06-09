import React, { useState, useEffect, useCallback } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import user from '@/utils/api/user';
import { useNavigate, useLocation } from 'react-router-dom';  // ← add useLocation

export default function UserAuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading]               = useState(true);
  const [isAuthenticated, setIsAuthenticated]   = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();  // ← get current path

  // define your public routes here (same as in Protected)
  const publicRoutes = ['/', '/login'];

  useEffect(() => {
    const fullToken = localStorage.getItem("token");
    const tempToken = localStorage.getItem("mfa_token");

    if (fullToken) {
      // validar JWT definitivo
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
      // only redirect if we’re _not_ already on a public route
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

  function signOut() {
    localStorage.removeItem("token");
    localStorage.removeItem("mfa_token");
    setIsAuthenticated(false);
    setNeedsVerification(false);
    navigate("/login");
  }

  // Maneja el inicio de sesión del usuario
  function signIn(email: string, password: string) {
    return user.user.signIn({ email, password })
      .then((result) => {
        const { mfa_token } = result;
        if (!mfa_token) {
          throw new Error("No se recibió token intermedio para 2FA");
        }
        // Guardar token intermedio y forzar paso de verificación
        localStorage.setItem("mfa_token", mfa_token);
        setNeedsVerification(true);
        setIsAuthenticated(false);
        navigate("/holaDeNuevo");
      })
      .catch((error) => {
        throw error;
      });
  }

  const verifyCode = useCallback(async (code: string) => {
    if (!code.trim()) {
      throw new Error("El código de verificación es requerido");
    }
    // Llamamos al endpoint de verificación que devuelve el JWT definitivo
    const result = await user.user.verifyMfa({ code });
    const { token } = result;
    if (!token) {
      throw new Error("No se recibió JWT definitivo");
    }
    // Guardar JWT definitivo y eliminar el token intermedio
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
      signOut,
      signIn,
      verifyCode
    }}>
      {children}
    </AuthContext.Provider>
  );
}