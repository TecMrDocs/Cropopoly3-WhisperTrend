import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function Protected({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading, needsVerification } = useAuth();

  const publicRoutes = ["/", "/login"];

  useEffect(() => {
    if (isLoading) return;
    if (publicRoutes.includes(location.pathname)) return;
    if (needsVerification) {
      navigate("/holaDeNuevo", { replace: true });
    } else if (!isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, needsVerification, isLoading, navigate, location.pathname]);

  // No mostramos nada mientras carga, necesita verificación o no está autenticado
  if (isLoading || needsVerification || !isAuthenticated) return null;

  return <>{children}</>;
}