import { useState, useEffect, useMemo } from 'react';
import MenuComponentes from '../components/MenuComponentes';
import InterpretacionDashboard from '../components/InterpretacionDashboard';
import CorrelacionVentas from '../components/CorrelacionVentas';
import VentasCalc from '../mathCalculus/VentasCalc';
import PlotTrend from '@/components/PlotTrend';
import UniformTrendPlot from '@/components/UniformTrendPlot';
import MensajeInicial from '@/components/dashboard/mensajeInicial';
import TasasGraficaDinamica from '@/components/dashboard/TasaGraficaDinamica';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { crearConDatosPrueba, crearConDatosContext } from '../calculus/DescargaDatos';
import { procesarParaDashboard } from '../calculus/ConsolidacionDatos';
import { usePrompt } from "../contexts/PromptContext";
import TestPromptContext from '../components/TestPromptContext';

// Objeto de mapeo que convierte nombres legibles de contenido a identificadores únicos del sistema
const mapeoTipos = {
  // Ventas
  'Ventas': 'ventas',
  // Hashtags
  '#EcoFriendly': 'hashtag1',
  '#SustainableFashion': 'hashtag2',
  '#NuevosMateriales': 'hashtag3',
  //Noticias
  'Noticia1': 'noticia1',
  'Noticia2': 'noticia2',
  'Noticia3': 'noticia3'
};


