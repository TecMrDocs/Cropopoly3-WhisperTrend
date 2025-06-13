/**
 * Layout para la página principal de bienvenida o presentación (landing page).
 * Aplica un fondo animado con ondas y estructura el contenido en una cabecera y una sección principal.
 * 
 * Autor: Sebastian Antonio  
 * Contribuyentes: Andrés Cabrera Alvarado (Front Desgin)
 */

import './landing.css';

/**
 *
 * Componente de layout diseñado para la landing page de la aplicación.  
 * Incorpora efectos visuales de fondo con ondas animadas utilizando clases definidas en `landing.css`.  
 * Estructura el contenido en un encabezado con título y una sección principal donde se renderizan los hijos (`children`).
 *
 * @param {any} props - Contiene los elementos hijos (`children`) que se colocan dentro del `main`.
 * @return {JSX.Element} Layout visual con fondo animado y estructura básica de landing page.
 *
 */
export default function LandingLayout(props: any) {
  const { children } = props;

  return (
    <div className="min-h-screen w-screen m-0 p-0 relative flex flex-col overflow-hidden">
      <div className='absolute inset-0 z-0'>
        <div className="wave -one" />
        <div className="wave -two" />
        <div className="wave -three" />
      </div>

      <div className="min-h-screen w-full relative z-10 p-5 flex flex-col">
        <header className="mb-5 pb-5">
          <h1 className="text-white text-3xl font-bold">Whisper Trend</h1>
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
