import React from 'react';

interface SeccionVentasProps {
  datosDelSistema: any;
  hashtagSeleccionado: string;
  isActive: (value: string) => boolean;
  getCircleStyle: (item: any) => string;
  getButtonStyle: (value: string) => string;
  handleItemClick: (itemId: string, nuevoModo?: 'original' | 'logaritmo' | 'normalizado') => void;
}

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