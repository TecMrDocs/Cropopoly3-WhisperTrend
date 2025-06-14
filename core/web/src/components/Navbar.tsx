/**
 * Componente Navbar de la aplicación WhisperTrend.
 * Este componente renderiza la barra de navegación superior que contiene el logotipo
 * y el nombre de la aplicación. Se muestra en todas las páginas principales del sitio.
 *
 * Autor: Sebastián Antonio Almanza
 */

import logo from '../assets/logo_whispertrend.png';

/**
 *
 * Componente funcional que representa la barra de navegación.
 * Utiliza clases de Tailwind CSS para definir el estilo, incluyendo un gradiente de fondo
 * y alineación de los elementos. Contiene una imagen con el logotipo y un título con el
 * nombre de la aplicación.
 *
 * @return {JSX.Element} Elemento JSX que representa la barra de navegación.
 *
 */
export default function Navbar() {
  return(
    <div className="w-full h-20 flex flex-row justify-between items-center px-5 bg-gradient-to-r from-blue-600 to-emerald-400 text-white">
      <div className="flex items-center gap-2.5">
        <img 
          src={logo} 
          alt="WhisperTrend Logo" 
          className="h-[50px] w-auto object-contain"
        />
        <h4 className="m-0 text-2xl font-bold">WhisperTrend</h4>
      </div>
    </div>
  );
}
