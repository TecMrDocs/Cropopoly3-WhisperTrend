import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";


export default function Protected({ children }: { children: React.ReactNode}){
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if(!isLoading && !isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Mostrar loading mientras se verifica la autenticación
  if(isLoading) {
    return <div>Cargando...</div>;
  }

  // Solo renderizar children si está autenticado
  if(!isAuthenticated) {
    return null;
  }

  return <>{children}</>
}