const generarDatosTasasDinamico = (datosDelSistema: any) => {
  if (!datosDelSistema) {
    console.log('⚠️ No hay datos del sistema, retornando datos vacíos');
    return {};
  }

  const calculadoras = [
    { id: 'insta', resultado: datosDelSistema.resultadoInstaCalc, colorInteraccion: '#e91e63', colorViralidad: '#f06292' },
    { id: 'x', resultado: datosDelSistema.resultadoXCalc, colorInteraccion: '#dc2626', colorViralidad: '#f97316' },
    { id: 'reddit', resultado: datosDelSistema.resultadoRedditCalc, colorInteraccion: '#2563eb', colorViralidad: '#06b6d4' }
  ];

  const datosTasas: any = {};

  // Iterar sobre cada calculadora y sus hashtags para generar las tasas
  calculadoras.forEach(calc => {
    if (calc.resultado.hashtags && Array.isArray(calc.resultado.hashtags)) {
      calc.resultado.hashtags.forEach((hashtag: any) => {
        // ✅ USAR LOS IDs REALES DEL SISTEMA
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
    } else {
      // Datos por defecto para compatibilidad (si es necesario)
      datosTasas[`int_${calc.id}`] = {
        nombre: `Tasa de interacción ${calc.resultado.emoji || ''}`,
        datos: calc.resultado.datosInteraccion || [],
        color: calc.colorInteraccion
      };

      datosTasas[`vir_${calc.id}`] = {
        nombre: `Tasa de viralidad ${calc.resultado.emoji || ''}`,
        datos: calc.resultado.datosViralidad || [],
        color: calc.colorViralidad
      };
    }
  });

  return datosTasas;
};

// 🆕 COMPONENTE: Visualización de Noticias
const VisualizacionNoticia = ({ noticiaId, datosDelSistema }: { noticiaId: string, datosDelSistema: any }) => {
  // Extraer el índice de la noticia del ID
  const indiceNoticia = parseInt(noticiaId.replace('noticia_', ''));
  const noticia = datosDelSistema?.noticias?.[indiceNoticia];

  if (!noticia) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-6xl mb-4">📰</div>
          <h3 className="text-xl font-bold text-gray-600">Noticia no encontrada</h3>
        </div>
      </div>
    );
  }

  // Calcular correlación simulada
  const correlacion = 60 + (indiceNoticia * 8);
  const colorCorrelacion = correlacion >= 75 ? 'text-green-600' : correlacion >= 65 ? 'text-yellow-600' : 'text-red-600';
  const iconoCorrelacion = correlacion >= 75 ? '📈' : correlacion >= 65 ? '📊' : '📉';

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-white to-purple-50 rounded-2xl p-6">
      {/* Header con ícono de noticia */}
      <div className="text-center mb-6">
        <div className="text-6xl mb-4">📰</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Análisis de Noticia</h2>
        <div className="w-16 h-1 bg-purple-500 mx-auto rounded-full"></div>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 space-y-6">
        {/* Título de la noticia */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-purple-100">
          <h3 className="text-xl font-bold text-gray-800 leading-tight">
            {noticia.title}
          </h3>
        </div>

        {/* Descripción */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-purple-100">
          <h4 className="text-sm font-semibold text-purple-600 mb-3 uppercase tracking-wide">
            Descripción
          </h4>
          <p className="text-gray-700 leading-relaxed">
            {noticia.description}
          </p>
        </div>

        {/* Keywords */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-purple-100">
          <h4 className="text-sm font-semibold text-purple-600 mb-3 uppercase tracking-wide">
            Palabras Clave
          </h4>
          <div className="flex flex-wrap gap-2">
            {noticia.keywords.map((keyword: string, index: number) => (
              <span
                key={index}
                className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full text-sm font-medium border border-purple-200"
              >
                #{keyword}
              </span>
            ))}
          </div>
        </div>

        {/* Métricas de análisis */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-lg border border-purple-100 text-center">
            <div className="text-2xl mb-2">{iconoCorrelacion}</div>
            <div className={`text-2xl font-bold ${colorCorrelacion}`}>
              {correlacion}%
            </div>
            <div className="text-sm text-gray-600">Correlación</div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-lg border border-purple-100 text-center">
            <div className="text-2xl mb-2">🔗</div>
            <div className="text-sm text-purple-600 font-medium">
              <a
                href={noticia.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                Ver fuente
              </a>
            </div>
            <div className="text-xs text-gray-500">URL externa</div>
          </div>
        </div>

        {/* Gráfica simulada de impacto */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-purple-100">
          <h4 className="text-sm font-semibold text-purple-600 mb-4 uppercase tracking-wide">
            Impacto Estimado en Redes Sociales
          </h4>
          <div className="space-y-3">
            {[
              { plataforma: 'Instagram', porcentaje: correlacion + 5, color: 'bg-pink-500' },
              { plataforma: 'Reddit', porcentaje: correlacion - 10, color: 'bg-orange-500' },
              { plataforma: 'X (Twitter)', porcentaje: correlacion + 2, color: 'bg-blue-500' }
            ].map((item, index) => (
              <div key={index} className="flex items-center">
                <div className="w-20 text-sm font-medium text-gray-600">
                  {item.plataforma}
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-3 mx-3">
                  <div
                    className={`${item.color} h-3 rounded-full transition-all duration-1000 ease-out`}
                    style={{ width: `${Math.max(item.porcentaje, 0)}%` }}
                  ></div>
                </div>
                <div className="w-12 text-sm font-semibold text-gray-700">
                  {Math.max(item.porcentaje, 0)}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer con timestamp */}
        <div className="text-center">
          <div className="text-xs text-gray-500">
            Análisis generado: {new Date().toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </div>
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

export default function Dashboard() {

  const [modoVisualizacion, setModoVisualizacion] = useState<'original' | 'logaritmo' | 'normalizado'>('original');
  const [hashtagSeleccionado, setHashtagSeleccionado] = useState<string>('');
  const [mostrarTendenciaUniforme, setMostrarTendenciaUniforme] = useState<boolean>(false);
  const [mostrarConsolidacion, setMostrarConsolidacion] = useState<boolean>(true);
  const [tasasSeleccionadas, setTasasSeleccionadas] = useState<string[]>([]);
  const [hashtagsNoticiasSeleccionados, setHashtagsNoticiasSeleccionados] = useState<string[]>(['pielesSinteticas']);
  const [mostrandoDesgloseTasas, setMostrandoDesgloseTasas] = useState<boolean>(false);

  const [datosDelSistema, setDatosDelSistema] = useState<any>(null);
  const [cargandoDatos, setCargandoDatos] = useState(true);

  // 🚀 OBTENER DATOS DEL TU PROMPTCONTEXT
  const { analysisData } = usePrompt();
  const nombreProducto = analysisData?.resource_name || "Bolso Mariana :D";

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        console.log('🔍 [Dashboard] analysisData recibido:', analysisData);
        console.log('🔍 [Dashboard] analysisData.resource_name:', analysisData?.resource_name);

        let descargaDatos;
        if (analysisData) {
          console.log('✅ [Dashboard] Usando datos del PromptContext');
          descargaDatos = crearConDatosContext(analysisData);
        } else {
          console.log('⚠️ [Dashboard] No hay datos del context, usando datos de prueba');
          descargaDatos = crearConDatosPrueba();
        }

        const resultado = await descargaDatos.obtenerResultadosCalculados();
        console.log('🔍 [Dashboard] Resultado de DescargaDatos:', resultado);
        console.log('🔍 [Dashboard] resultado.resource_name:', resultado.resource_name);

        const consolidado = procesarParaDashboard(resultado);
        console.log('🔍 [Dashboard] Resultado consolidado:', consolidado);
        console.log('🔍 [Dashboard] consolidado.resource_name:', consolidado.resource_name);

        setDatosDelSistema(consolidado);

      } catch (error) {
        console.error('❌ [Dashboard] Error en el flujo:', error);

        // Fallback de emergencia
        const descargaDatos = crearConDatosPrueba();
        const resultado = await descargaDatos.obtenerResultadosCalculados();
        const consolidado = procesarParaDashboard(resultado);
        setDatosDelSistema(consolidado);
      } finally {
        setCargandoDatos(false);
      }
    };

    cargarDatos();
  }, [analysisData]);

  const datosTasas = useMemo(() => {
    if (!datosDelSistema || cargandoDatos) {
      return {};
    }
    return generarDatosTasasDinamico(datosDelSistema);
  }, [datosDelSistema, cargandoDatos]);

  // ✅ Obtener hashtags dinámicos del sistema
  const hashtagsDinamicos = useMemo(() => {
    if (!datosDelSistema) return [];
    return datosDelSistema.metadatos?.hashtagsOriginales || [];
  }, [datosDelSistema]);

  // Debug para ver los IDs disponibles
  console.log('🔍 DEBUG: Todos los IDs de tasas disponibles:', Object.keys(datosTasas));
  console.log('🔍 DEBUG: Hashtags dinámicos disponibles:', hashtagsDinamicos);

  if (cargandoDatos) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <h2 className="text-2xl font-bold text-blue-900 mb-2">Cargando análisis...</h2>
          <p className="text-gray-600">Procesando datos de la API</p>
        </div>
      </div>
    );
  }

  const fuenteDatos = datosDelSistema?.metadatos?.fuente || 'desconocida';
  const tieneCalculosBackend = !!(datosDelSistema?.calculated_results?.hashtags?.length);

  const handleEcoFriendlyClick = () => {
    setMostrarTendenciaUniforme(true);
    setHashtagSeleccionado('#EcoFriendly');
    setMostrandoDesgloseTasas(true);
  };

  const handleSeleccionItem = (itemId: string) => {
    console.log('🔍 Dashboard recibió selección:', itemId);

    if (itemId === '') {
      setMostrarTendenciaUniforme(false);
      setHashtagSeleccionado('');
      setMostrandoDesgloseTasas(false);
    } else {
      setHashtagSeleccionado(itemId);

      if (itemId.startsWith('noticia_')) {
        console.log('📰 Es una noticia, no mostrar tendencias');
        setMostrarTendenciaUniforme(false);
        setMostrandoDesgloseTasas(false);
      } else {
        setMostrarTendenciaUniforme(true);
        const esHashtagDinamico = hashtagsDinamicos.includes(itemId);
        setMostrandoDesgloseTasas(esHashtagDinamico);
      }
    }
  };

  const handleTasasSeleccionadas = (tasasIds: string[]) => {
    console.log("🔍 Dashboard recibiendo nuevas tasas:", tasasIds);
    setTasasSeleccionadas(tasasIds);
    console.log("🔍 Dashboard tasas actualizadas a:", tasasIds);
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
  // 🚀 USAR DATOS DIRECTOS DEL ANALYSISDATA
  const datosVentas = analysisData?.sales || [];
  const resourceName = analysisData?.resource_name || 'Voice en Honewwheel';
  
  console.log('📊 [Dashboard] Pasando datos de ventas REALES:', datosVentas);
  
  return <VentasCalc datosVentas={datosVentas} resourceName={resourceName} />;
}

    if (hashtagSeleccionado.startsWith('noticia_')) {
      return <VisualizacionNoticia noticiaId={hashtagSeleccionado} datosDelSistema={datosDelSistema} />;
    }

    if (mostrandoDesgloseTasas && tasasSeleccionadas.length > 0) {
      console.log("🔍 Pasando a TasasGraficaDinamica:", tasasSeleccionadas);
      return <TasasGraficaDinamica tasasIds={tasasSeleccionadas} datosTasas={datosTasas} />;
    }

    if (hashtagsNoticiasSeleccionados.length > 0 && hashtagSeleccionado === 'Noticia1') {
      return <HashtagsNoticiasGrafica hashtagsIds={hashtagsNoticiasSeleccionados} />;
    }

    if (mostrarTendenciaUniforme) {
      return (
        <div>
          <button onClick={resetVisualizacion} className="mb-4 px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition">
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
      <DashboardHeader nombreProducto={nombreProducto} />

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
                          : hashtagSeleccionado.startsWith('noticia_')
                            ? "📰 Análisis de Noticia"
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
                      <p className="text-gray-600 text-sm font-medium">
                        {tieneCalculosBackend ? 'Datos calculados en tiempo real' : 'Datos de demostración'}
                      </p>
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
                          ? "Resumen de ventas"
                          : hashtagSeleccionado.startsWith('noticia_')
                            ? "Análisis detallado de noticia con impacto en redes sociales"
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

              <div className="bg-gradient-to-r from-blue-100/80 to-indigo-100/80 backdrop-blur-sm rounded-xl p-3 border border-blue-200/50">
                <div className="flex items-center">
                  <span className="text-blue-600 mr-2">💡</span>
                  <p className="text-gray-700 text-sm font-medium">
                    Selecciona las <span className="text-blue-600 font-semibold">tendencias</span> que deseas analizar
                  </p>
                </div>
              </div>
            </div>

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
                datosDelSistema={datosDelSistema}
                cargandoDatos={cargandoDatos}
              />
            </div>
          </div>
        </div>

        <div className="relative bg-gradient-to-br from-white via-green-50/40 to-emerald-50/60 shadow-2xl rounded-3xl p-8 border-2 border-green-200/30 backdrop-blur-lg overflow-hidden lg:col-span-2">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/20 to-emerald-500/20 rounded-full blur-3xl -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-teal-400/20 to-cyan-400/20 rounded-full blur-2xl translate-y-12 -translate-x-12"></div>

          <div className="relative z-10">
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
                    <p className="text-gray-600 text-sm font-medium">
                      {tieneCalculosBackend ? 'Insights con datos reales' : 'Insights de demostración'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-100/80 to-emerald-100/80 backdrop-blur-sm rounded-xl p-3 border border-green-200/50">
                <div className="flex items-center">
                  <span className="text-green-600 mr-2">💡</span>
                  <p className="text-gray-700 text-sm font-medium">
                    Análisis automático basado en <span className="text-green-600 font-semibold">
                      {tieneCalculosBackend ? 'fórmulas backend' : 'patrones de datos'}
                    </span> y tendencias de mercado
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/40 shadow-inner">
              <InterpretacionDashboard analysisData={analysisData} />
            </div>

            {/* {process.env.NODE_ENV === 'development' && (
              <div className="container mx-auto px-4 py-4">
                <TestPromptContext />
              </div>
            )} */}
          </div>
        </div>

        <div className="relative bg-gradient-to-br from-white via-purple-50/40 to-indigo-50/60 shadow-2xl rounded-3xl p-8 border-2 border-purple-200/30 backdrop-blur-lg overflow-hidden lg:col-span-2">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-indigo-500/20 rounded-full blur-3xl -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-400/20 to-blue-400/20 rounded-full blur-2xl translate-y-12 -translate-x-12"></div>

          <div className="relative z-10">
            <CorrelacionVentas
              hashtagSeleccionado={hashtagSeleccionado}
              datosDelSistema={datosDelSistema}
              analysisData={analysisData}
            />
          </div>
        </div>

      </div>
    </div>
  );
}