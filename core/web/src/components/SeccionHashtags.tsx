import React from 'react';

interface SeccionHashtagsProps {
  hashtagsDinamicos: any[];
  hashtagSeleccionado: string;
  isActive: (value: string) => boolean;
  getCircleStyle: (item: any) => string;
  getButtonStyle: (value: string) => string;
  handleItemClick: (itemId: string) => void;
  mostrarDesgloseTasas: boolean;
  mostrarDesgloseNoticias: boolean;
  mostrarConsolidacion: boolean;
}

const SeccionHashtags: React.FC<SeccionHashtagsProps> = ({
  hashtagsDinamicos,
  hashtagSeleccionado,
  isActive,
  getCircleStyle,
  getButtonStyle,
  handleItemClick,
  mostrarDesgloseTasas,
  mostrarDesgloseNoticias,
  mostrarConsolidacion
}) => {
  if (mostrarDesgloseTasas || mostrarDesgloseNoticias || mostrarConsolidacion) {
    return null;
  }

  return (
    <div className="mb-6 p-4 border rounded-xl bg-gradient-to-r from-green-50 to-emerald-50">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-xl font-bold text-navy-900">🚀 Hashtags</h2>
        </div>
      </div>
      <div className="mt-3 space-y-4">
        {hashtagsDinamicos
          .sort((a: any, b: any) => b.correlacion - a.correlacion) // Ordenar por correlación
          .map((hashtag: any) => (
            <div key={hashtag.id} className="flex items-center justify-between">
              <div className="flex items-center">
                <div
                  className={getCircleStyle(hashtag)}
                  style={{ backgroundColor: hashtag.color }}
                  onClick={() => handleItemClick(hashtag.id)}
                ></div>
                <span className={`text-gray-800 ${isActive(hashtag.id) ? 'font-bold' : 'font-medium'}`}>
                  {hashtag.nombre} - Relación con la búsqueda: {hashtag.correlacion}%
                </span>
              </div>
              <button
                className={getButtonStyle(hashtag.id)}
                onClick={() => handleItemClick(hashtag.id)}
              >
                Ver más
              </button>
            </div>
          ))}
      </div>
    </div>
  );
};

export default SeccionHashtags;