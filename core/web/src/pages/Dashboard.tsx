import { useState } from 'react';
import MathCalc2 from '../mathCalculus/MathCalc2';
import MenuComponentes from '../components/MenuComponentes';
import InterpretacionDashboard from '../components/InterpretacionDashboard';
import TendenciaUniforme from '../mathCalculus/TendenciaUniforme'
import XCalc from '../mathCalculus/XCalc';
import RedditCalc from '../mathCalculus/RedditCalc';
import InstaCalc from '../mathCalculus/InstaCalc';


import { resultadoXCalc } from '../mathCalculus/XCalc';
import { resultadoRedditCalc } from '../mathCalculus/RedditCalc';
import { resultadoInstaCalc } from '../mathCalculus/InstaCalc';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, 
  ResponsiveContainer, CartesianGrid 
} from 'recharts';

// Componente de Consolidación extraído de MenuComponentes para usarlo independientemente
const Consolidacion = () => {
  const [seleccionadas, setSeleccionadas] = useState<string[]>(['xcalc']); // Por defecto muestra XCalc

  // Define cada calculadora y sus datos
  const calculadoras = [
    { id: 'reddit', nombre: 'Reddit', datos: resultadoRedditCalc, color: '#8884d8' },
    { id: 'insta', nombre: 'Instagram', datos: resultadoInstaCalc, color: '#82ca9d' },
    { id: 'xcalc', nombre: 'XCalc', datos: resultadoXCalc, color: '#ffc658' },
  ];

  // Función para alternar selección de una calculadora
  const toggleSeleccion = (id: string) => {
    setSeleccionadas((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id].slice(-3) // máximo 3
    );
  };

  // Combinar datos de las calculadoras seleccionadas
  const combinarDatosInteraccion = () => {
    // Array con todas las fechas, para alinear por fecha
    const todasFechas = Array.from(
      new Set(
        seleccionadas.flatMap(
          (id) => calculadoras.find((c) => c.id === id)?.datos.datosInteraccion.map((d: any) => d.fecha) || []
        )
      )
    );

    // Por cada fecha crear un objeto con la fecha y las tasas de cada calculadora seleccionada
    return todasFechas.map((fecha) => {
      const item: any = { fecha };
      seleccionadas.forEach((id) => {
        const calc = calculadoras.find((c) => c.id === id);
        const dato = calc?.datos.datosInteraccion.find((d: any) => d.fecha === fecha);
        item[id] = dato ? dato.tasa : 0;
      });
      return item;
    });
  };

  const datosCombinados = combinarDatosInteraccion();

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-xl font-bold text-navy-900 mb-4">Consolidación de Tendencias</h2>

      {/* Botones tipo bolitas para seleccionar calculadoras */}
      <div className="flex gap-4 justify-center mb-6">
        {calculadoras.map(({ id, nombre, color }) => (
          <div
            key={id}
            onClick={() => toggleSeleccion(id)}
            className={`w-10 h-10 rounded-full cursor-pointer flex items-center justify-center font-bold select-none
              ${seleccionadas.includes(id) ? 'text-white' : 'text-gray-600'}`}
            style={{ backgroundColor: seleccionadas.includes(id) ? color : '#ddd' }}
            title={`Mostrar ${nombre}`}
          >
            {nombre[0]}
          </div>
        ))}
      </div>

      {/* Gráfica combinada que muestra las tendencias seleccionadas */}
      <div className="w-full h-96">
        <ResponsiveContainer>
          <LineChart data={datosCombinados} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid stroke="#ccc" strokeDasharray="3 3" />
            <XAxis dataKey="fecha" />
            <YAxis domain={[0, 'dataMax']} tickFormatter={(value) => `${value}%`} />
            <Tooltip formatter={(value) => `${value}%`} />
            <Legend />
            {seleccionadas.map((id) => {
              const calc = calculadoras.find((c) => c.id === id);
              return (
                <Line
                  key={id}
                  type="monotone"
                  dataKey={id}
                  stroke={calc?.color || '#000'}
                  name={calc?.nombre || id}
                  activeDot={{ r: 8 }}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

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

export default function Dashboard() {
  const nombreProducto = "Bolso Mariana :D";
  const [modoVisualizacion, setModoVisualizacion] = useState<'original' | 'logaritmo' | 'normalizado'>('original');
  const [hashtagSeleccionado, setHashtagSeleccionado] = useState<string>('#EcoFriendly');
  const [mostrarTendenciaUniforme, setMostrarTendenciaUniforme] = useState<boolean>(false);
  const [mostrarConsolidacion, setMostrarConsolidacion] = useState<boolean>(true);

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
          {/* Gráfica de líneas */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <h3 className="text-2xl font-bold mb-4">
              {mostrarTendenciaUniforme ? `Análisis: ${hashtagSeleccionado}` : 'Gráfica de Líneas'}
            </h3>
            {mostrarTendenciaUniforme ? (
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
              <MathCalc2 modoVisualizacion={modoVisualizacion} />
            )}
          </div>
          
          {/* Consolidación de Tendencias (Nuevo posicionamiento) */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-2xl font-bold">Consolidación de Tendencias</h3>
              <button
                onClick={toggleConsolidacion}
                className="px-4 py-1 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition font-semibold"
              >
                {mostrarConsolidacion ? "Ocultar" : "Ver más"}
              </button>
            </div>
            {mostrarConsolidacion && <Consolidacion />}
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
          />
        </div>
        
        {/* Interpretación - Span completo */}
        <div className="bg-white shadow-md rounded-lg p-6 lg:col-span-2">
          <h3 className="text-2xl font-bold mb-4">Interpretación del Análisis</h3>
          <InterpretacionDashboard />
        </div>

        {/* Componentes de redes sociales */}
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
      </div>
    </div>
  );
}