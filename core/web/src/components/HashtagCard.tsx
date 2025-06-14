/**
 * Componente HashtagCard
 * 
 * Muestra la información de correlación de un hashtag individual con las ventas.
 * Incluye el coeficiente de Pearson, interpretación visual, barra de progreso,
 * y badges de confianza del análisis.
 * 
 * Autor: Lucio Arturo Reyes Castillo
 */

import React from 'react';
import { CorrelacionResult } from './correlationCalculator';

/**
 * Props del componente HashtagCard
 */
interface HashtagCardProps {
  hashtag: string;           // Nombre del hashtag con formato "#ejemplo"
  resultado: CorrelacionResult;  // Datos completos de correlación y confianza
  color: string;             // Color hex para el indicador visual y tema
  puntuaciones: {            // Métricas de rendimiento por plataforma social
    instagram: number;
    reddit: number;
    twitter: number;
  };
}

/**
 * Componente de tarjeta individual para hashtag con análisis de correlación
 */
const HashtagCard: React.FC<HashtagCardProps> = ({
  hashtag,
  resultado,
  color,
  puntuaciones
}) => {
  return (
    // Contenedor principal con efectos glassmorphism y hover
    <div className={`bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300 ${!resultado.esReal ? 'opacity-75' : ''}`}>
      

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div 
            className="w-4 h-4 rounded-full mr-3"
            style={{ backgroundColor: color }}
          ></div>
          <span className="font-bold text-gray-800">{hashtag}</span>
        </div>
        <div className="text-right">
          {resultado.esReal ? (
            // Mostrar coeficiente de Pearson con formato académico
            <>
              <div className="text-2xl font-bold" style={{ color: resultado.interpretacion?.color }}>
                {resultado.correlacion.toFixed(3)}
              </div>
              <div className="text-xs" style={{ color: resultado.interpretacion?.color }}>
                r de Pearson
              </div>
            </>
          ) : (
            // Estado sin datos válidos
            <>
              <div className="text-lg font-bold text-gray-400">N/A</div>
              <div className="text-xs text-red-500">sin datos</div>
            </>
          )}
        </div>
      </div>
      

      {resultado.esReal && resultado.interpretacion ? (
        // CASO A: Datos válidos - Mostrar análisis completo
        <>
          {/* Panel de interpretación con color temático */}
          <div className="mb-3 p-2 rounded-lg" style={{ backgroundColor: `${resultado.interpretacion.color}20` }}>
            <div className="text-sm font-medium" style={{ color: resultado.interpretacion.color }}>
              {resultado.interpretacion.emoji} {resultado.interpretacion.categoria}
            </div>
            <div className="text-xs text-gray-600 mt-1">
              {resultado.interpretacion.descripcion}
            </div>
          </div>
          

          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-gray-600">Fuerza de correlación</span>
              <span className="text-sm font-medium" style={{ color: resultado.interpretacion.color }}>
                {Math.abs(resultado.correlacion).toFixed(3)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="h-2 rounded-full transition-all duration-1000 ease-out"
                style={{ 
                  backgroundColor: resultado.interpretacion.color,
                  width: `${Math.abs(resultado.correlacion) * 100}%` 
                }}
              ></div>
            </div>
          </div>
          

          <div className="flex justify-between items-center">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              resultado.confianza === 'alta' ? 'bg-green-100 text-green-700' :
              resultado.confianza === 'media' ? 'bg-yellow-100 text-yellow-700' :
              'bg-orange-100 text-orange-700'
            }`}>
              {resultado.confianza === 'alta' ? '🎯 ' : resultado.confianza === 'media' ? '⚡ ' : '📊 '}
              {resultado.datosUsados.ventasDisponibles} meses
            </span>
            <span className="text-xs" style={{ color: resultado.interpretacion.color }}>
              {resultado.correlacion >= 0 ? '📈 Positiva' : '📉 Negativa'}
            </span>
          </div>
        </>
      ) : (
        // CASO B: Datos insuficientes - Mostrar mensaje explicativo
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-sm text-gray-600 mb-2">
            {resultado.mensaje}
          </div>
          <div className="text-xs text-gray-400">
            Ventas: {resultado.datosUsados.ventasDisponibles} • 
            Métricas: {resultado.datosUsados.metricsDisponibles ? '✅' : '❌'}
          </div>
        </div>
      )}
    </div>
  );
};

export default HashtagCard;