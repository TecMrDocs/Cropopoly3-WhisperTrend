/**
 * Componente: ScrollToTop
 * 
 * Este componente se encarga de llevar el scroll de la ventana al inicio
 * cada vez que cambia la ruta del navegador. Se utiliza comúnmente en aplicaciones
 * SPA (Single Page Application) para mejorar la experiencia del usuario
 * al navegar entre páginas o secciones.
 * 
 * Autor: Arturo Barrios Mendoza
 * Contribuyentes: —
 */

import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 *
 * Componente funcional que implementa el comportamiento de scroll automático al tope de la página.
 * Se activa cada vez que la ubicación (ruta) del navegador cambia.
 *
 * @return null No retorna ningún elemento visual, ya que actúa únicamente como efecto secundario.
 *
 */
export default function ScrollToTop() {
  /**
   *
   * Hook de React Router que permite acceder a la ubicación actual del navegador.
   * En este caso, se extrae únicamente el `pathname`, el cual cambiará
   * cuando el usuario navegue hacia otra ruta.
   *
   */
  const { pathname } = useLocation();

  /**
   *
   * Hook de efecto que detecta el cambio en la ruta (pathname) y,
   * en respuesta, fuerza el scroll del navegador hacia la parte superior de la página.
   * Se utiliza `behavior: "instant"` para que el cambio sea inmediato.
   *
   * @param pathname Ruta actual del navegador. Es la dependencia del efecto.
   *
   */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}
