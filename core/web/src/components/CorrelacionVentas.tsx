import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid
} from 'recharts';

interface CorrelacionVentasProps {
  hashtagSeleccionado?: string;
}

// Datos de correlación por hashtag/fuente
const datosCorrelacion = [
  { 
    nombre: '#EcoFriendly', 
    correlacion: 91, 
    impacto: 'Alto',
    tendencia: 'up',
    color: '#16a34a',
    insights: {
      mejorDia: 'Martes',
      mejorHora: '14:00-16:00',
      engagement: '+45%',
      recomendacion: 'Incrementar frecuencia de posts con este hashtag'
    }
  },
  { 
    nombre: '#SustainableFashion', 
    correlacion: 82, 
    impacto: 'Alto',
    tendencia: 'up',
    color: '#3b82f6',
    insights: {
      mejorDia: 'Viernes',
      mejorHora: '12:00-14:00',
      engagement: '+32%',
      recomendacion: 'Combinar con imágenes de productos para mayor impacto'
    }
  },
  { 
    nombre: '#NuevosMateriales', 
    correlacion: 70, 
    impacto: 'Medio',
    tendencia: 'stable',
    color: '#94a3b8',
    insights: {
      mejorDia: 'Miércoles',
      mejorHora: '10:00-12:00',
      engagement: '+18%',
      recomendacion: 'Incluir más contenido educativo sobre materiales'
    }
  },
  { 
    nombre: 'Instagram Stories', 
    correlacion: 76, 
    impacto: 'Alto',
    tendencia: 'up',
    color: '#e91e63',
    insights: {
      mejorDia: 'Domingo',
      mejorHora: '18:00-20:00',
      engagement: '+28%',
      recomendacion: 'Usar más contenido behind-the-scenes'
    }
  },
  { 
    nombre: 'X (Twitter) Posts', 
    correlacion: 64, 
    impacto: 'Medio',
    tendencia: 'down',
    color: '#1da1f2',
    insights: {
      mejorDia: 'Lunes',
      mejorHora: '09:00-11:00',
      engagement: '+12%',
      recomendacion: 'Enfocar en threads informativos sobre sostenibilidad'
    }
  },
  { 
    nombre: 'Reddit Discussions', 
    correlacion: 58, 
    impacto: 'Medio',
    tendencia: 'stable',
    color: '#ff4500',
    insights: {
      mejorDia: 'Jueves',
      mejorHora: '20:00-22:00',
      engagement: '+22%',
      recomendacion: 'Participar más en comunidades de moda sostenible'
    }
  }
];

// Datos para el gráfico de impacto en ventas
const datosImpactoVentas = [
  { periodo: 'Ene', sinHashtags: 1200, conHashtags: 1850 },
  { periodo: 'Feb', sinHashtags: 1100, conHashtags: 2100 },
  { periodo: 'Mar', sinHashtags: 1300, conHashtags: 2650 },
  { periodo: 'Abr', sinHashtags: 1250, conHashtags: 2890 }
];

// Datos de viralidad por post
const datosViralidadPosts = [
  {
    post: "A",
    viralidad: 3.0,
    viralidad_normalizada: 0.0,
    color: '#ef4444',
    impacto: 'Bajo',
    tendencia: 'down'
  },
  {
    post: "B",
    viralidad: 7.0,
    viralidad_normalizada: 0.571,
    color: '#f59e0b',
    impacto: 'Medio',
    tendencia: 'stable'
  },
  {
    post: "C",
    viralidad: 10.0,
    viralidad_normalizada: 1.0,
    color: '#10b981',
    impacto: 'Alto',
    tendencia: 'up'
  },
  {
    post: "D",
    viralidad: 8.5,
    viralidad_normalizada: 0.85,
    color: '#3b82f6',
    impacto: 'Alto',
    tendencia: 'up'
  }
];

