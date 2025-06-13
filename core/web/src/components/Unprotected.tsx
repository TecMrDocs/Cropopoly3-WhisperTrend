/**
 * Componente de protección de rutas públicas.
 * Este componente impide que usuarios autenticados o con verificación pendiente
 * accedan a rutas públicas (como login o registro). Si el usuario ya está autenticado, 
 * es redirigido automáticamente a la sección correspondiente.
 *
 * Autor: Sebastián Antonio Almanza 
 * Contribuyentes: Iván Alexander Ramos Ramírez
 */

import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

/**
 *
 * Componente de orden superior que protege rutas no autenticadas.
 * Evalúa el estado de autenticación y verificación del usuario:
 * - Si está autenticado, redirige a la ruta principal (`/productos`).
 * - Si necesita verificación, redirige a la ruta de reautenticación (`/holaDeNuevo`).
 * - Mientras la información de autenticación se está cargando o requiere verificación, 
 *   evita mostrar el contenido público.
 *
 * @param {Object} props - Propiedades del componente.
 * @param {React.ReactNode} props.children - Componentes hijos que se renderizarán solo si el usuario no está autenticado.
 * @return {JSX.Element | null} Retorna los hijos si la ruta es accesible, de lo contrario redirige o muestra nada.
 *
 */
export default function Unprotected({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, needsVerification } = useAuth();

  /**
   *
   * Efecto que evalúa el estado de autenticación cada vez que cambia.
   * - Si se está cargando la autenticación, no hace nada.
   * - Si se requiere verificación (ej. segundo factor), redirige al flujo correspondiente.
   * - Si el usuario ya está autenticado, lo redirige directamente a `/productos`.
   *
   */
  useEffect(() => {
    if (isLoading) return;
    if (needsVerification) {
      navigate("/holaDeNuevo", { replace: true });
    } else if (isAuthenticated) {
      navigate("/productos", { replace: true });
    }
  }, [isAuthenticated, needsVerification, isLoading, navigate]);

  /**
   *
   * Si el usuario aún no termina el proceso de autenticación o requiere verificación,
   * no se muestra el contenido protegido. Esto evita que la UI parpadee mientras decide.
   *
   */
  if (isLoading || needsVerification) return null;

  return <>{children}</>;
}
