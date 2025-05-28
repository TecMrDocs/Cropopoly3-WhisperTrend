import { useState } from 'react';
import MenuComponentes from '../components/MenuComponentes';
import InterpretacionDashboard from '../components/InterpretacionDashboard';
import CorrelacionVentas from '../components/CorrelacionVentas';
import VentasCalc from '../mathCalculus/VentasCalc';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, 
  ResponsiveContainer, CartesianGrid 
} from 'recharts';

import { resultadoXCalc } from '../mathCalculus/XCalc';
import { resultadoRedditCalc } from '../mathCalculus/RedditCalc';
import { resultadoInstaCalc } from '../mathCalculus/InstaCalc';
import { resultadoVentasCalc } from '../mathCalculus/VentasCalc';
import PlotTrend from '@/components/PlotTrend';
import UniformTrendPlot from '@/components/UniformTrendPlot';
import RatePlot from '@/components/RatePlot';

const mapeoTipos = {
  'Ventas': 'ventas',
  '#EcoFriendly': 'hashtag1',
  '#SustainableFashion': 'hashtag2',
  '#NuevosMateriales': 'hashtag3',
  'Noticia1': 'noticia1',
  'Noticia2': 'noticia2',
  'Noticia3': 'noticia3'
};

const generarDatosTasasDinamico = () => {
  const calculadoras = [
    { id: 'insta', resultado: resultadoInstaCalc, colorInteraccion: '#e91e63', colorViralidad: '#f06292' }, // Instagram
    { id: 'x', resultado: resultadoXCalc, colorInteraccion: '#dc2626', colorViralidad: '#f97316' },         // X
    { id: 'reddit', resultado: resultadoRedditCalc, colorInteraccion: '#2563eb', colorViralidad: '#06b6d4' } // Reddit
  ];

  const datosTasas: any = {};

  calculadoras.forEach(calc => {
    if (calc.resultado.hashtags && Array.isArray(calc.resultado.hashtags)) {
      calc.resultado.hashtags.forEach((hashtag: any) => {
        datosTasas[`int_${calc.id}_${hashtag.id}`] = {
          nombre: `Tasa de interacción ${calc.resultado.emoji || ''} ${hashtag.nombre}`,
          datos: hashtag.datosInteraccion,
          color: calc.colorInteraccion
        };

        datosTasas[`vir_${calc.id}_${hashtag.id}`] = {
          nombre: `Tasa de viralidad ${calc.resultado.emoji || ''} ${hashtag.nombre}`,
          datos: hashtag.datosViralidad,
          color: calc.colorViralidad
        };
      });
    }
  });

  // Fallbacks con colores consistentes
  datosTasas['int_insta'] = datosTasas['int_insta_eco'] || { 
    nombre: 'Tasa de interacción Instagram', 
    datos: [], 
    color: '#e91e63' 
  };
  datosTasas['vir_insta'] = datosTasas['vir_insta_eco'] || { 
    nombre: 'Tasa de viralidad Instagram', 
    datos: [], 
    color: '#f06292' 
  };

  datosTasas['int_x'] = datosTasas['int_x_eco'] || { 
    nombre: 'Tasa de interacción X', 
    datos: [], 
    color: '#dc2626' 
  };
  datosTasas['vir_x'] = datosTasas['vir_x_eco'] || { 
    nombre: 'Tasa de viralidad X', 
    datos: [], 
    color: '#f97316' 
  };

  datosTasas['int_reddit'] = datosTasas['int_reddit_eco'] || { 
    nombre: 'Tasa de interacción Reddit', 
    datos: [], 
    color: '#2563eb' 
  };
  datosTasas['vir_reddit'] = datosTasas['vir_reddit_eco'] || { 
    nombre: 'Tasa de viralidad Reddit', 
    datos: [], 
    color: '#06b6d4' 
  };

  return datosTasas;
};

const datosTasas = generarDatosTasasDinamico();

const obtenerTasasPorHashtag = (hashtagId: string): string[] => {
  const ids: string[] = [];
  const calculadoras = [
    { id: 'insta', resultado: resultadoInstaCalc },
    { id: 'x', resultado: resultadoXCalc },
    { id: 'reddit', resultado: resultadoRedditCalc }
  ];

  calculadoras.forEach(calc => {
    const hashtag = calc.resultado.hashtags.find(h => h.nombre === hashtagId);
    if (hashtag) {
      ids.push(`int_${calc.id}_${hashtag.id}`, `vir_${calc.id}_${hashtag.id}`);
    }
  });

  return ids.length > 0 ? ids : [];
};

