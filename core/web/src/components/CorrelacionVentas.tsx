/**
 * Componente principal: CorrelacionVentas
 *
 * Este componente analiza la relación entre la actividad de hashtags en redes sociales
 * (Instagram, Reddit y Twitter) y las ventas de un producto, utilizando el coeficiente
 * de correlación de Pearson (r) para estimar la fuerza y dirección de dicha relación.
 *
 * Muestra interpretaciones académicas visuales, mensajes de confianza del análisis,
 * tarjetas individuales para cada hashtag, y una gráfica comparativa con barras.
 * 
 * El componente opera con datos reales del sistema (`analysisData`) y es transparente
 * respecto a los criterios de confiabilidad, umbrales mínimos y estimaciones.
 *
 * Autor: Andrés Cabrera Alvarado
 * Contribuyentes: Lucio Reyes (optimización de rendimiento), Julio Cesar Vivas Medina (front design, mejoras de UX)
 */

import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { calcularCorrelacionTransparente, CorrelacionResult } from './correlationCalculator';
import HashtagCard from './HashtagCard';
import CorrelationChart from './CorrelationChart';
import CorrelationInsights from './CorrelationInsights';




interface CorrelacionVentasProps {
  hashtagSeleccionado?: string;
  datosDelSistema?: any;
  analysisData?: any;
}

/**
 * Componente React que calcula, interpreta y visualiza la correlación entre
 * interacciones sociales de hashtags y las ventas de un producto.
 *
 * @param hashtagSeleccionado - Hashtag que se está analizando (opcional)
 * @param datosDelSistema - Datos de apoyo o configuración del sistema (opcional)
 * @param analysisData - Datos de ventas y hashtags del análisis principal
 * @return JSX con análisis visual, tarjetas explicativas y gráfica de barras
 */
