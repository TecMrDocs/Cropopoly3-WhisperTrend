import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function Unprotected({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // Si está autenticado, redirige a dashboard
    if(isAuthenticated) {
      navigate("/prductos");
    }
    // Sino, permite el acceso a rutas públicas, aun si necesita verificación
  }, [isAuthenticated,navigate]);

  return <>{children}</>;
}