const TasasGraficaDinamica = ({ tasasIds }: { tasasIds: string[] }) => {
  console.log("Renderizando TasasGraficaDinamica con tasasIds:", tasasIds);
  if (!tasasIds || tasasIds.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <div className="text-4xl mb-2">📊</div>
          <div>Selecciona tasas para visualizar</div>
        </div>
      </div>
    );
  }

  const generarDatosCombinados = () => {
    const todasFechas = Array.from(
      new Set(
        tasasIds.flatMap(id => {
          const tasa = datosTasas[id as keyof typeof datosTasas];
          return tasa ? tasa.datos.map((d: any) => d.fecha) : [];
        })
      )
    );

    return todasFechas.map(fecha => {
      const item: any = { fecha };      
      tasasIds.forEach(id => {
        const tasa = datosTasas[id as keyof typeof datosTasas];
        if (tasa) {
          const datoTasa = tasa.datos.find((d: any) => d.fecha === fecha);
          item[id] = datoTasa ? datoTasa.tasa : 0;
        }
      });
      return item;
    });
  };

  const datosCombinados = generarDatosCombinados();
  console.log("Datos combinados generados:", datosCombinados);

  return (
    <div className="w-full">
      <h3 className="text-xl font-bold text-center mb-4 text-purple-700">
        📈 Comparativa de Tasas Seleccionadas
      </h3>
      <div className="w-full h-80">
        <ResponsiveContainer>
          <LineChart data={datosCombinados} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
            <XAxis 
              dataKey="fecha" 
              tick={{ fontSize: 11 }}
              angle={-30}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              domain={[0, 100]} 
              tickFormatter={(value) => `${value}%`}
              tick={{ fontSize: 11 }}
            />
            <Tooltip 
              formatter={(value: number, name: string) => {
                const tasa = datosTasas[name as keyof typeof datosTasas];
                return [`${value}%`, tasa?.nombre || name];
              }}
              labelStyle={{ color: '#374151' }}
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '12px'
              }}
            />
            {tasasIds.map((id, index) => {
              const tasa = datosTasas[id as keyof typeof datosTasas];
              if (!tasa) {
                console.warn(`No se encontró tasa para ID: ${id}`);
                return null;
              }
              
              return (
                <Line 
                  key={id}
                  type="linear" 
                  dataKey={id} 
                  stroke={tasa.color} 
                  name={id}
                  strokeWidth={3}
                  dot={{ r: 4, fill: tasa.color }}
                  activeDot={{ r: 6, fill: tasa.color }}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 flex flex-wrap gap-2 justify-center">
        {tasasIds.map(id => {
          const tasa = datosTasas[id as keyof typeof datosTasas];
          if (!tasa) return null;
          return (
            <div 
              key={id}
              className="flex items-center px-3 py-1 rounded-full text-xs font-medium text-white"
              style={{ backgroundColor: tasa.color }}
            >
              <div 
                className="w-2 h-2 bg-white rounded-full mr-2"
              ></div>
              {tasa.nombre}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const HashtagsNoticiasGrafica = ({ hashtagsIds }: { hashtagsIds: string[] }) => {
  if (!hashtagsIds || hashtagsIds.length === 0) {
    return <div>Selecciona al menos un hashtag para visualizar</div>;
  }



  return (
    <div className="w-full">
      <h3 className="text-xl font-bold text-center mb-4">Análisis de Hashtags - Noticias</h3>
      <div className="w-full h-80">

      </div>
    </div>
  );
};

const MensajeInicial = () => {
  return (
    <div className="w-full h-96 flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 rounded-xl border-2 border-dashed border-blue-300 relative overflow-hidden px-4">
      <div className="absolute top-4 right-4 opacity-20">
        <svg className="h-20 w-20 text-blue-300" fill="currentColor" viewBox="0 0 24 24">
          <path d="M16 6l2.29 2.29c.39.39.39 1.02 0 1.41L16 12l2.29 2.29c.39.39.39 1.02 0 1.41L16 18l-4-4 4-4 4-4-4-4z"/>
        </svg>
      </div>
      
      <div className="text-center max-w-md mx-auto relative z-10">
        <div className="mb-4">
          <div className="mx-auto h-16 w-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
            <svg 
              className="h-8 w-8 text-white" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
        </div>

        <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
          ¡Bienvenido al análisis de tendencias!
        </h3>

        <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 mb-3 border border-blue-200 shadow-sm">
          <div className="flex items-center justify-center mb-1">
            <div className="bg-yellow-400 rounded-full p-1 mr-2">
              <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 9h-2V7h2m0 10h-2v-6h2m-1-9A10 10 0 002 12a10 10 0 0010 10 10 10 0 0010-10A10 10 0 0012 2z"/>
              </svg>
            </div>
            <span className="font-semibold text-gray-800 text-sm">💡 TIP</span>
          </div>
          <p className="text-gray-700 text-sm font-medium leading-tight">
            Selecciona cualquier <span className="text-blue-600 font-semibold">tendencia del menú lateral</span> para ver gráficas interactivas
          </p>
        </div>

        <div className="space-y-1 text-xs">
          <div className="flex items-center justify-center text-gray-600">
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2 flex-shrink-0"></div>
            <span>Explora <strong>ventas</strong> del producto</span>
          </div>
          <div className="flex items-center justify-center text-gray-600">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2 flex-shrink-0"></div>
            <span>Analiza <strong>hashtags</strong> y tendencias</span>
          </div>
          <div className="flex items-center justify-center text-gray-600">
            <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mr-2 flex-shrink-0"></div>
            <span>Revisa impacto de <strong>noticias</strong></span>
          </div>
        </div>

        <div className="mt-4 flex justify-center">
          <div className="animate-bounce">
            <div className="bg-blue-500 rounded-full p-2 shadow-lg">
              <svg 
                className="h-4 w-4 text-white" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const nombreProducto = "Bolso Mariana :D";
  const [modoVisualizacion, setModoVisualizacion] = useState<'original' | 'logaritmo' | 'normalizado'>('original');
  const [hashtagSeleccionado, setHashtagSeleccionado] = useState<string>(''); // Cambié a string vacío para mostrar mensaje inicial
  const [mostrarTendenciaUniforme, setMostrarTendenciaUniforme] = useState<boolean>(false);
  const [mostrarConsolidacion, setMostrarConsolidacion] = useState<boolean>(true);
  const [tasasSeleccionadas, setTasasSeleccionadas] = useState<string[]>(['int_insta_eco']); // 🔥 EMPEZAR CON ECOFRIENDLY
  const [hashtagsNoticiasSeleccionados, setHashtagsNoticiasSeleccionados] = useState<string[]>(['pielesSinteticas']); // Estado para hashtags de noticias
  const [mostrandoDesgloseTasas, setMostrandoDesgloseTasas] = useState<boolean>(false); // 🔥 NUEVO ESTADO

const hashtagsDinamicos = [
  ...resultadoXCalc.hashtags,
  ...resultadoInstaCalc.hashtags,
  ...resultadoRedditCalc.hashtags
].map(h => h.nombre);

  const handleEcoFriendlyClick = () => {
    setMostrarTendenciaUniforme(true);
    setHashtagSeleccionado('#EcoFriendly');
    setMostrandoDesgloseTasas(true); 
  };

  const handleSeleccionItem = (itemId: string) => {
    if (itemId === '') {
      setMostrarTendenciaUniforme(false);
      setHashtagSeleccionado('');
      setMostrandoDesgloseTasas(false); 
    } else {
      setMostrarTendenciaUniforme(true);
      setHashtagSeleccionado(itemId);
      
      const esHashtagDinamico = hashtagsDinamicos.includes(itemId);
      setMostrandoDesgloseTasas(esHashtagDinamico);
      
      if (esHashtagDinamico) {
        const nuevasTasas = obtenerTasasPorHashtag(itemId);
        console.log(`Cambiando a hashtag ${itemId}, nuevas tasas:`, nuevasTasas);
        setTasasSeleccionadas(nuevasTasas);
      }
    }
  };

  const handleTasasSeleccionadas = (tasasIds: string[]) => {
    setTasasSeleccionadas(tasasIds);
  };

  const handleHashtagsNoticiasSeleccionados = (hashtagsIds: string[]) => {
    setHashtagsNoticiasSeleccionados(hashtagsIds);
    if (hashtagsIds.length > 0) {
      setMostrarTendenciaUniforme(false);
    }
  };

  const resetVisualizacion = () => {
    setMostrarTendenciaUniforme(false);
  };

  const toggleConsolidacion = () => {
    setMostrarConsolidacion(!mostrarConsolidacion);
  };

  const getTipoVisualizacion = (): 'ventas' | 'hashtag1' | 'hashtag2' | 'hashtag3' | 'noticia1' | 'noticia2' | 'noticia3' => {
    return (mapeoTipos[hashtagSeleccionado as keyof typeof mapeoTipos] || 'hashtag1') as 'ventas' | 'hashtag1' | 'hashtag2' | 'hashtag3' | 'noticia1' | 'noticia2' | 'noticia3';
  };

  const renderGraficaPrincipal = () => {
    if (!hashtagSeleccionado || hashtagSeleccionado === '') {
      return <MensajeInicial />;
    }
    
    if (hashtagSeleccionado === 'Ventas') {
      return <VentasCalc />;
    }
    
    if (mostrandoDesgloseTasas && tasasSeleccionadas.length > 0) {
      return <TasasGraficaDinamica tasasIds={tasasSeleccionadas} />;
    }
    
    if (hashtagsNoticiasSeleccionados.length > 0 && hashtagSeleccionado === 'Noticia1') {
      return <HashtagsNoticiasGrafica hashtagsIds={hashtagsNoticiasSeleccionados} />;
    }
    
    if (mostrarTendenciaUniforme) {
      return (
        <div>
          <button
            onClick={resetVisualizacion}
            className="mb-4 px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition"
          >
            Volver a Gráfica de Líneas
          </button>
          <UniformTrendPlot tipo={getTipoVisualizacion()} />
        </div>
      );
    }
    
    return <PlotTrend modoVisualizacion={modoVisualizacion} />;
  };

  return (
    <div className="p-6">
      <div className="text-center mb-8">
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
          <h1 className="text-4xl font-bold">
            Análisis para <span className="italic">"{nombreProducto}"</span>
          </h1>
        </div>
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-blue-100 shadow-sm">
            <h2 className="text-lg text-gray-700 leading-relaxed">
              A continuación se presenta el <span className="font-semibold text-blue-600">análisis de tendencias</span> para <span className="font-medium text-indigo-600">"{nombreProducto}"</span>, así como su relación con las <span className="font-semibold text-purple-600">ventas del producto</span>.
            </h2>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flex flex-col gap-6">
          <div className="relative bg-gradient-to-br from-white via-gray-50/40 to-blue-50/60 shadow-2xl rounded-3xl p-8 border-2 border-gray-200/30 backdrop-blur-lg overflow-hidden">
            <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-gray-400/20 to-blue-500/20 rounded-full blur-3xl -translate-y-16 -translate-x-16"></div>
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tr from-indigo-400/20 to-purple-400/20 rounded-full blur-2xl translate-y-12 translate-x-12"></div>
            
            <div className="relative z-10">
              <div className="mb-6 pb-4 border-b border-gray-200/50">
                <div className="flex items-center mb-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-600 to-blue-700 rounded-2xl blur-md opacity-75"></div>
                    <div className="relative bg-gradient-to-br from-gray-500 to-blue-600 rounded-2xl p-3 shadow-lg">
                      <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-700 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      {!hashtagSeleccionado || hashtagSeleccionado === ''
                        ? "📊 Visualización de Tendencias"
                        : hashtagSeleccionado === 'Ventas'
                        ? "💰 Análisis de Ventas"
                        : mostrandoDesgloseTasas && tasasSeleccionadas.length > 0
                        ? "📈 Comparativa de Tasas Seleccionadas"
                        : hashtagsNoticiasSeleccionados.length > 0 && hashtagSeleccionado === 'Noticia1'
                        ? "📰 Análisis de Hashtags - Noticias"
                        : mostrarTendenciaUniforme 
                          ? `📋 Análisis: ${hashtagSeleccionado}`
                          : '📉 Gráfica de Líneas'
                      }
                    </h3>
                    <div className="flex items-center mt-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mr-2 animate-pulse"></div>
                      <p className="text-gray-600 text-sm font-medium">Datos en tiempo real</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-gray-100/80 to-blue-100/80 backdrop-blur-sm rounded-xl p-3 border border-gray-200/50">
                  <div className="flex items-center">
                    <span className="text-blue-600 mr-2">🔍</span>
                    <p className="text-gray-700 text-sm font-medium">
                      {!hashtagSeleccionado || hashtagSeleccionado === ''
                        ? <>Aquí podrás ver tus <span className="text-blue-600 font-semibold">tendencias</span></>
                        : hashtagSeleccionado === 'Ventas'
                        ? "Ventas del Bolso Marianne - Período Enero-Abril 2025"
                        : "Visualización activa - Datos actualizados"
                      }
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/40 shadow-inner min-h-80">
                {renderGraficaPrincipal()}
              </div>
            </div>
          </div>
        </div>
        

        <div className="relative bg-gradient-to-br from-white via-blue-50/40 to-indigo-100/60 shadow-2xl rounded-3xl p-8 border-2 border-blue-200/30 backdrop-blur-lg overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-indigo-500/20 rounded-full blur-3xl -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-400/20 to-pink-400/20 rounded-full blur-2xl translate-y-12 -translate-x-12"></div>
          
          <div className="relative z-10">
            <div className="mb-6 pb-4 border-b border-blue-200/50">
              <div className="flex items-center mb-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl blur-md opacity-75"></div>
                  <div className="relative bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-3 shadow-lg">
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    🎯 Panel de Control
                  </h3>
                  <div className="flex items-center mt-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                    <p className="text-gray-600 text-sm font-medium">Sistema activo</p>
                  </div>
                </div>
              </div>
              
              {/* Badge de información */}
              <div className="bg-gradient-to-r from-blue-100/80 to-indigo-100/80 backdrop-blur-sm rounded-xl p-3 border border-blue-200/50">
                <div className="flex items-center">
                  <span className="text-blue-600 mr-2">💡</span>
                  <p className="text-gray-700 text-sm font-medium">
                    Selecciona las <span className="text-blue-600 font-semibold">tendencias</span> que deseas analizar
                  </p>
                </div>
              </div>
            </div>

            {/* Contenedor del menú con efecto glassmorphism */}
            <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-4 border border-white/40 shadow-inner">
              <MenuComponentes
                modoVisualizacion={modoVisualizacion}
                setModoVisualizacion={setModoVisualizacion}
                setHashtagSeleccionado={setHashtagSeleccionado}
                onSeleccionItem={handleSeleccionItem}
                onEcoFriendlyClick={handleEcoFriendlyClick}
                hashtagSeleccionado={hashtagSeleccionado}
                onTasasSeleccionadas={handleTasasSeleccionadas}
                onHashtagsNoticiasSeleccionados={handleHashtagsNoticiasSeleccionados}
              />
            </div>
          </div>
        </div>
        
        {/* Interpretación - Span completo */}
        <div className="relative bg-gradient-to-br from-white via-green-50/40 to-emerald-50/60 shadow-2xl rounded-3xl p-8 border-2 border-green-200/30 backdrop-blur-lg overflow-hidden lg:col-span-2">
          {/* Decoraciones de fondo */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/20 to-emerald-500/20 rounded-full blur-3xl -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-teal-400/20 to-cyan-400/20 rounded-full blur-2xl translate-y-12 -translate-x-12"></div>
          
          <div className="relative z-10">
            {/* Header elegante */}
            <div className="mb-6 pb-4 border-b border-green-200/50">
              <div className="flex items-center mb-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl blur-md opacity-75"></div>
                  <div className="relative bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-3 shadow-lg">
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-green-700 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    🧠 Interpretación del Análisis
                  </h3>
                  <div className="flex items-center mt-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                    <p className="text-gray-600 text-sm font-medium">Insights generados por IA</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-green-100/80 to-emerald-100/80 backdrop-blur-sm rounded-xl p-3 border border-green-200/50">
                <div className="flex items-center">
                  <span className="text-green-600 mr-2">💡</span>
                  <p className="text-gray-700 text-sm font-medium">
                    Análisis automático basado en <span className="text-green-600 font-semibold">patrones de datos</span> y tendencias de mercado
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/40 shadow-inner">
              <InterpretacionDashboard />
            </div>
          </div>
        </div>

        <div className="relative bg-gradient-to-br from-white via-purple-50/40 to-indigo-50/60 shadow-2xl rounded-3xl p-8 border-2 border-purple-200/30 backdrop-blur-lg overflow-hidden lg:col-span-2">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-indigo-500/20 rounded-full blur-3xl -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-400/20 to-blue-400/20 rounded-full blur-2xl translate-y-12 -translate-x-12"></div>
          
          <div className="relative z-10">
            <CorrelacionVentas hashtagSeleccionado={hashtagSeleccionado} />
          </div>
        </div>

      </div>
    </div>
  );
}