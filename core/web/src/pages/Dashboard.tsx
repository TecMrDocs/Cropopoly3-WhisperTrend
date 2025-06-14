/**
 * Dashboard Principal - Sistema de Análisis de Tendencias y Visualización de Datos
 * 
 * Este componente representa el dashboard principal de la aplicación, proporcionando
 * una interfaz completa para visualizar tendencias de redes sociales, análisis de ventas,
 * correlaciones de datos y métricas de engagement. Integra múltiples fuentes de datos
 * y ofrece visualizaciones interactivas en tiempo real.
 * 
 * Autor: Lucio Arturo Reyes Castillo
 * Contribuyentes: Julio César Vivas Medina, Sebastián Antonio Almanza (Parte gráfica)
 */

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

/**
 * Importación de componentes de UI modernos
 * Estos componentes proporcionan elementos reutilizables con diseño consistente
 * y funcionalidades específicas para la interfaz del dashboard
 */
import { LoadingSpinner } from '../components/LoadingSpinner';
import { BotonVolver } from '../components/BotonVolver';
import { CardHeader, IconoGraficas, IconoPanel, IconoInterpretacion } from '../components/CardHeader';

/**
 * Mapeo de tipos de contenido para identificadores del sistema
 * Este objeto convierte nombres legibles de contenido (mostrados al usuario)
 * a identificadores únicos internos utilizados por el sistema de cálculos
 * y visualizaciones. Facilita la gestión de diferentes tipos de análisis.
 */
const mapeoTipos = {
  // Ventas
  'Ventas': 'ventas',
  '#EcoFriendly': 'hashtag1',
  '#SustainableFashion': 'hashtag2',
  '#NuevosMateriales': 'hashtag3',
  'Noticia1': 'noticia1',
  'Noticia2': 'noticia2',
  'Noticia3': 'noticia3'
};

/**
 * Genera datos dinámicos de tasas de interacción y viralidad
 * 
 * Procesa los resultados de cálculos de diferentes plataformas sociales
 * (Instagram, X/Twitter, Reddit) y organiza los datos de tasas de interacción
 * y viralidad para su visualización en gráficas dinámicas.
 * 
 * @param datosDelSistema Objeto con resultados calculados del sistema
 * @return Objeto estructurado con datos de tasas organizados por plataforma y hashtag
 */
