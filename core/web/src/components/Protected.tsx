/**
 * Componente de protección de rutas privadas.
 * Este componente impide el acceso a rutas protegidas si el usuario no está autenticado
 * o necesita completar una verificación adicional (por ejemplo, 2FA).
 * Redirige a la ruta de login o verificación según el caso.
 *
 * Autor: Sebastián Antonio Almanza 
 * Contribuyentes: Iván Alexander Ramos Ramírez
 */

import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

/**
 *
 * Componente de orden superior que protege rutas privadas dentro de la aplicación.
 * Evalúa el estado de autenticación del usuario:
 * - Si está cargando la autenticación, no hace nada.
 * - Si la ruta actual es pública (ej. "/", "/login"), permite el acceso sin restricciones.
 * - Si el usuario necesita verificación, redirige a `/holaDeNuevo`.
 * - Si no está autenticado, redirige a la página de inicio ("/").
 *
 * @param {Object} props - Propiedades del componente.
 * @param {React.ReactNode} props.children - Componentes hijos que se muestran si el usuario tiene acceso.
 * @return {JSX.Element | null} Retorna los hijos si hay acceso, de lo contrario redirige o no muestra nada.
 *
 */
export default function Protected({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading, needsVerification } = useAuth();

  const publicRoutes = ["/", "/login"];

  /**
   *
   * Efecto que controla el acceso a rutas protegidas.
   * Si la ruta no es pública y el usuario no está autenticado o necesita verificación,
   * es redirigido a la ruta correspondiente para completar el acceso.
   *
   * @dependency location.pathname - Detecta cambios en la ruta actual para evaluar el acceso.
   *
   */
  useEffect(() => {
    if (isLoading) return;
    if (publicRoutes.includes(location.pathname)) return;
    if (needsVerification) {
      navigate("/holaDeNuevo", { replace: true });
    } else if (!isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, needsVerification, isLoading, navigate, location.pathname]);

  /**
   *
   * Mientras se verifica el estado del usuario o si no cumple los requisitos de acceso,
   * se evita renderizar el contenido para evitar errores o visualizaciones incorrectas.
   *
   */
  if (isLoading || needsVerification || !isAuthenticated) return null;

  return <>{children}</>;
}
