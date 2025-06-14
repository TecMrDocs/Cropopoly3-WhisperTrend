/**
 * Sección visual que muestra un resumen de ventas.
 *
 * Este componente representa una sección dentro del dashboard que presenta información 
 * relevante sobre las ventas del producto o recurso. Permite visualizar si el ítem está activo,
 * aplicar estilos dinámicos, y manejar clics con distintos modos de visualización.
 *
 * Autor: Lucio Arturo Reyes Castillo  
 */

import React from 'react';

/**
 * Propiedades aceptadas por el componente `SeccionVentas`.
 *
 * @param {any} datosDelSistema - Objeto con la información general del sistema, incluyendo el nombre del recurso.
 * @param {string} hashtagSeleccionado - Hashtag actualmente seleccionado en el dashboard.
 * @param {(value: string) => boolean} isActive - Función que determina si un ítem está activo.
 * @param {(item: any) => string} getCircleStyle - Función que retorna clases CSS para el círculo de estado del ítem.
 * @param {(value: string) => string} getButtonStyle - Función que retorna clases CSS para el botón asociado al ítem.
 * @param {(itemId: string, nuevoModo?: 'original' | 'logaritmo' | 'normalizado') => void} handleItemClick - Función ejecutada al hacer clic sobre el ítem o su botón.
 */
interface SeccionVentasProps {
  datosDelSistema: any;
  hashtagSeleccionado: string;
  isActive: (value: string) => boolean;
  getCircleStyle: (item: any) => string;
  getButtonStyle: (value: string) => string;
  handleItemClick: (itemId: string, nuevoModo?: 'original' | 'logaritmo' | 'normalizado') => void;
}

/**
 * Componente funcional `SeccionVentas`.
 *
 * Renderiza una tarjeta visual dentro del dashboard que muestra la categoría "Ventas".
 * Incluye un ícono interactivo para activar el ítem y un botón para ver más detalles.
 * El nombre del producto se obtiene desde `datosDelSistema.resource_name`.
 *
 * @param {SeccionVentasProps} props - Propiedades que permiten controlar la interacción, estilos y datos mostrados.
 * @return {JSX.Element}
 */
const SeccionVentas: React.FC<SeccionVentasProps> = ({
  datosDelSistema,
  hashtagSeleccionado,
  isActive,
  getCircleStyle,
  getButtonStyle,
  handleItemClick
}) => {
  return (
    <div className="mb-6 p-4 border rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50">
      <h2 className="text-xl font-bold text-navy-900">Ventas</h2>

      <div className="mt-3 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div
              className={`${getCircleStyle({ id: 'Ventas' })} bg-blue-600`}
              onClick={() => handleItemClick('Ventas', 'original')}
            ></div>
            <span className={`text-gray-800 font-medium ${isActive('Ventas') ? 'font-bold' : ''}`}>
              Ventas de {datosDelSistema?.resource_name || 'Producto'}
            </span>
          </div>

          <button
            className={getButtonStyle('Ventas')}
            onClick={() => handleItemClick('Ventas')}
          >
            Ver más
          </button>
        </div>
      </div>
    </div>
  );
};

export default SeccionVentas;
