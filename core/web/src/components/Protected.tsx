import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";


export default function Protected({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, needsVerification } = useAuth();

  useEffect(() => {
    if (isLoading) return;          // aún no sabemos nada
    if (needsVerification) {
      navigate("/holaDeNuevo", { replace: true });
    } else if (!isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, needsVerification, isLoading, navigate]);

  if (isLoading)               return <div>Cargando…</div>;
  if (!isAuthenticated)        return null;           // caerá en el useEffect
  if (needsVerification)       return null;           // idem

  return <>{children}</>;
}