const generarDatosTasasDinamico = (datosDelSistema: any) => {
  if (!datosDelSistema) {
    return {};
  }

  /**
   * Configuración de calculadoras por plataforma social
   * Define los colores específicos y fuentes de datos para cada red social
   */
  const calculadoras = [
    { id: 'insta', resultado: datosDelSistema.resultadoInstaCalc, colorInteraccion: '#e91e63', colorViralidad: '#f06292' },
    { id: 'x', resultado: datosDelSistema.resultadoXCalc, colorInteraccion: '#dc2626', colorViralidad: '#f97316' },
    { id: 'reddit', resultado: datosDelSistema.resultadoRedditCalc, colorInteraccion: '#2563eb', colorViralidad: '#06b6d4' }
  ];

  const datosTasas: any = {};

  /**
   * Procesamiento de datos por calculadora y hashtag
   * Genera identificadores únicos para cada combinación de plataforma,
   * tipo de tasa (interacción/viralidad) y hashtag específico
   */
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
    } else {
      /**
       * Fallback para datos sin hashtags específicos
       * Maneja casos donde los datos no están organizados por hashtags individuales
       */
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

/**
 * Componente de Visualización de Noticias
 * 
 * Renderiza un análisis detallado de una noticia específica, incluyendo
 * su correlación con tendencias, palabras clave, y impacto estimado
 * en diferentes redes sociales. Proporciona una vista completa del
 * potencial de viralidad de contenido noticioso.
 * 
 * @param noticiaId Identificador único de la noticia a analizar
 * @param datosDelSistema Datos completos del sistema con información de noticias
 */

const VisualizacionNoticia = ({ noticiaId, datosDelSistema }: { noticiaId: string, datosDelSistema: any }) => {
  const indiceNoticia = parseInt(noticiaId.replace('noticia_', ''));
  const noticia = datosDelSistema?.noticias?.[indiceNoticia];

  /**
   * Manejo de error para noticias no encontradas
   * Muestra una interfaz amigable cuando la noticia solicitada no existe
   */
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

  /**
   * Cálculo dinámico de correlación y métricas de impacto
   * Genera valores de correlación basados en el índice de la noticia
   * y determina colores e iconos apropiados según el nivel de correlación
   */
  const correlacion = 60 + (indiceNoticia * 8);
  const colorCorrelacion = correlacion >= 75 ? 'text-green-600' : correlacion >= 65 ? 'text-yellow-600' : 'text-red-600';
  const iconoCorrelacion = correlacion >= 75 ? '📈' : correlacion >= 65 ? '📊' : '📉';

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-white to-purple-50 rounded-2xl p-6">
      {/**
       * Header de la visualización de noticia
       * Presenta el título principal y elementos visuales de identificación
       */}
      <div className="text-center mb-6">
        <div className="text-6xl mb-4">📰</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Análisis de Noticia</h2>
        <div className="w-16 h-1 bg-purple-500 mx-auto rounded-full"></div>
      </div>

      <div className="flex-1 space-y-6">
        {/**
         * Sección de título de la noticia
         * Muestra el título principal con estilo destacado
         */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-purple-100">
          <h3 className="text-xl font-bold text-gray-800 leading-tight">
            {noticia.title}
          </h3>
        </div>

        {/**
         * Sección de descripción de la noticia
         * Presenta el contenido descriptivo de manera legible
         */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-purple-100">
          <h4 className="text-sm font-semibold text-purple-600 mb-3 uppercase tracking-wide">
            Descripción
          </h4>
          <p className="text-gray-700 leading-relaxed">
            {noticia.description}
          </p>
        </div>

        {/**
         * Sección de palabras clave
         * Visualiza las keywords como badges interactivos con estilo hashtag
         */}
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

        {/**
         * Métricas de correlación y enlace externo
         * Muestra indicadores de rendimiento y acceso a la fuente original
         */}
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

        {/**
         * Análisis de impacto en redes sociales
         * Genera barras de progreso dinámicas para mostrar el impacto estimado
         * en diferentes plataformas sociales basado en la correlación calculada
         */}
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

        {/**
         * Timestamp del análisis
         * Proporciona información sobre cuándo fue generado el análisis
         */}
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

/**
 * Componente de Gráfica de Hashtags y Noticias
 * 
 * Renderiza una visualización especializada para analizar la relación
 * entre hashtags específicos y su impacto en el contexto de noticias.
 * Actualmente en desarrollo, proporciona la estructura base para
 * análisis correlacionales avanzados.
 * 
 * @param hashtagsIds Array de identificadores de hashtags seleccionados para análisis
 */
const HashtagsNoticiasGrafica = ({ hashtagsIds }: { hashtagsIds: string[] }) => {
  if (!hashtagsIds || hashtagsIds.length === 0) {
    return <div>Selecciona al menos un hashtag para visualizar</div>;
  }
  return (
    <div className="w-full">
      <h3 className="text-xl font-bold text-center mb-4">Análisis de Hashtags - Noticias</h3>
      <div className="w-full h-80">
        {/* Implementación de gráfica pendiente */}
      </div>
    </div>
  );
};

/**
 * Componente Principal del Dashboard
 * 
 * Este es el componente central que orquesta toda la funcionalidad del dashboard.
 * Gestiona el estado global de la aplicación, coordina la carga de datos,
 * maneja las interacciones del usuario y renderiza los diferentes paneles
 * de visualización según el contexto seleccionado.
 */
export default function Dashboard() {

  /**
   * Estados de control de visualización
   * Gestiona los diferentes modos de visualización y configuraciones
   * de la interfaz de usuario para personalizar la experiencia del análisis
   */
  const [modoVisualizacion, setModoVisualizacion] = useState<'original' | 'logaritmo' | 'normalizado'>('original');
  const [hashtagSeleccionado, setHashtagSeleccionado] = useState<string>('');
  const [mostrarTendenciaUniforme, setMostrarTendenciaUniforme] = useState<boolean>(false);
  const [mostrarConsolidacion, setMostrarConsolidacion] = useState<boolean>(true);
  const [tasasSeleccionadas, setTasasSeleccionadas] = useState<string[]>([]);
  const [hashtagsNoticiasSeleccionados, setHashtagsNoticiasSeleccionados] = useState<string[]>(['pielesSinteticas']);
  const [mostrandoDesgloseTasas, setMostrandoDesgloseTasas] = useState<boolean>(false);

  /**
   * Estados de gestión de datos
   * Controla la carga, procesamiento y estado de los datos del sistema
   */
  const [datosDelSistema, setDatosDelSistema] = useState<any>(null);
  const [cargandoDatos, setCargandoDatos] = useState(true);

  /**
   * Contexto de análisis y configuración del producto
   * Obtiene datos del contexto global y establece configuraciones específicas
   */
  const { analysisData } = usePrompt();
  const nombreProducto = analysisData?.resource_name || "Bolso Mariana :D";

  /**
   * Efecto de carga y procesamiento de datos
   * 
   * Maneja la inicialización del dashboard, carga de datos desde diferentes
   * fuentes (contexto o datos de prueba), procesamiento para visualización
   * y manejo de errores con fallbacks automáticos.
   */
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        let descargaDatos;
        if (analysisData) {
          descargaDatos = crearConDatosContext(analysisData);
        } else {
          descargaDatos = crearConDatosPrueba();
        }
        const resultado = await descargaDatos.obtenerResultadosCalculados();
        const consolidado = procesarParaDashboard(resultado);

        setDatosDelSistema(consolidado);

      } catch (error) {
        /**
         * Sistema de fallback para errores de carga
         * Asegura que el dashboard siempre tenga datos para mostrar
         */
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

  /**
   * Memoización de datos de tasas dinámicas
   * 
   * Optimiza el rendimiento recalculando los datos de tasas solo cuando
   * los datos del sistema cambian, evitando procesamiento innecesario
   * en cada re-renderizado del componente.
   */
  const datosTasas = useMemo(() => {
    if (!datosDelSistema || cargandoDatos) {
      return {};
    }
    return generarDatosTasasDinamico(datosDelSistema);
  }, [datosDelSistema, cargandoDatos]);

  /**
   * Memoización de hashtags dinámicos
   * 
   * Extrae y prepara la lista de hashtags disponibles desde los metadatos
   * del sistema, optimizando el acceso a esta información frecuentemente utilizada.
   */
  const hashtagsDinamicos = useMemo(() => {
    if (!datosDelSistema) return [];
    return datosDelSistema.metadatos?.hashtagsOriginales || [];
  }, [datosDelSistema]);

  /**
   * Renderizado condicional durante la carga
   * Muestra el spinner de carga mientras se procesan los datos iniciales
   */
  if (cargandoDatos) {
    return <LoadingSpinner />;
  }

  /**
   * Extracción de metadatos del sistema
   * Obtiene información sobre la fuente de datos y disponibilidad de cálculos backend
   */
  const fuenteDatos = datosDelSistema?.metadatos?.fuente || 'desconocida';
  const tieneCalculosBackend = !!(datosDelSistema?.calculated_results?.hashtags?.length);

  /**
   * Handler para selección específica de EcoFriendly
   * 
   * Maneja la lógica específica cuando se selecciona el hashtag EcoFriendly,
   * configurando el estado para mostrar análisis detallado con desglose de tasas.
   */
  const handleEcoFriendlyClick = () => {
    setMostrarTendenciaUniforme(true);
    setHashtagSeleccionado('#EcoFriendly');
    setMostrandoDesgloseTasas(true);
  };

  /**
   * Handler principal de selección de elementos
   * 
   * Gestiona la lógica de selección de diferentes tipos de contenido
   * (hashtags, noticias, ventas) y configura el estado de visualización
   * apropiado para cada tipo de análisis.
   * 
   * @param itemId Identificador del elemento seleccionado
   */
  const handleSeleccionItem = (itemId: string) => {
    if (itemId === '') {
      /**
       * Reset de visualización cuando no hay selección
       */
      setMostrarTendenciaUniforme(false);
      setHashtagSeleccionado('');
      setMostrandoDesgloseTasas(false);
    } else {
      setHashtagSeleccionado(itemId);

      if (itemId.startsWith('noticia_')) {
        /**
         * Configuración específica para análisis de noticias
         */
        setMostrarTendenciaUniforme(false);
        setMostrandoDesgloseTasas(false);
      } else {
        /**
         * Configuración para hashtags y otros elementos analíticos
         */
        setMostrarTendenciaUniforme(true);
        const esHashtagDinamico = hashtagsDinamicos.includes(itemId);
        setMostrandoDesgloseTasas(esHashtagDinamico);
      }
    }
  };

  /**
   * Handler para selección de tasas específicas
   * 
   * Actualiza el estado con las tasas seleccionadas para visualización
   * comparativa en gráficas dinámicas especializadas.
   * 
   * @param tasasIds Array de identificadores de tasas seleccionadas
   */
  const handleTasasSeleccionadas = (tasasIds: string[]) => {
    setTasasSeleccionadas(tasasIds);
  };

  /**
   * Handler para selección de hashtags relacionados con noticias
   * 
   * Maneja la selección de hashtags en el contexto de análisis de noticias
   * y ajusta la visualización para mostrar correlaciones específicas.
   * 
   * @param hashtagsIds Array de identificadores de hashtags para análisis de noticias
   */
  const handleHashtagsNoticiasSeleccionados = (hashtagsIds: string[]) => {
    setHashtagsNoticiasSeleccionados(hashtagsIds);
    if (hashtagsIds.length > 0) {
      setMostrarTendenciaUniforme(false);
    }
  };

  /**
   * Función de reset de visualización
   * Restaura el dashboard a su estado inicial sin selecciones activas
   */
  const resetVisualizacion = () => {
    setMostrarTendenciaUniforme(false);
  };

  /**
   * Toggle para mostrar/ocultar vista de consolidación
   * Alterna entre diferentes modos de presentación de datos agregados
   */
  const toggleConsolidacion = () => {
    setMostrarConsolidacion(!mostrarConsolidacion);
  };

  /**
   * Función de mapeo de tipo de visualización
   * 
   * Convierte la selección del usuario en tipos específicos reconocidos
   * por los componentes de visualización, proporcionando un fallback seguro.
   * 
   * @return Tipo de visualización válido para los componentes gráficos
   */
  const getTipoVisualizacion = (): 'ventas' | 'hashtag1' | 'hashtag2' | 'hashtag3' | 'noticia1' | 'noticia2' | 'noticia3' => {
    return (mapeoTipos[hashtagSeleccionado as keyof typeof mapeoTipos] || 'hashtag1') as 'ventas' | 'hashtag1' | 'hashtag2' | 'hashtag3' | 'noticia1' | 'noticia2' | 'noticia3';
  };

  /**
   * Función de renderizado de gráfica principal
   * 
   * Determina qué componente de visualización mostrar basado en el estado
   * actual de selección y configuración. Maneja múltiples tipos de análisis
   * incluyendo ventas, noticias, hashtags y comparativas de tasas.
   * 
   * @return Componente JSX apropiado para la visualización actual
   */
  const renderGraficaPrincipal = () => {
    if (!hashtagSeleccionado || hashtagSeleccionado === '') {
      return <MensajeInicial />;
    }

    if (hashtagSeleccionado === 'Ventas') {
      const datosVentas = analysisData?.sales || [];
      const resourceName = analysisData?.resource_name || 'Voice en Honewwheel';      
      return <VentasCalc datosVentas={datosVentas} resourceName={resourceName} />;
    }

    if (hashtagSeleccionado.startsWith('noticia_')) {
      return <VisualizacionNoticia noticiaId={hashtagSeleccionado} datosDelSistema={datosDelSistema} />;
    }

    if (mostrandoDesgloseTasas && tasasSeleccionadas.length > 0) {
      return <TasasGraficaDinamica tasasIds={tasasSeleccionadas} datosTasas={datosTasas} />;
    }

    if (hashtagsNoticiasSeleccionados.length > 0 && hashtagSeleccionado === 'Noticia1') {
      return <HashtagsNoticiasGrafica hashtagsIds={hashtagsNoticiasSeleccionados} />;
    }

    if (mostrarTendenciaUniforme) {
      return (
        <div>
          <BotonVolver onClick={resetVisualizacion} />
          <UniformTrendPlot tipo={getTipoVisualizacion()} />
        </div>
      );
    }

    return <PlotTrend modoVisualizacion={modoVisualizacion} />;
  };

  /**
   * Función generadora de títulos dinámicos
   * 
   * Genera títulos contextuales para la gráfica principal basados en
   * el tipo de análisis activo y el estado de la visualización.
   * 
   * @return Título descriptivo para la sección de gráfica principal
   */
  const obtenerTituloGraficaPrincipal = () => {
    if (!hashtagSeleccionado || hashtagSeleccionado === '') {
      return "📊 Visualización de Tendencias";
    }
    if (hashtagSeleccionado === 'Ventas') {
      return "💰 Análisis de Ventas";
    }
    if (hashtagSeleccionado.startsWith('noticia_')) {
      return "📰 Análisis de Noticia";
    }
    if (mostrandoDesgloseTasas && tasasSeleccionadas.length > 0) {
      return "📈 Comparativa de Tasas Seleccionadas";
    }
    if (hashtagsNoticiasSeleccionados.length > 0 && hashtagSeleccionado === 'Noticia1') {
      return "📰 Análisis de Hashtags - Noticias";
    }
    if (mostrarTendenciaUniforme) {
      return `📋 Análisis: ${hashtagSeleccionado}`;
    }
    return '📉 Gráfica de Líneas';
  };

  /**
   * Renderizado principal del dashboard
   * 
   * Estructura el layout principal del dashboard con un sistema de grid responsivo
   * que incluye: panel de gráfica principal, panel de control, sección de
   * interpretación de análisis y panel de correlación de ventas.
   */
  return (
    <div className="p-6">
      <DashboardHeader nombreProducto={nombreProducto} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/**
         * Panel Principal de Gráficas
         * Contiene la visualización principal seleccionada por el usuario
         * con efectos visuales avanzados y diseño glassmorphism
         */}
        <div className="flex flex-col gap-6">
          <div className="relative bg-gradient-to-br from-white via-gray-50/40 to-blue-50/60 shadow-2xl rounded-3xl p-8 border-2 border-gray-200/30 backdrop-blur-lg overflow-hidden">
            {/**
             * Efectos de fondo decorativos
             * Elementos visuales que proporcionan profundidad y modernidad al diseño
             */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-gray-400/20 to-blue-500/20 rounded-full blur-3xl -translate-y-16 -translate-x-16"></div>
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tr from-indigo-400/20 to-purple-400/20 rounded-full blur-2xl translate-y-12 translate-x-12"></div>

            <div className="relative z-10">
              <div className="mb-6 pb-4 border-b border-gray-200/50">
                <CardHeader 
                  icono={<IconoGraficas />}
                  titulo={obtenerTituloGraficaPrincipal()}
                  tieneCalculosBackend={tieneCalculosBackend}
                  gradientFrom="from-gray-600"
                  gradientTo="to-blue-700"
                />

                {/**
                 * Indicador de estado de la visualización
                 * Proporciona información contextual sobre el tipo de datos mostrados
                 */}
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

              {/**
               * Contenedor de la gráfica principal
               * Área de renderizado para todas las visualizaciones principales del dashboard
               */}
              <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/40 shadow-inner min-h-80">
                {renderGraficaPrincipal()}
              </div>
            </div>
          </div>
        </div>

        {/**
         * Panel de Control y Configuración
         * Interfaz para seleccionar tipos de análisis, configurar visualizaciones
         * y controlar los parámetros de las gráficas mostradas
         */}
        <div className="relative bg-gradient-to-br from-white via-blue-50/40 to-indigo-100/60 shadow-2xl rounded-3xl p-8 border-2 border-blue-200/30 backdrop-blur-lg overflow-hidden">
          {/**
           * Efectos de fondo para el panel de control
           */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-indigo-500/20 rounded-full blur-3xl -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-400/20 to-pink-400/20 rounded-full blur-2xl translate-y-12 -translate-x-12"></div>

          <div className="relative z-10">
            <div className="mb-6 pb-4 border-b border-blue-200/50">
              <CardHeader 
                icono={<IconoPanel />}
                titulo="🎯 Panel de Control"
                tieneCalculosBackend={true}
                gradientFrom="from-blue-600"
                gradientTo="to-indigo-700"
                descripcionActivo="Sistema activo"
              />

              {/**
               * Guía de uso del panel de control
               */}
              <div className="bg-gradient-to-r from-blue-100/80 to-indigo-100/80 backdrop-blur-sm rounded-xl p-3 border border-blue-200/50">
                <div className="flex items-center">
                  <span className="text-blue-600 mr-2">💡</span>
                  <p className="text-gray-700 text-sm font-medium">
                    Selecciona las <span className="text-blue-600 font-semibold">tendencias</span> que deseas analizar
                  </p>
                </div>
              </div>
            </div>

            {/**
             * Componente de menú de selección
             * Interfaz principal para la configuración de análisis y visualizaciones
             */}
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

        {/**
         * Panel de Interpretación de Análisis
         * Sección dedicada a mostrar insights automáticos, interpretaciones
         * inteligentes de los datos y recomendaciones basadas en IA
         */}
        <div className="relative bg-gradient-to-br from-white via-green-50/40 to-emerald-50/60 shadow-2xl rounded-3xl p-8 border-2 border-green-200/30 backdrop-blur-lg overflow-hidden lg:col-span-2">
          {/**
           * Efectos decorativos para el panel de interpretación
           */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/20 to-emerald-500/20 rounded-full blur-3xl -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-teal-400/20 to-cyan-400/20 rounded-full blur-2xl translate-y-12 -translate-x-12"></div>

          <div className="relative z-10">
            <div className="mb-6 pb-4 border-b border-green-200/50">
              <CardHeader 
                icono={<IconoInterpretacion />}
                titulo="🧠 Interpretación del Análisis"
                tieneCalculosBackend={tieneCalculosBackend}
                gradientFrom="from-green-600"
                gradientTo="to-emerald-700"
                descripcionActivo="Insights con datos reales"
                descripcionDemo="Insights de demostración"
              />

              {/**
               * Información sobre el tipo de análisis utilizado
               */}
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

            {/**
             * Componente de interpretación inteligente
             * Genera insights automáticos basados en los datos analizados
             */}
            <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/40 shadow-inner">
              <InterpretacionDashboard analysisData={analysisData} />
            </div>
          </div>
        </div>

        {/**
         * Panel de Correlación de Ventas
         * Análisis especializado en correlaciones entre diferentes métricas
         * y su impacto en las ventas del producto analizado
         */}
        <div className="relative bg-gradient-to-br from-white via-purple-50/40 to-indigo-50/60 shadow-2xl rounded-3xl p-8 border-2 border-purple-200/30 backdrop-blur-lg overflow-hidden lg:col-span-2">
          {/**
           * Efectos de fondo para el panel de correlación
           */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-indigo-500/20 rounded-full blur-3xl -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-400/20 to-blue-400/20 rounded-full blur-2xl translate-y-12 -translate-x-12"></div>

          <div className="relative z-10">
            {/**
             * Componente de análisis de correlación
             * Muestra relaciones estadísticas entre hashtags, noticias y ventas
             */}
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