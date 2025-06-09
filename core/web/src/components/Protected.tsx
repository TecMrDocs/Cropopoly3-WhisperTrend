import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function Protected({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading, needsVerification } = useAuth();

  // Lista de rutas públicas (sin protección)
  const publicRoutes = ["/", "/login"];

  useEffect(() => {
    if (isLoading) return;

    // Si la ruta actual es pública, no forzar redirección
    if (publicRoutes.includes(location.pathname)) return;

    if (needsVerification) {
      navigate("/holaDeNuevo", { replace: true });
    } else if (!isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, needsVerification, isLoading, navigate, location.pathname]);

  // Mientras se carga o el usuario no cumple los requisitos, no se muestra el contenido
  if (isLoading || needsVerification || !isAuthenticated) return null;

  return <>{children}</>;
}