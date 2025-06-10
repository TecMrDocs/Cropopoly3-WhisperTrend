import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function Unprotected({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, needsVerification } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (needsVerification) {
      navigate("/holaDeNuevo", { replace: true });
    } else if (isAuthenticated) {
      navigate("/productos", { replace: true });
    }
  }, [isAuthenticated, needsVerification, isLoading, navigate]);

  // Mientras carga o hay 2FA pendiente, no mostrar la página pública
  if (isLoading || needsVerification) return null;

  return <>{children}</>;
}