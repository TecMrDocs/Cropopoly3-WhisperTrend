import { useState } from 'react';
import MathCalc2 from '../mathCalculus/MathCalc2';
import MenuComponentes from '../components/MenuComponentes';
import InterpretacionDashboard from '../components/InterpretacionDashboard';
import TendenciaUniforme from '../mathCalculus/TendenciaUniforme'
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

export default function Dashboard() {
  const nombreProducto = "Bolso Mariana :D";
  const [modoVisualizacion, setModoVisualizacion] = useState<'original' | 'logaritmo' | 'normalizado'>('original');
  const [hashtagSeleccionado, setHashtagSeleccionado] = useState<string>('#EcoFriendly');
  const [mostrarTendenciaUniforme, setMostrarTendenciaUniforme] = useState<boolean>(false);
  const [mostrarConsolidacion, setMostrarConsolidacion] = useState<boolean>(true);
  const [tasasSeleccionadas, setTasasSeleccionadas] = useState<string[]>(['intReddit']); // Por defecto seleccionamos una tasa

  // Función que será pasada a MenuComponentes para manejar el clic en #EcoFriendly
  const handleEcoFriendlyClick = () => {
    setMostrarTendenciaUniforme(true);
    setHashtagSeleccionado('#EcoFriendly');
  };

  // Función general para manejar cualquier elemento seleccionado
  const handleSeleccionItem = (itemId: string) => {
    setMostrarTendenciaUniforme(true);
    setHashtagSeleccionado(itemId);
  };

  // Función para manejar múltiples tasas seleccionadas
  const handleTasasSeleccionadas = (tasasIds: string[]) => {
    setTasasSeleccionadas(tasasIds);
    // Si seleccionamos tasas, mostramos su visualización correspondiente
    if (tasasIds.length > 0) {
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

  return (
    <div className="p-6">
      <div className="flex justify-center mb-4">
        <h1 className="text-3xl font-bold">Análisis para "{nombreProducto}"</h1>
      </div>
      <div className="flex justify-center mb-6">
        <h2 className="text-xl text-center">
          A continuación se presenta el análisis de tendencias para "{nombreProducto}", así como su relación con las ventas del producto.
        </h2>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Columna izquierda con gráficas principales */}
        <div className="flex flex-col gap-6">
          {/* Gráfica de líneas o tasas seleccionadas */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <h3 className="text-2xl font-bold mb-4">
              {tasasSeleccionadas.length > 0 && hashtagSeleccionado === '#EcoFriendly'
                ? "Comparativa de Tasas Seleccionadas"
                : mostrarTendenciaUniforme 
                  ? `Análisis: ${hashtagSeleccionado}`
                  : 'Gráfica de Líneas'
              }
            </h3>
            {tasasSeleccionadas.length > 0 && hashtagSeleccionado === '#EcoFriendly' ? (
              <TasasGrafica tasasIds={tasasSeleccionadas} />
            ) : mostrarTendenciaUniforme ? (
              <div>
                <button
                  onClick={resetVisualizacion}
                  className="mb-4 px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition"
                >
                  Volver a Gráfica de Líneas
                </button>
                <TendenciaUniforme tipo={getTipoVisualizacion()} />
              </div>
            ) : (
              <PlotTrend modoVisualizacion={modoVisualizacion} />
            )}
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
          />
        </div>
        
        {/* Interpretación - Span completo */}
        <div className="bg-white shadow-md rounded-lg p-6 lg:col-span-2">
          <h3 className="text-2xl font-bold mb-4">Interpretación del Análisis</h3>
          <InterpretacionDashboard />
        </div>

        {/* Componentes de redes sociales - Se pueden mostrar u ocultar según necesidades */}
        <div className="bg-white shadow-md rounded-lg p-6 lg:col-span-2">
          <h3 className="text-2xl font-bold mb-4">X</h3>
          <XCalc />
        </div>

        <div className="bg-white shadow-md rounded-lg p-6 lg:col-span-2">
          <h3 className="text-2xl font-bold mb-4">Reddit</h3>
          <RedditCalc />
        </div>

        <div className="bg-white shadow-md rounded-lg p-6 lg:col-span-2">
          <h3 className="text-2xl font-bold mb-4">Instagram</h3>
          <InstaCalc />
        </div>


        <div>
          <PlotTrend modoVisualizacion={modoVisualizacion} />
        </div>
        <UniformTrendPlot tipo={getTipoVisualizacion()} />
      </div>
    </div>
  );
}