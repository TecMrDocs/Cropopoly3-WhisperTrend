/**
 * Componente de layout principal de la aplicación.
 * Proporciona una estructura base con barra de navegación y un área flexible para contenido.
 * 
 * Autor: Sebastian Antonio  
 */

import Navbar from "../components/Navbar";

/**
 *
 * Componente que define el diseño general de las páginas principales de la aplicación.
 * Incluye una barra de navegación superior (`Navbar`) y una sección adaptable donde se renderizan los hijos (`props.children`).
 * La disposición está basada en `flex` para permitir que el contenido crezca dinámicamente.
 *
 * @param {any} props - Contiene los elementos hijos (`children`) que se mostrarán en el cuerpo del layout.
 * @return {JSX.Element} Contenedor estructurado con navegación y espacio de contenido principal.
 *
 */
export default function MainLayout(props: any) {
  return(
    <div className="min-h-screen min-w-screen w-full h-full bg-white flex flex-col">
      <Navbar />
      <div className="flex-1 w-full py-6">
        {props.children}
      </div>
    </div>
  );
}
