/**
 * SeccionNoticias Component - Sección de Visualización y Gestión de Noticias
 * 
 * Este componente especializado renderiza la sección de noticias dinámicas dentro
 * del sistema de control del dashboard. Proporciona una interfaz interactiva
 * para visualizar y seleccionar noticias basadas en su correlación con tendencias
 * de mercado. Incluye indicadores visuales de color, métricas de correlación
 * y controles de navegación que facilitan el análisis del impacto de noticias
 * en las redes sociales y su relación con las métricas de engagement.
 * 
 * Autor: Lucio Arturo Reyes Castillo
 */

import React from 'react';

interface SeccionNoticiasProps {
  noticiasDinamicas: any[];
  hashtagSeleccionado: string;
  isActive: (value: string) => boolean;
  getCircleStyle: (item: any) => string;
  getButtonStyle: (value: string) => string;
  handleItemClick: (itemId: string, nuevoModo?: 'original' | 'logaritmo' | 'normalizado') => void;
  mostrarDesgloseTasas: boolean;
  mostrarDesgloseNoticias: boolean;
  mostrarConsolidacion: boolean;
}

const SeccionNoticias: React.FC<SeccionNoticiasProps> = ({
  noticiasDinamicas,
  hashtagSeleccionado,
  isActive,
  getCircleStyle,
  getButtonStyle,
  handleItemClick,
  mostrarDesgloseTasas,
  mostrarDesgloseNoticias,
  mostrarConsolidacion
}) => {
  // Si algún desglose está activo, no mostrar esta sección
  if (mostrarDesgloseTasas || mostrarDesgloseNoticias || mostrarConsolidacion) {
    return null;
  }

  return (
    <div className="mb-6 p-4 border rounded-xl bg-gradient-to-r from-purple-50 to-pink-50">
      <h2 className="text-xl font-bold text-navy-900">📰 Noticias</h2>
      <div className="mt-3 space-y-4">
        {noticiasDinamicas.map((noticia: any) => (
          <div key={noticia.id} className="flex items-center justify-between">
            <div className="flex items-center">
              <div
                className={`${getCircleStyle({ id: noticia.id })} bg-purple-500`}
                style={{ backgroundColor: noticia.color }}
                onClick={() => handleItemClick(noticia.id, 'original')}
              ></div>
              <div className="flex-1">
                <span className={`text-gray-800 ${isActive(noticia.id) ? 'font-bold' : 'font-medium'} block`}>
                  {noticia.titulo}
                </span>
                <span className="text-xs text-gray-500">
                  Correlación: {noticia.correlacion}%
                </span>
              </div>
            </div>
            <button
              className={getButtonStyle(noticia.id)}
              onClick={() => handleItemClick(noticia.id)}
            >
              Ver más
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SeccionNoticias;