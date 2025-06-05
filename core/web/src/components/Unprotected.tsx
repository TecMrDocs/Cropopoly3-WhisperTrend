import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";


export default function Unprotected({ children }: { children: React.ReactNode}){
  const navigate = useNavigate();
  const { isAuthenticated, needsVerification } = useAuth();

  useEffect(() => {
    if(isAuthenticated) navigate("/dashboard");

    // Si no está autenticado y necesita verificación, redirigimos a la pantalla de 2FA
    if(!isAuthenticated && needsVerification){ 
      navigate("/holaDeNuevo");
    }
  }, [isAuthenticated, needsVerification,navigate]);

  return <>{children}</>
}