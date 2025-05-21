import { useState } from 'react';
import MenuComponentes from '../components/MenuComponentes';
import InterpretacionDashboard from '../components/InterpretacionDashboard';
import XCalc from '../mathCalculus/XCalc';
import RedditCalc from '../mathCalculus/RedditCalc';
import InstaCalc from '../mathCalculus/InstaCalc';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, 
  ResponsiveContainer, CartesianGrid 
} from 'recharts';

// Importamos los resultados de cada calculadora
import { resultadoXCalc } from '../mathCalculus/XCalc';
import { resultadoRedditCalc } from '../mathCalculus/RedditCalc';
import { resultadoInstaCalc } from '../mathCalculus/InstaCalc';
import PlotTrend from '@/components/PlotTrend';
import UniformTrendPlot from '@/components/UniformTrendPlot';
import RatePlot from '@/components/RatePlot';

// Importamos los datos de hashtags de noticias
import { hashtagsNoticias } from '../components/MenuComponentes';

// Mapeo de ID de selección a tipo de visualización
const mapeoTipos = {
  'Ventas': 'ventas',
  '#EcoFriendly': 'hashtag1',
  '#SustainableFashion': 'hashtag2',
  '#NuevosMateriales': 'hashtag3',
  'Noticia1': 'noticia1',
  'Noticia2': 'noticia2',
  'Noticia3': 'noticia3'
};

// Definición de los datos de tasa para mostrar en el componente seleccionado
const datosTasas = {
  'virX': { 
    nombre: 'Tasa de viralidad en X', 
    datos: resultadoXCalc.datosViralidad, 
    color: '#8884d8' 
  },
  'intX': { 
    nombre: 'Tasa de interacción en X', 
    datos: resultadoXCalc.datosInteraccion, 
    color: '#8884d8' 
  },
  'virInsta': { 
    nombre: 'Tasa de viralidad en Instagram', 
    datos: resultadoInstaCalc.datosViralidad, 
    color: '#82ca9d' 
  },
  'intInsta': { 
    nombre: 'Tasa de interacción en Instagram', 
    datos: resultadoInstaCalc.datosInteraccion, 
    color: '#82ca9d' 
  },
  'virReddit': { 
    nombre: 'Tasa de viralidad en Reddit', 
    datos: resultadoRedditCalc.datosViralidad, 
    color: '#ffc658' 
  },
  'intReddit': { 
    nombre: 'Tasa de interacción en Reddit', 
    datos: resultadoRedditCalc.datosInteraccion, 
    color: '#ffc658' 
  }
};

// Crear un mapeo similar para los hashtags de noticias
const datosHashtagsNoticias = {
  'pielesSinteticas': hashtagsNoticias[0],
  'milan': hashtagsNoticias[1], 
  'modaSustentable': hashtagsNoticias[2]
};

