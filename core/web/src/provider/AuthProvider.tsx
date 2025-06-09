import React, { useState, useEffect, useCallback } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import api from '@/utils/api/admin';
import { useNavigate } from 'react-router-dom';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 1) Estado para 2FA
  const [needsVerification, setNeedsVerification] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const verified = localStorage.getItem("verified"); // "true" / "false"

    if (token) {
      if (verified === "true") {
        // Si ya pasó 2FA en sesión anterior, validamos token
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
        // Token válido pero sin 2FA
        setIsAuthenticated(false);
        setNeedsVerification(true);
        setIsLoading(false);
        navigate("/holaDeNuevo");
      }
    } else {
      // No hay token
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

  async function signIn(email: string, password: string) {
    api.admin.loginAdmin(email, password)
      .then(({ token }) => {
        localStorage.setItem("token", token);
        // Tras login, obligamos a pasar 2FA
        localStorage.setItem("verified", "false");
        setNeedsVerification(true);
        setIsAuthenticated(false);
        navigate("/holaDeNuevo");
      })
      .catch(err => {
        console.error("Error en loginAdmin:", err);
      });
  }

  // 2) verifyCode: acepta cualquier código no vacío (o aquí llamas a tu endpoint real)
  const verifyCode = useCallback(async (code: string) => {
    if (!code.trim()) throw new Error("Código vacío");
    // Si quisieras verificarlo con backend, aquí iría la llamada, p. ej.:
    // await api.admin.verify2FA({ token: localStorage.getItem("token"), code });

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
