import { useState } from 'react';
import MathCalc2 from '../mathCalculus/MathCalc2';
import MenuComponentes from '../components/MenuComponentes';
import InterpretacionDashboard from '../components/InterpretacionDashboard';
import TendenciaUniforme from '../mathCalculus/TendenciaUniforme'
import InstaCalc from '../mathCalculus/InstaCalc';
import { IoChevronBackOutline } from "react-icons/io5";


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

  // Obtener el tipo de visualización según el elemento seleccionado
  const getTipoVisualizacion = (): 'ventas' | 'hashtag1' | 'hashtag2' | 'hashtag3' | 'noticia1' | 'noticia2' | 'noticia3' => {
    return (mapeoTipos[hashtagSeleccionado as keyof typeof mapeoTipos] || 'hashtag1') as 'ventas' | 'hashtag1' | 'hashtag2' | 'hashtag3' | 'noticia1' | 'noticia2' | 'noticia3';
    // ? Obtiene el tipo de visualización según el hashtag seleccionado; usa 'as keyof typeof mapeoTipos' para garantizar la seguridad de tipos al acceder al objeto mapeoTipos.
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
        <div className="bg-white shadow-md rounded-lg p-6">
          <h3 className="text-2xl font-bold mb-4">
            {mostrarTendenciaUniforme ? `Análisis de ${hashtagSeleccionado}` : 'Gráfica de tasa de viralidad en redes sociales'}
          </h3>
          {mostrarTendenciaUniforme ? (
            <div>
              <button
                onClick={resetVisualizacion}
                className="mb-4 px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition flex flex-row items-center gap-2"
              >
                <IoChevronBackOutline />
                Volver a Gráfica de Líneas
              </button>
              <TendenciaUniforme tipo={getTipoVisualizacion()} />
            </div>
          ) : (
            <MathCalc2 modoVisualizacion={modoVisualizacion} />
          )}
        </div>
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
        <div className="bg-white shadow-md rounded-lg p-6 lg:col-span-2">
          <h3 className="text-2xl font-bold mb-4">Interpretación del Análisis</h3>
          <InterpretacionDashboard />
        </div>

        <div className="bg-white shadow-md rounded-lg p-6 lg:col-span-2">
          <h3 className="text-2xl font-bold mb-4">Insta</h3>
          <InstaCalc />
        </div>
        
      </div>
    </div>
  );
}