const CorrelacionVentas: React.FC<CorrelacionVentasProps> = ({ hashtagSeleccionado }) => {
  const [vistaActiva, setVistaActiva] = useState<'correlacion' | 'impacto' | 'insights' | 'posts'>('correlacion');

  // Obtener el insight destacado basado en la selección
  const getInsightDestacado = () => {
    const itemSeleccionado = datosCorrelacion.find(item => 
      hashtagSeleccionado && item.nombre.includes(hashtagSeleccionado.replace('#', ''))
    );
    
    if (itemSeleccionado) {
      return {
        titulo: `Insight para ${itemSeleccionado.nombre}`,
        data: itemSeleccionado.insights,
        correlacion: itemSeleccionado.correlacion
      };
    }

    // Insight general si no hay selección específica
    const mejorCorrelacion = datosCorrelacion.reduce((prev, current) => 
      prev.correlacion > current.correlacion ? prev : current
    );

    return {
      titulo: `Tu mejor oportunidad: ${mejorCorrelacion.nombre}`,
      data: mejorCorrelacion.insights,
      correlacion: mejorCorrelacion.correlacion
    };
  };

  const insightDestacado = getInsightDestacado();

  // Calcular métricas generales
  const promedioCorrelacion = Math.round(
    datosCorrelacion.reduce((sum, item) => sum + item.correlacion, 0) / datosCorrelacion.length
  );

  const tendenciaGeneral = datosCorrelacion.filter(item => item.tendencia === 'up').length > 
    datosCorrelacion.filter(item => item.tendencia === 'down').length ? 'positiva' : 'estable';

  return (
    <div className="w-full bg-white rounded-3xl border border-gray-200 p-6 shadow-lg">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-3 shadow-lg mr-4">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
                📊 Correlación con tus ventas
              </h3>
              <p className="text-gray-600 text-sm font-medium">
                Análisis de impacto directo en performance comercial
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl p-3 border border-green-200">
              <div className="text-2xl font-bold text-green-700">{promedioCorrelacion}%</div>
              <div className="text-xs text-green-600 font-medium">Correlación promedio</div>
              <div className="flex items-center mt-1">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  tendenciaGeneral === 'positiva' 
                    ? 'bg-green-200 text-green-700' 
                    : 'bg-yellow-200 text-yellow-700'
                }`}>
                  {tendenciaGeneral === 'positiva' ? '📈 Tendencia positiva' : '📊 Tendencia estable'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navegación de pestañas */}
        <div className="flex space-x-2 bg-gray-100 rounded-xl p-1">
          {[
            { id: 'posts', label: '📝 Análisis de Posts', icon: '📝' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setVistaActiva(tab.id as any)}
              className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                vistaActiva === tab.id
                  ? 'bg-white text-purple-700 shadow-md'
                  : 'text-gray-600 hover:text-purple-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contenido según la vista activa */}
      {vistaActiva === 'correlacion' && (
        <div className="space-y-6">
          {/* Cards de correlación */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {datosCorrelacion.slice(0, 3).map((item, index) => (
              <div key={item.nombre} className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="font-semibold text-gray-800 text-sm">{item.nombre}</span>
                  </div>
                  <div className="flex items-center">
                    {item.tendencia === 'up' && <span className="text-green-500 text-xs">📈</span>}
                    {item.tendencia === 'down' && <span className="text-red-500 text-xs">📉</span>}
                    {item.tendencia === 'stable' && <span className="text-yellow-500 text-xs">📊</span>}
                  </div>
                </div>
                
                <div className="mb-2">
                  <div className="text-2xl font-bold text-gray-900">{item.correlacion}%</div>
                  <div className="text-xs text-gray-500">correlación con ventas</div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div 
                    className="h-2 rounded-full transition-all duration-1000"
                    style={{ 
                      width: `${item.correlacion}%`,
                      backgroundColor: item.color 
                    }}
                  ></div>
                </div>
                
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                  item.impacto === 'Alto' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  Impacto {item.impacto}
                </span>
              </div>
            ))}
          </div>

          {/* Gráfico de barras de todas las correlaciones */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="font-semibold text-gray-800 mb-4">📊 Comparativa completa de correlaciones</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={datosCorrelacion} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <XAxis dataKey="nombre" angle={-45} textAnchor="end" height={80} fontSize={10} />
                  <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                  <Tooltip 
                    formatter={(value: number) => [`${value}%`, "Correlación"]}
                    labelStyle={{ color: '#374151' }}
                  />
                  <Bar dataKey="correlacion" radius={[4, 4, 0, 0]}>
                    {datosCorrelacion.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Vista de impacto en ventas */}
      {vistaActiva === 'impacto' && (
        <div className="space-y-6">
          {/* Métricas de impacto */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
              <div className="text-sm text-blue-600 font-medium">Incremento promedio</div>
              <div className="text-2xl font-bold text-blue-700">+67%</div>
              <div className="text-xs text-blue-500">vs período sin hashtags</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
              <div className="text-sm text-green-600 font-medium">Mejor mes</div>
              <div className="text-2xl font-bold text-green-700">Abril</div>
              <div className="text-xs text-green-500">+131% vs baseline</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4">
              <div className="text-sm text-purple-600 font-medium">ROI del contenido</div>
              <div className="text-2xl font-bold text-purple-700">285%</div>
              <div className="text-xs text-purple-500">retorno de inversión</div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-xl p-4">
              <div className="text-sm text-orange-600 font-medium">Oportunidad</div>
              <div className="text-2xl font-bold text-orange-700">+42%</div>
              <div className="text-xs text-orange-500">potencial adicional</div>
            </div>
          </div>

          {/* Gráfico de impacto en ventas */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="font-semibold text-gray-800 mb-4">💰 Evolución del impacto en ventas</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={datosImpactoVentas} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <XAxis dataKey="periodo" />
                  <YAxis tickFormatter={(value) => `$${value}`} />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      `$${value}`, 
                      name === 'sinHashtags' ? 'Sin estrategia hashtags' : 'Con estrategia hashtags'
                    ]}
                  />
                  <Legend />
                  <Bar dataKey="sinHashtags" fill="#94a3b8" name="Sin estrategia hashtags" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="conHashtags" fill="#3b82f6" name="Con estrategia hashtags" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Vista de insights destacados */}
      {vistaActiva === 'insights' && (
        <div className="space-y-6">
          {/* Insight destacado */}
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-6">
            <div className="flex items-center mb-4">
              <div className="bg-purple-500 rounded-full p-2 mr-3">
                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h4 className="font-bold text-purple-800">{insightDestacado.titulo}</h4>
                <p className="text-sm text-purple-600">Correlación: {insightDestacado.correlacion}% con ventas</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-xs text-purple-600 font-medium">Mejor día</div>
                <div className="font-bold text-purple-800">{insightDestacado.data.mejorDia}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-purple-600 font-medium">Mejor horario</div>
                <div className="font-bold text-purple-800">{insightDestacado.data.mejorHora}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-purple-600 font-medium">Engagement boost</div>
                <div className="font-bold text-green-600">{insightDestacado.data.engagement}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-purple-600 font-medium">Acción sugerida</div>
                <div className="font-bold text-purple-800">📈</div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-3 border border-purple-200">
              <div className="text-sm font-medium text-gray-700 mb-1">💡 Recomendación:</div>
              <div className="text-sm text-gray-600">{insightDestacado.data.recomendacion}</div>
            </div>
          </div>

          {/* Lista de todos los insights */}
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-800">🎯 Insights adicionales</h4>
            {datosCorrelacion.slice(0, 4).map((item, index) => (
              <div key={item.nombre} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div 
                      className="w-2 h-2 rounded-full mr-3"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <div>
                      <div className="font-medium text-gray-800">{item.nombre}</div>
                      <div className="text-xs text-gray-500">
                        Mejor momento: {item.insights.mejorDia} {item.insights.mejorHora}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-green-600">{item.insights.engagement}</div>
                    <div className="text-xs text-gray-500">engagement</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Recomendaciones generales */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4">
            <h4 className="font-semibold text-amber-800 mb-3">⚡ Acciones recomendadas esta semana</h4>
            <div className="space-y-2">
              <div className="flex items-start">
                <span className="text-green-500 mr-2">✅</span>
                <span className="text-sm text-amber-700">Incrementar posts con #EcoFriendly los martes entre 2-4pm</span>
              </div>
              <div className="flex items-start">
                <span className="text-blue-500 mr-2">📊</span>
                <span className="text-sm text-amber-700">Crear más Instagram Stories los domingos en la tarde</span>
              </div>
              <div className="flex items-start">
                <span className="text-purple-500 mr-2">🎯</span>
                <span className="text-sm text-amber-700">Combinar #SustainableFashion con imágenes de productos</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vista de análisis de posts */}
      {vistaActiva === 'posts' && (
        <div className="space-y-6">
          {/* Métricas generales de posts */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
              <div className="text-sm text-green-600 font-medium">Post más viral</div>
              <div className="text-2xl font-bold text-green-700">Post C</div>
              <div className="text-xs text-green-500">10.0 puntos de viralidad</div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
              <div className="text-sm text-blue-600 font-medium">Promedio viralidad</div>
              <div className="text-2xl font-bold text-blue-700">6.7</div>
              <div className="text-xs text-blue-500">puntos promedio</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4">
              <div className="text-sm text-purple-600 font-medium">Rango normalizado</div>
              <div className="text-2xl font-bold text-purple-700">0.0-1.0</div>
              <div className="text-xs text-purple-500">escala normalizada</div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-xl p-4">
              <div className="text-sm text-orange-600 font-medium">Variación</div>
              <div className="text-2xl font-bold text-orange-700">7.0</div>
              <div className="text-xs text-orange-500">diferencia max-min</div>
            </div>
          </div>

          {/* Cards individuales por post */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {datosViralidadPosts.map((post, index) => (
              <div key={post.post} className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: post.color }}
                    ></div>
                    <span className="font-semibold text-gray-800 text-sm">Post {post.post}</span>
                  </div>
                  <div className="flex items-center">
                    {post.tendencia === 'up' && <span className="text-green-500 text-xs">📈</span>}
                    {post.tendencia === 'down' && <span className="text-red-500 text-xs">📉</span>}
                    {post.tendencia === 'stable' && <span className="text-yellow-500 text-xs">📊</span>}
                  </div>
                </div>

                <div className="space-y-2 mb-3">
                  <div>
                    <div className="text-lg font-bold text-gray-900">{post.viralidad}</div>
                    <div className="text-xs text-gray-500">viralidad bruta</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-blue-600">{post.viralidad_normalizada}</div>
                    <div className="text-xs text-gray-500">viralidad normalizada</div>
                  </div>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className="h-2 rounded-full transition-all duration-1000"
                    style={{
                      width: `${post.viralidad_normalizada * 100}%`,
                      backgroundColor: post.color
                    }}
                  ></div>
                </div>

                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${post.impacto === 'Alto'
                    ? 'bg-green-100 text-green-700'
                    : post.impacto === 'Medio'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                  Impacto {post.impacto}
                </span>
              </div>
            ))}
          </div>

          {/* Gráfico de barras - Viralidad bruta */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="font-semibold text-gray-800 mb-4">📊 Comparativa de viralidad bruta por post</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={datosViralidadPosts} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <XAxis dataKey="post" />
                  <YAxis domain={[0, 'dataMax']} />
                  <Tooltip
                    formatter={(value: number) => [value, "Viralidad"]}
                    labelStyle={{ color: '#374151' }}
                  />
                  <Bar dataKey="viralidad" radius={[4, 4, 0, 0]}>
                    {datosViralidadPosts.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gráfico de barras - Viralidad normalizada */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="font-semibold text-gray-800 mb-4">📈 Comparativa de viralidad normalizada por post</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={datosViralidadPosts} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <XAxis dataKey="post" />
                  <YAxis domain={[0, 1]} tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
                  <Tooltip
                    formatter={(value: number) => [`${(value * 100).toFixed(1)}%`, "Viralidad Normalizada"]}
                    labelStyle={{ color: '#374151' }}
                  />
                  <Bar dataKey="viralidad_normalizada" radius={[4, 4, 0, 0]}>
                    {datosViralidadPosts.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gráfico combinado - Líneas */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="font-semibold text-gray-800 mb-4">📋 Vista combinada - Evolución de viralidad</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={datosViralidadPosts} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="post" />
                  <YAxis yAxisId="left" orientation="left" />
                  <YAxis yAxisId="right" orientation="right" domain={[0, 1]} tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      name === 'viralidad' ? value : `${(value * 100).toFixed(1)}%`,
                      name === 'viralidad' ? 'Viralidad Bruta' : 'Viralidad Normalizada'
                    ]}
                  />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="viralidad"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ r: 6 }}
                    name="Viralidad Bruta"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="viralidad_normalizada"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ r: 6 }}
                    name="Viralidad Normalizada"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Análisis y recomendaciones */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-4">
            <h4 className="font-semibold text-indigo-800 mb-3">🎯 Análisis de rendimiento de posts</h4>
            <div className="space-y-2">
              <div className="flex items-start">
                <span className="text-green-500 mr-2">⭐</span>
                <span className="text-sm text-indigo-700">
                  <strong>Post C</strong> lidera con la mayor viralidad (10.0) y normalización perfecta (1.0)
                </span>
              </div>
              <div className="flex items-start">
                <span className="text-yellow-500 mr-2">📊</span>
                <span className="text-sm text-indigo-700">
                  <strong>Post B</strong> muestra rendimiento medio equilibrado con potencial de mejora
                </span>
              </div>
              <div className="flex items-start">
                <span className="text-red-500 mr-2">⚠️</span>
                <span className="text-sm text-indigo-700">
                  <strong>Post A</strong> necesita optimización urgente - menor viralidad registrada
                </span>
              </div>
              <div className="flex items-start">
                <span className="text-blue-500 mr-2">💡</span>
                <span className="text-sm text-indigo-700">
                  Replicar elementos exitosos del Post C en futuras publicaciones
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CorrelacionVentas;
