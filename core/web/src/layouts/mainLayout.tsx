/**
 * Layout principal reutilizable para páginas internas de la aplicación.
 * Estructura una vista con barra de navegación superior y una zona principal flexible para contenido.
 * 
 * Autor: Sebastian Antonio  
 * Contribuyentes: 
 */

import Navbar from "../components/Navbar";

/**
 *
 * Componente de layout que define la estructura principal de la aplicación.  
 * Incluye una barra de navegación (`Navbar`) en la parte superior y una zona de contenido distribuida con `flex`.  
 * El diseño garantiza el uso completo del ancho y alto de pantalla para mantener la consistencia visual.
 *
 * @param {any} props - Contiene los elementos hijos (`children`) que se renderizan dentro del layout.
 * @return {JSX.Element} Layout con navegación y área de contenido principal.
 *
 */
export default function MainLayout(props: any) {
  return(
    <div className="min-h-screen min-w-screen w-full h-full bg-white flex flex-col">
      <Navbar />
      <div className="flex flex-1 w-full h-full">
        <div className="flex-1 py-6">
          {props.children}
        </div>
      </div>
    </div>
  );
}
