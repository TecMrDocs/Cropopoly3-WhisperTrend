/**
 * Componente CorrelationInsights
 * 
 * Muestra un resumen transparente del estado del análisis de correlaciones,
 * incluyendo estadísticas generales, interpretación de resultados y 
 * recomendaciones para mejorar la calidad del análisis.
 * 
 * Maneja dos estados: con correlaciones reales vs datos insuficientes.
 * 
 * Extraído del componente CorrelacionVentas para mejorar la organización.
 */

import React from 'react';

interface EstadoGlobal {
  tieneCorrelacionesReales: boolean;
  hashtagsConDatos: number;
  totalHashtags: number;
}

interface CorrelationInsightsProps {
  estadoGlobal: EstadoGlobal;
  promedioGeneral: number;
  totalVentas: number;
}

const CorrelationInsights: React.FC<CorrelationInsightsProps> = ({
  estadoGlobal,
  promedioGeneral,
  totalVentas
}) => {
  return (
    <div className="mt-6 bg-gradient-to-r from-purple-100/80 to-pink-100/80 rounded-xl p-4 border border-purple-200">
      <div className="text-sm text-purple-800">
        <strong>💡 Estado del análisis:</strong>
        <div className="mt-2 space-y-1">
          {estadoGlobal.tieneCorrelacionesReales ? (
            <>
              <div>
                • <strong>{estadoGlobal.hashtagsConDatos}</strong> de {estadoGlobal.totalHashtags} hashtags tienen datos suficientes
              </div>
              <div>
                • Coeficiente de Pearson promedio: <strong>{promedioGeneral.toFixed(3)}</strong>
              </div>
              <div>
                • Análisis basado en <strong>{totalVentas}</strong> registros de ventas reales
              </div>
              <div>
                • ✅ <strong>Correlaciones calculadas con fórmula matemática de Pearson (-1 a 1)</strong>
              </div>
              <div className="mt-2 p-2 bg-white/50 rounded text-xs">
                <strong>📚 Escala de interpretación:</strong><br/>
                • |r| ≥ 0.9: Muy fuerte • |r| ≥ 0.7: Fuerte • |r| ≥ 0.5: Moderada • |r| ≥ 0.3: Débil • |r| &lt; 0.3: Muy débil
              </div>
            </>
          ) : (
            <>
              <div>
                • ❌ <strong>No hay correlaciones reales disponibles</strong>
              </div>
              <div>
                • Registros de ventas: <strong>{totalVentas}</strong> (se necesitan ≥3)
              </div>
              <div>
                • Hashtags disponibles: <strong>{estadoGlobal.totalHashtags}</strong>
              </div>
              <div>
                • 💡 <strong>Agrega más historial de ventas para obtener correlaciones reales</strong>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CorrelationInsights;