// Componente que muestra la gráfica con múltiples tasas seleccionadas
const TasasGrafica = ({ tasasIds }: { tasasIds: string[] }) => {
  if (!tasasIds || tasasIds.length === 0) {
    return <div>Selecciona al menos una tasa para visualizar</div>;
  }

  // Generamos los datos combinados para la gráfica
  const generarDatosCombinados = () => {
    // Obtenemos todas las fechas de todos los conjuntos de datos seleccionados
    const todasFechas = Array.from(
      new Set(
        tasasIds.flatMap(id => {
          const tasa = datosTasas[id as keyof typeof datosTasas];
          return tasa ? tasa.datos.map((d: any) => d.fecha) : [];
        })
      )
    );

    // Para cada fecha, creamos un objeto con los valores de todas las tasas seleccionadas
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

  return (
    <div className="w-full">
      <h3 className="text-xl font-bold text-center mb-4">Comparativa de Tasas</h3>
      <div className="w-full h-80">
        <ResponsiveContainer>
          <LineChart data={datosCombinados} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid stroke="#ccc" strokeDasharray="3 3" />
            <XAxis dataKey="fecha" />
            <YAxis domain={[0, 'dataMax']} tickFormatter={(value) => `${value}%`} />
            <Tooltip formatter={(value) => `${value}%`} />
            <Legend />
            {tasasIds.map(id => {
              const tasa = datosTasas[id as keyof typeof datosTasas];
              if (!tasa) return null;
              
              return (
                <Line 
                  key={id}
                  type="monotone" 
                  dataKey={id} 
                  stroke={tasa.color} 
                  name={tasa.nombre} 
                  strokeWidth={3}
                  dot={{ r: 5 }}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Componente que muestra la gráfica con hashtags de noticias seleccionados
const HashtagsNoticiasGrafica = ({ hashtagsIds }: { hashtagsIds: string[] }) => {
  if (!hashtagsIds || hashtagsIds.length === 0) {
    return <div>Selecciona al menos un hashtag para visualizar</div>;
  }

  // Generamos los datos combinados para la gráfica
  const generarDatosCombinados = () => {
    // Obtenemos todas las fechas de todos los conjuntos de datos seleccionados
    const todasFechas = Array.from(
      new Set(
        hashtagsIds.flatMap(id => {
          const hashtag = datosHashtagsNoticias[id as keyof typeof datosHashtagsNoticias];
          return hashtag ? hashtag.datos.map((d: any) => d.fecha) : [];
        })
      )
    );

    // Para cada fecha, creamos un objeto con los valores de todos los hashtags seleccionados
    return todasFechas.map(fecha => {
      const item: any = { fecha };
      
      hashtagsIds.forEach(id => {
        const hashtag = datosHashtagsNoticias[id as keyof typeof datosHashtagsNoticias];
        if (hashtag) {
          const datoHashtag = hashtag.datos.find((d: any) => d.fecha === fecha);
          item[id] = datoHashtag ? datoHashtag.tasa : 0;
        }
      });
      
      return item;
    });
  };

  const datosCombinados = generarDatosCombinados();

  return (
    <div className="w-full">
      <h3 className="text-xl font-bold text-center mb-4">Análisis de Hashtags - Noticias</h3>
      <div className="w-full h-80">
        <ResponsiveContainer>
          <LineChart data={datosCombinados} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid stroke="#ccc" strokeDasharray="3 3" />
            <XAxis dataKey="fecha" />
            <YAxis domain={[0, 'dataMax']} tickFormatter={(value) => `${value}%`} />
            <Tooltip formatter={(value) => `${value}%`} />
            <Legend />
            {hashtagsIds.map(id => {
              const hashtag = datosHashtagsNoticias[id as keyof typeof datosHashtagsNoticias];
              if (!hashtag) return null;
              
              return (
                <Line 
                  key={id}
                  type="monotone" 
                  dataKey={id} 
                  stroke={hashtag.color} 
                  name={hashtag.nombre} 
                  strokeWidth={3}
                  dot={{ r: 5 }}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Componente de mensaje inicial
const MensajeInicial = () => {
  return (
    <div className="w-full h-96 flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 rounded-xl border-2 border-dashed border-blue-300 relative overflow-hidden px-4">
      {/* Decoración de fondo */}
      <div className="absolute top-4 right-4 opacity-20">
        <svg className="h-20 w-20 text-blue-300" fill="currentColor" viewBox="0 0 24 24">
          <path d="M16 6l2.29 2.29c.39.39.39 1.02 0 1.41L16 12l2.29 2.29c.39.39.39 1.02 0 1.41L16 18l-4-4 4-4 4-4-4-4z"/>
        </svg>
      </div>
      
      <div className="text-center max-w-md mx-auto relative z-10">
        {/* Icono principal */}
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

        {/* Título con estilo */}
        <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
          ¡Bienvenido al análisis de tendencias!
        </h3>

        {/* Tip Box */}
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

        {/* Sugerencias */}
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

        {/* Flecha animada */}
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
  const [tasasSeleccionadas, setTasasSeleccionadas] = useState<string[]>(['intReddit']); // Por defecto seleccionamos una tasa
  const [hashtagsNoticiasSeleccionados, setHashtagsNoticiasSeleccionados] = useState<string[]>(['pielesSinteticas']); // Estado para hashtags de noticias

  // Función que será pasada a MenuComponentes para manejar el clic en #EcoFriendly
  const handleEcoFriendlyClick = () => {
    setMostrarTendenciaUniforme(true);
    setHashtagSeleccionado('#EcoFriendly');
  };

  // Función general para manejar cualquier elemento seleccionado
  const handleSeleccionItem = (itemId: string) => {
    if (itemId === '') {
      // Si el itemId está vacío, resetear todo para mostrar mensaje inicial
      setMostrarTendenciaUniforme(false);
      setHashtagSeleccionado('');
    } else {
      setMostrarTendenciaUniforme(true);
      setHashtagSeleccionado(itemId);
    }
  };

  // Función para manejar múltiples tasas seleccionadas
  const handleTasasSeleccionadas = (tasasIds: string[]) => {
    setTasasSeleccionadas(tasasIds);
    // Si seleccionamos tasas, mostramos su visualización correspondiente
    if (tasasIds.length > 0) {
      setMostrarTendenciaUniforme(false);
    }
  };

  // Función para manejar múltiples hashtags de noticias seleccionados
  const handleHashtagsNoticiasSeleccionados = (hashtagsIds: string[]) => {
    setHashtagsNoticiasSeleccionados(hashtagsIds);
    // Si seleccionamos hashtags de noticias, mostramos su visualización correspondiente
    if (hashtagsIds.length > 0) {
      setMostrarTendenciaUniforme(false);
    }
  };

  // Función para restaurar la visualización normal
  const resetVisualizacion = () => {
    setMostrarTendenciaUniforme(false);
  };

  // Función para alternar la visualización de la consolidación
  const toggleConsolidacion = () => {
    setMostrarConsolidacion(!mostrarConsolidacion);
  };

  // Obtener el tipo de visualización según el elemento seleccionado
  const getTipoVisualizacion = (): 'ventas' | 'hashtag1' | 'hashtag2' | 'hashtag3' | 'noticia1' | 'noticia2' | 'noticia3' => {
    return (mapeoTipos[hashtagSeleccionado as keyof typeof mapeoTipos] || 'hashtag1') as 'ventas' | 'hashtag1' | 'hashtag2' | 'hashtag3' | 'noticia1' | 'noticia2' | 'noticia3';
  };

  // Función para determinar qué mostrar en la gráfica principal
  const renderGraficaPrincipal = () => {
    // Si no hay selección, mostrar mensaje inicial
    if (!hashtagSeleccionado || hashtagSeleccionado === '') {
      return <MensajeInicial />;
    }
    
    // Si tenemos tasas seleccionadas y estamos en #EcoFriendly
    if (tasasSeleccionadas.length > 0 && hashtagSeleccionado === '#EcoFriendly') {
      return <RatePlot tasasIds={tasasSeleccionadas} />;
    }
    
    // Si tenemos hashtags de noticias seleccionados y estamos en Noticia1
    if (hashtagsNoticiasSeleccionados.length > 0 && hashtagSeleccionado === 'Noticia1') {
      return <HashtagsNoticiasGrafica hashtagsIds={hashtagsNoticiasSeleccionados} />;
    }
    
    // Si está mostrando tendencia uniforme
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
    
    // Por defecto, mostrar PlotTrend
    return <PlotTrend modoVisualizacion={modoVisualizacion} />;
  };

  return (
    <div className="p-6">
      {/* Header mejorado */}
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
        {/* Columna izquierda con gráficas principales */}
        <div className="flex flex-col gap-6">
          {/* Gráfica de líneas o mensaje inicial */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <h3 className="text-2xl font-bold mb-4">
              {!hashtagSeleccionado || hashtagSeleccionado === ''
                ? "Visualización de Tendencias"
                : tasasSeleccionadas.length > 0 && hashtagSeleccionado === '#EcoFriendly'
                ? "Comparativa de Tasas Seleccionadas"
                : hashtagsNoticiasSeleccionados.length > 0 && hashtagSeleccionado === 'Noticia1'
                ? "Análisis de Hashtags - Noticias"
                : mostrarTendenciaUniforme 
                  ? `Análisis: ${hashtagSeleccionado}`
                  : 'Gráfica de Líneas'
              }
            </h3>
            {renderGraficaPrincipal()}
          </div>
        </div>
        
        {/* Columna derecha con menú de componentes */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <MenuComponentes
            modoVisualizacion={modoVisualizacion}
            setModoVisualizacion={setModoVisualizacion}
            setHashtagSeleccionado={setHashtagSeleccionado}
            onSeleccionItem={handleSeleccionItem}
            onEcoFriendlyClick={handleEcoFriendlyClick}
            hashtagSeleccionado={hashtagSeleccionado}
            onTasasSeleccionadas={handleTasasSeleccionadas}  // Pasamos el callback para manejar la selección múltiple de tasas
            onHashtagsNoticiasSeleccionados={handleHashtagsNoticiasSeleccionados} // Pasamos el callback para hashtags de noticias
          />
        </div>
        
        {/* Interpretación - Span completo */}
        <div className="bg-white shadow-md rounded-lg p-6 lg:col-span-2">
          <h3 className="text-2xl font-bold mb-4">Interpretación del Análisis</h3>
          <InterpretacionDashboard />
        </div>

      </div>
    </div>
  );
}