const CorrelacionVentas: React.FC<CorrelacionVentasProps> = ({ 
  hashtagSeleccionado, 
  datosDelSistema,
  analysisData 
}) => {

  /**
   * Procesa los datos y calcula correlaciones por hashtag de manera transparente.
   * Incluye estadísticas generales como promedio y tendencia agregada.
   * 
   * @return Objeto con correlaciones individuales, resumen global y estado del análisis
   */
  const correlaciones = useMemo(() => {
    // 🔍 VERIFICAR QUE TENGAMOS DATOS REALES
    const hashtagsCalculados = analysisData?.calculated_results?.hashtags || [];
    const ventasData = analysisData?.sales || [];
    const nombreProducto = analysisData?.resource_name || 'Producto';

    console.log('📊 [CorrelacionVentas] Calculando correlaciones TRANSPARENTES:', {
      hashtags: hashtagsCalculados.length,
      ventas: ventasData.length,
      producto: nombreProducto
    });

    // Si no hay datos reales, usar fallback TRANSPARENTE
    if (hashtagsCalculados.length === 0) {
      console.warn('[CorrelacionVentas] No hay hashtags calculados');
      return {
        hashtags: [
          { 
            nombre: '#SinDatos', 
            resultado: {
              correlacion: 0,
              esReal: false,
              esEstimacion: false,
              mensaje: "No hay hashtags disponibles para analizar",
              confianza: 'insuficiente' as const,
              datosUsados: { ventasDisponibles: 0, metricsDisponibles: false, periodoAnalizado: 'N/A' }
            },
            color: '#94a3b8' 
          }
        ],
        promedioGeneral: 0,
        tendenciaGeneral: 'sin_datos' as const,
        nombreProducto,
        estadoGlobal: {
          tieneCorrelacionesReales: false,
          totalHashtags: 0,
          hashtagsConDatos: 0
        }
      };
    }

    // CALCULAR CORRELACIONES TRANSPARENTES usando las funciones importadas
    const correlacionesCalculadas = hashtagsCalculados.map((hashtag: any, index: number) => {
      
      // Calcular correlación transparente usando la función importada
      const resultado = calcularCorrelacionTransparente(hashtag, ventasData);
      
      const colores = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
      
      return {
        nombre: hashtag.name.startsWith('#') ? hashtag.name : `#${hashtag.name}`,
        resultado,
        color: colores[index % colores.length],
        // Métricas reales por plataforma para tooltip
        puntuacionInstagram: Math.round(hashtag.instagram_interaction + hashtag.instagram_virality),
        puntuacionReddit: Math.round(hashtag.reddit_interaction + hashtag.reddit_virality),
        puntuacionTwitter: Math.round(hashtag.twitter_interaction + hashtag.twitter_virality)
      };
    });

    // Calcular estadísticas globales
    const hashtagsConDatos = correlacionesCalculadas.filter(h => h.resultado.esReal);
    const promedioGeneral = hashtagsConDatos.length > 0 
      ? hashtagsConDatos.reduce((sum, item) => sum + item.resultado.correlacion, 0) / hashtagsConDatos.length
      : 0;

    let tendenciaGeneral: 'positiva' | 'neutral' | 'negativa' | 'sin_datos';
    if (hashtagsConDatos.length === 0) {
      tendenciaGeneral = 'sin_datos';
    } else if (promedioGeneral >= 0.5) {
      tendenciaGeneral = 'positiva';
    } else if (promedioGeneral >= 0.3) {
      tendenciaGeneral = 'neutral';
    } else {
      tendenciaGeneral = 'negativa';
    }

    return {
      hashtags: correlacionesCalculadas,
      promedioGeneral,
      tendenciaGeneral,
      nombreProducto,
      estadoGlobal: {
        tieneCorrelacionesReales: hashtagsConDatos.length > 0,
        totalHashtags: correlacionesCalculadas.length,
        hashtagsConDatos: hashtagsConDatos.length
      }
    };
  }, [datosDelSistema, analysisData]);

  const datosComparativos = useMemo(() => {
    return correlaciones.hashtags
      .filter(hashtag => hashtag.resultado.esReal) 
      .map(hashtag => ({
        hashtag: hashtag.nombre.replace('#', ''),
        correlacion: hashtag.resultado.correlacion,
        confianza: hashtag.resultado.confianza,
        categoria: hashtag.resultado.interpretacion?.categoria || 'N/A',
        instagram: hashtag.puntuacionInstagram,
        reddit: hashtag.puntuacionReddit,
        twitter: hashtag.puntuacionTwitter
      }));
  }, [correlaciones]);

  const colorTendencia = correlaciones.tendenciaGeneral === 'positiva' ? '#22c55e' : 
                        correlaciones.tendenciaGeneral === 'neutral' ? '#f59e0b' :
                        correlaciones.tendenciaGeneral === 'negativa' ? '#ef4444' : '#94a3b8';
  const iconoTendencia = correlaciones.tendenciaGeneral === 'positiva' ? '📈' : 
                        correlaciones.tendenciaGeneral === 'neutral' ? '📊' : 
                        correlaciones.tendenciaGeneral === 'negativa' ? '📉' : '❓';

  return (
    <div className="bg-gradient-to-br from-white via-purple-50/40 to-pink-50/60 rounded-3xl p-8 shadow-2xl border-2 border-purple-200/30">
      
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-purple-200/50">
        <div className="flex items-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-700 rounded-2xl blur-md opacity-75"></div>
            <div className="relative bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-3 shadow-lg">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <div className="ml-4">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-700 via-pink-600 to-red-600 bg-clip-text text-transparent">
              📊 Correlación con tus ventas
            </h3>
            <p className="text-gray-600 text-sm">
              Análisis transparente • {correlaciones.nombreProducto} • {correlaciones.estadoGlobal.hashtagsConDatos}/{correlaciones.estadoGlobal.totalHashtags} con datos suficientes
            </p>
          </div>
        </div>
        
        <div className="text-right">
          {correlaciones.estadoGlobal.tieneCorrelacionesReales ? (
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 border border-green-200">
              <span className="text-3xl mr-2" style={{ color: colorTendencia }}>{iconoTendencia}</span>
              <div>
                <div className="text-2xl font-bold" style={{ color: colorTendencia }}>
                  {correlaciones.promedioGeneral.toFixed(3)}
                </div>
                <div className="text-sm text-gray-600">Pearson promedio</div>
                <div className="text-xs font-medium text-green-600">
                  ✅ Datos reales
                </div>
              </div>
            </div>
          ) : (
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 border border-gray-300">
              <span className="text-3xl mr-2">⚠️</span>
              <div>
                <div className="text-lg font-bold text-gray-600">
                  Sin datos
                </div>
                <div className="text-sm text-gray-500">Insuficientes para análisis</div>
                <div className="text-xs font-medium text-gray-400">
                  Necesitas más historial
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {correlaciones.hashtags.slice(0, 3).map((hashtag, index) => (
          <HashtagCard 
            key={index}
            hashtag={hashtag.nombre}
            resultado={hashtag.resultado}
            color={hashtag.color}
            puntuaciones={{
              instagram: hashtag.puntuacionInstagram,
              reddit: hashtag.puntuacionReddit,
              twitter: hashtag.puntuacionTwitter
            }}
          />
        ))}
      </div>

      {!correlaciones.estadoGlobal.tieneCorrelacionesReales && (
        <div className="bg-gradient-to-r from-yellow-100/80 to-orange-100/80 rounded-xl p-4 mb-6 border border-yellow-200">
          <div className="flex items-center">
            <span className="text-2xl mr-3">⚠️</span>
            <div>
              <div className="font-semibold text-orange-800">Datos insuficientes para correlaciones reales</div>
              <div className="text-sm text-orange-600">
                Necesitas al menos 3 meses de datos de ventas para calcular correlaciones confiables. 
                Actualmente tienes {analysisData?.sales?.length || 0} registro(s).
              </div>
            </div>
          </div>
        </div>
      )}

      <CorrelationChart datosComparativos={datosComparativos} />
      <CorrelationInsights 
        estadoGlobal={correlaciones.estadoGlobal}
        promedioGeneral={correlaciones.promedioGeneral}
        totalVentas={analysisData?.sales?.length || 0}
      />


    </div>
  );
};

export default CorrelacionVentas;