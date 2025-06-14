/**
 * Componente CorrelationChart
 * 
 * Este componente renderiza una gráfica de barras interactiva que visualiza las correlaciones
 * entre hashtags y ventas, junto con las puntuaciones por plataforma social (Instagram, 
 * Reddit, Twitter). Utiliza la librería Recharts para crear visualizaciones responsivas
 * y profesionales con tooltips personalizados y leyendas formateadas.
 * 
 * Funcionalidades principales:
 * - Gráfica de barras comparativa con múltiples datasets
 * - Coeficiente de correlación de Pearson como métrica principal
 * - Puntuaciones de rendimiento por plataforma social
 * - Tooltips informativos con contexto detallado
 * - Estado vacío cuando no hay datos suficientes
 * - Diseño responsivo y accesible
 * 
 * Autor: Lucio Arturo Reyes Castillo
 * Contribuyentes: Andres Cabrera Alvarado
 */

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

/**
 * Interfaz que define la estructura de datos para cada elemento de la gráfica
 * Contiene tanto métricas de correlación como puntuaciones por plataforma social
 */
interface CorrelationChartData {
  hashtag: string;      // Nombre del hashtag sin el símbolo '#' para mejor visualización en eje X
  correlacion: number;  // Coeficiente de correlación de Pearson (-1 a 1)
  confianza: string;    // Nivel de confianza del análisis ('alta', 'media', 'baja', 'insuficiente')
  categoria: string;    // Categoría interpretativa ('Muy fuerte positiva', 'Moderada', etc.)
  instagram: number;    // Puntuación combinada de interacción y viralidad en Instagram
  reddit: number;       // Puntuación combinada de interacción y viralidad en Reddit
  twitter: number;      // Puntuación combinada de interacción y viralidad en Twitter
}

/**
 * Props del componente CorrelationChart
 * Define los datos necesarios para renderizar la gráfica comparativa
 */
interface CorrelationChartProps {
  datosComparativos: CorrelationChartData[];  // Array de datos de hashtags con correlaciones válidas
}

/**
 * Componente principal que renderiza la gráfica de correlaciones o estado vacío
 * 
 * @param datosComparativos - Array de hashtags con datos de correlación y métricas sociales
 * @returns JSX con gráfica interactiva de Recharts o mensaje de estado vacío
 */
const CorrelationChart: React.FC<CorrelationChartProps> = ({ datosComparativos }) => {
  
  // Verificar si hay datos disponibles para mostrar la gráfica
  // Si no hay datos, renderizar estado vacío con mensaje educativo
  if (datosComparativos.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/50 text-center">
        <div className="text-6xl mb-4">📊</div>
        <h4 className="text-xl font-bold text-gray-600 mb-2">Sin gráfica disponible</h4>
        <p className="text-gray-500">
          No hay suficientes datos para mostrar correlaciones reales.
          <br />
          Agrega más histórico de ventas para ver el análisis.
        </p>
      </div>
    );
  }

  /**
   * Función utilitaria para formatear los valores mostrados en tooltips
   * Maneja diferentes tipos de métricas con formatos específicos
   * 
   * @param value - Valor numérico a formatear
   * @param name - Nombre de la métrica ('correlacion', 'instagram', etc.)
   * @returns Array con valor formateado y nombre de plataforma legible
   */
  const formatTooltipValue = (value: any, name: string) => {
    const plataforma = name === 'correlacion' ? 'Coeficiente de Pearson' :
                     name === 'instagram' ? 'Instagram' :
                     name === 'reddit' ? 'Reddit' : 'Twitter';
    // Correlaciones con 3 decimales, puntuaciones sociales como porcentajes
    const displayValue = name === 'correlacion' ? value.toFixed(3) : `${value}%`;
    return [displayValue, plataforma];
  };

  /**
   * Función para formatear la etiqueta principal del tooltip
   * Incluye información contextual adicional sobre el hashtag seleccionado
   * 
   * @param label - Nombre del hashtag
   * @param payload - Datos completos del elemento seleccionado
   * @returns JSX con información detallada del hashtag
   */
  const formatTooltipLabel = (label: string, payload: any) => {
    const item = payload?.[0]?.payload;
    return (
      <div>
        <div>Hashtag: #{label}</div>
        {item && (
          <div className="text-xs text-gray-500 mt-1">
            Pearson: {item.correlacion?.toFixed(3)} • {item.categoria} • Confianza: {item.confianza}
          </div>
        )}
      </div>
    );
  };

  /**
   * Función para formatear los nombres en la leyenda de la gráfica
   * Convierte nombres técnicos en etiquetas amigables con emojis
   * 
   * @param value - Nombre técnico de la métrica
   * @returns Nombre formateado con emoji y descripción legible
   */
  const formatLegend = (value: string) => {
    const nombres: Record<string, string> = {
      correlacion: 'Coeficiente de Pearson',
      instagram: '📸 Instagram',
      reddit: '🔴 Reddit',
      twitter: '🐦 Twitter'
    };
    return nombres[value] || value;
  };

  return (
    // Contenedor principal con estilos glassmorphism consistentes
    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/50">
      {/* Título dinámico que muestra la cantidad de hashtags analizados */}
      <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
        📊 Comparativa de correlaciones reales ({datosComparativos.length} hashtag(s))
      </h4>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={datosComparativos} 
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}  
          >

            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              dataKey="hashtag" 
              stroke="#64748b"
              fontSize={12}
              angle={-45}          
              textAnchor="end"    
              height={80}          
            />
            
            <YAxis 
              stroke="#64748b"
              fontSize={12}
              domain={[-1, 1]}     
              tickFormatter={(value) => value.toFixed(2)}  
            />
            
            <Tooltip 
              formatter={formatTooltipValue}      // Formateo de valores individuales
              labelFormatter={formatTooltipLabel} // Formateo de etiqueta principal
              contentStyle={{
                backgroundColor: '#f8fafc',       // Fondo claro
                border: '2px solid #8b5cf6',     // Borde púrpura consistente con el tema
                borderRadius: '12px',            // Bordes redondeados
                fontSize: '14px',                // Tamaño de fuente legible
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)'  // Sombra sutil
              }}
            />
            
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              formatter={formatLegend}
            />
            
            <Bar 
              dataKey="correlacion" 
              fill="#8b5cf6"        // Color púrpura para correlaciones
              name="correlacion"
              radius={[4, 4, 0, 0]}  // Bordes redondeados en la parte superior
            />
            
            <Bar 
              dataKey="instagram" 
              fill="#e91e63"        // Color rosa/magenta representativo de Instagram
              name="instagram"
              radius={[4, 4, 0, 0]}
            />
            
            <Bar 
              dataKey="reddit" 
              fill="#ff5722"        // Color naranja/rojo representativo de Reddit
              name="reddit"
              radius={[4, 4, 0, 0]}
            />
            
            <Bar 
              dataKey="twitter" 
              fill="#2196f3"        // Color azul representativo de Twitter
              name="twitter"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CorrelationChart;