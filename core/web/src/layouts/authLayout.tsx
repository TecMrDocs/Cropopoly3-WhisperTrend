/**
 * Componente de layout para páginas que requieren autenticación.
 * Incluye una barra de navegación persistente y un contenedor para renderizar contenido hijo.
 * 
 * Autor: Sebastian Antonio  
 * Contribuyentes: 
 */

import Navbar from "@/components/Navbar";

/**
 *
 * Componente que define la estructura de diseño general para las vistas autenticadas.
 * Renderiza un `Navbar` en la parte superior y debajo, el contenido proporcionado mediante `props.children`.
 * La estructura usa `flex` para disposición vertical y se asegura de ocupar el 100% del alto y ancho de la pantalla.
 *
 * @param {any} props - Contiene los elementos hijos (`children`) que se renderizarán dentro del layout.
 * @return {JSX.Element} Estructura visual con la barra de navegación y el contenido principal.
 *
 */
export default function AuthLayout(props: any) {
  return(
    <div className="min-h-screen min-w-screen w-full h-full bg-white flex flex-col">
      <Navbar />
      <div className="min-h-screen w-full">
        {props.children}
      </div>
    </div>
  )
}
