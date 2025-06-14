/**
 * Componente CorrelationInsights
 * 
 * Este componente renderiza un panel informativo que muestra el estado transparente 
 * del análisis de correlaciones entre hashtags y ventas. Proporciona estadísticas 
 * clave, interpretación de resultados y recomendaciones para mejorar la calidad 
 * del análisis estadístico.
 * 
 * El componente maneja dos estados principales:
 * 1. Con correlaciones reales: Muestra estadísticas, promedio de Pearson y escala de interpretación
 * 2. Datos insuficientes: Muestra advertencias y recomendaciones para obtener más datos
 * 
 * Funcionalidades principales:
 * - Visualización de estadísticas globales del análisis
 * - Interpretación académica de coeficientes de correlación de Pearson
 * - Recomendaciones contextuales para mejorar la calidad del análisis
 * - Diseño responsivo con gradientes y estilos consistentes
 * 
 * Autor: Lucio Arturo Reyes Castillo
 * Extraído del componente CorrelacionVentas para mejorar la modularidad y reutilización
 */

import React from 'react';

/**
 * Interfaz que define el estado global del análisis de correlaciones
 * Contiene métricas clave sobre la disponibilidad y calidad de los datos
 */
interface EstadoGlobal {
  tieneCorrelacionesReales: boolean;  // Indica si hay suficientes datos para correlaciones válidas
  hashtagsConDatos: number;           // Cantidad de hashtags con datos suficientes para análisis
  totalHashtags: number;              // Cantidad total de hashtags disponibles en el sistema
}

/**
 * Props del componente CorrelationInsights
 * Define toda la información necesaria para mostrar insights del análisis
 */
interface CorrelationInsightsProps {
  estadoGlobal: EstadoGlobal;  // Estado general del análisis (datos disponibles, calidad, etc.)
  promedioGeneral: number;     // Coeficiente de Pearson promedio de todas las correlaciones válidas
  totalVentas: number;         // Cantidad total de registros de ventas disponibles para el análisis
}

/**
 * Componente principal que renderiza los insights del análisis de correlaciones
 * 
 * @param estadoGlobal - Métricas globales sobre la disponibilidad y calidad de datos
 * @param promedioGeneral - Coeficiente de Pearson promedio de las correlaciones válidas
 * @param totalVentas - Cantidad de registros de ventas para contexto del análisis
 * @returns JSX con panel de insights, estadísticas y recomendaciones contextuales
 */
const CorrelationInsights: React.FC<CorrelationInsightsProps> = ({
  estadoGlobal,
  promedioGeneral,
  totalVentas
}) => {
  return (
    // Contenedor principal con gradiente púrpura y estilos glassmorphism
    <div className="mt-6 bg-gradient-to-r from-purple-100/80 to-pink-100/80 rounded-xl p-4 border border-purple-200">
      <div className="text-sm text-purple-800">
        <strong>💡 Estado del análisis:</strong>
        <div className="mt-2 space-y-1">
          {/* 
            Renderizado condicional basado en disponibilidad de correlaciones reales
            Muestra diferentes conjuntos de información según la calidad de los datos
          */}
          {estadoGlobal.tieneCorrelacionesReales ? (
            // CASO A: Hay correlaciones válidas - Mostrar estadísticas completas
            <>
              {/* Estadística de hashtags con datos suficientes */}
              <div>
                • <strong>{estadoGlobal.hashtagsConDatos}</strong> de {estadoGlobal.totalHashtags} hashtags tienen datos suficientes
              </div>
              
              {/* Coeficiente de Pearson promedio con 3 decimales de precisión */}
              <div>
                • Coeficiente de Pearson promedio: <strong>{promedioGeneral.toFixed(3)}</strong>
              </div>
              
              {/* Contexto sobre la cantidad de datos de ventas utilizados */}
              <div>
                • Análisis basado en <strong>{totalVentas}</strong> registros de ventas reales
              </div>
              
              {/* Confirmación de metodología matemática utilizada */}
              <div>
                • ✅ <strong>Correlaciones calculadas con fórmula matemática de Pearson (-1 a 1)</strong>
              </div>
              
              {/* Panel educativo con escala de interpretación académica de Pearson */}
              <div className="mt-2 p-2 bg-white/50 rounded text-xs">
                <strong>📚 Escala de interpretación:</strong><br/>
                • |r| ≥ 0.9: Muy fuerte • |r| ≥ 0.7: Fuerte • |r| ≥ 0.5: Moderada • |r| ≥ 0.3: Débil • |r| &lt; 0.3: Muy débil
              </div>
            </>
          ) : (
            // CASO B: Datos insuficientes - Mostrar advertencias y recomendaciones
            <>
              {/* Advertencia principal sobre falta de correlaciones válidas */}
              <div>
                • ❌ <strong>No hay correlaciones reales disponibles</strong>
              </div>
              
              {/* Contexto específico sobre registros de ventas y requisitos mínimos */}
              <div>
                • Registros de ventas: <strong>{totalVentas}</strong> (se necesitan ≥3)
              </div>
              
              {/* Información sobre hashtags disponibles en el sistema */}
              <div>
                • Hashtags disponibles: <strong>{estadoGlobal.totalHashtags}</strong>
              </div>
              
              {/* Recomendación específica para mejorar la calidad del análisis */}
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