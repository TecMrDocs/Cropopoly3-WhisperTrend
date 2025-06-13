/**
 * Layout para vistas relacionadas con el perfil de usuario.
 * Incluye una barra de navegación superior y una barra lateral de navegación, junto con un área principal para el contenido.
 * 
 * Autor: Sebastian Antonio  
 * Contribuyentes: Andrés Cabrera Alvarado (Front Desgin), Carlos Zamudio (Front Desgin)
 */

import Navbar from "../components/Navbar";
import SideBar from "../components/SideBar";

/**
 *
 * Componente de layout específico para secciones del perfil.  
 * Combina una barra superior (`Navbar`) con una barra lateral (`SideBar`) para navegación dentro del perfil del usuario.  
 * El contenido principal se muestra a la derecha de la barra lateral y es inyectado mediante `props.children`.
 *
 * @param {any} props - Contiene los elementos hijos (`children`) que serán renderizados como contenido del perfil.
 * @return {JSX.Element} Layout estructurado con navegación superior, lateral y contenido principal.
 *
 */
export default function ProfileLayout(props: any) {
  return (
    <div className="min-h-screen min-w-screen w-full h-full bg-white flex flex-col">
      <Navbar />
      <div className="flex flex-1 w-full h-full">
        <SideBar />
        <div className="flex-1 p-6">
          {props.children}
        </div>
      </div>
    </div>
  );
}
