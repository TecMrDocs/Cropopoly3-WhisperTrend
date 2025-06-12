/**
 * Componente Consolidacion
 * 
 * Este componente presenta una lista de elementos filtrables por categorías como Ventas, Noticias y Hashtags.
 * Permite seleccionar una categoría para filtrar los elementos mostrados, y cada elemento tiene una opción
 * para visualizar detalles adicionales. Ideal para la visualización de reportes o datos categorizados.
 * 
 * Autor: Lucio Arturo Reyes Castillo
 */

import React from 'react';

/**
 * @typedef ConsolidacionProps
 * @property {any[]} data - Lista de datos a consolidar.
 * @property {string} filtro - Categoría activa para el filtrado.
 * @property {React.Dispatch<React.SetStateAction<string>>} setFiltro - Función para actualizar la categoría seleccionada.
 * @property {(id: string) => void} onDetalleClick - Función a ejecutar al hacer clic en "Detalle" de un ítem.
 */


type ConsolidacionProps = {
  data: any[]; 
  filtro: string;
  setFiltro: React.Dispatch<React.SetStateAction<string>>;
  onDetalleClick: (id: string) => void;
};

/**
 * Componente funcional que renderiza la vista de consolidación de datos.
 * 
 * @param {ConsolidacionProps} props - Propiedades que recibe el componente.
 * @return {JSX.Element} Retorna el componente de React que muestra los datos consolidados filtrables.
 */
const Consolidacion: React.FC<ConsolidacionProps> = ({ data, filtro, setFiltro, onDetalleClick }) => {

  /**
   * Filtra los datos recibidos por la categoría seleccionada.
   * Si no hay filtro activo, retorna todos los datos.
   * 
   * @return {any[]} Lista de datos filtrados según la categoría seleccionada.
   */

  const filtrarDatos = () => {
    if (!filtro) return data;
    return data.filter(item => item.categoria === filtro);
  };

  return (
    /**
     * Estructura visual del componente.
     * Contiene:
     * - Título del componente
     * - Botones para cambiar la categoría de filtro
     * - Lista de datos filtrados con opción para ver más detalles
     */
    <div className="p-6 bg-white rounded-3xl border border-gray-200 w-full">
      <h2 className="text-2xl font-bold mb-4 text-navy-900">Consolidación de Datos</h2>
      
      {/**
       * Botones para aplicar filtros por categoría.
       * Al hacer clic, se actualiza el estado `filtro`.
       */}
      <div className="mb-6 flex space-x-4">
        <button
          className={`px-4 py-2 rounded-full font-semibold ${
            filtro === '' ? 'bg-blue-700 text-white' : 'bg-blue-200 text-blue-700 hover:bg-blue-300'
          }`}
          onClick={() => setFiltro('')}
        >
          Todos
        </button>
        <button
          className={`px-4 py-2 rounded-full font-semibold ${
            filtro === 'Ventas' ? 'bg-blue-700 text-white' : 'bg-blue-200 text-blue-700 hover:bg-blue-300'
          }`}
          onClick={() => setFiltro('Ventas')}
        >
          Ventas
        </button>
        <button
          className={`px-4 py-2 rounded-full font-semibold ${
            filtro === 'Noticias' ? 'bg-blue-700 text-white' : 'bg-blue-200 text-blue-700 hover:bg-blue-300'
          }`}
          onClick={() => setFiltro('Noticias')}
        >
          Noticias
        </button>
        <button
          className={`px-4 py-2 rounded-full font-semibold ${
            filtro === 'Hashtags' ? 'bg-blue-700 text-white' : 'bg-blue-200 text-blue-700 hover:bg-blue-300'
          }`}
          onClick={() => setFiltro('Hashtags')}
        >
          Hashtags
        </button>
      </div>

      {/**
       * Lista de datos filtrados mostrados como ítems que se da click.
       * Cada ítem contiene título, descripción y un botón de detalle.
       * Si no hay datos para mostrar, aparece un mensaje indicándolo.
       */}

      <ul className="space-y-4 max-h-96 overflow-auto">
        {filtrarDatos().map(item => (
          <li
            key={item.id}
            className="flex justify-between items-center p-4 border border-gray-300 rounded-lg hover:bg-blue-50 cursor-pointer"
            onClick={() => onDetalleClick(item.id)}
          >
            <div>
              <h3 className="font-semibold text-navy-900">{item.titulo}</h3>
              <p className="text-gray-600">{item.descripcion}</p>
            </div>
            <button className="text-blue-600 hover:underline">Detalle</button>
          </li>
        ))}
        {filtrarDatos().length === 0 && (
          <li className="text-gray-500 text-center">No hay datos para mostrar</li>
        )}
      </ul>
    </div>
  );
};

export default Consolidacion;
