import React, { useState } from 'react';
import MathCalc2 from '../mathCalculus/MathCalc2';
import MenuComponentes from '../components/MenuComponentes';
import InterpretacionDashboard from '../components/InterpretacionDashboard';
import TendenciaUniforme from '../mathCalculus/TendenciaUniforme';

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
  
  // Función para restaurar la visualización normal
  const resetVisualizacion = () => {
    setMostrarTendenciaUniforme(false);
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
            {mostrarTendenciaUniforme ? 'Tendencia Uniforme' : 'Gráfica de Líneas'}
          </h3>
          {mostrarTendenciaUniforme ? (
            <div>
              <button 
                onClick={resetVisualizacion}
                className="mb-4 px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition"
              >
                Volver a Gráfica de Líneas
              </button>
              <TendenciaUniforme />
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
            onEcoFriendlyClick={handleEcoFriendlyClick}
            hashtagSeleccionado={hashtagSeleccionado}
          />
        </div>
        <div className="bg-white shadow-md rounded-lg p-6 lg:col-span-2">
          <h3 className="text-2xl font-bold mb-4">Interpretación del Análisis</h3>
          <InterpretacionDashboard />
        </div>
        {!mostrarTendenciaUniforme && (
          <div className="bg-white shadow-md rounded-lg p-6 lg:col-span-2">
            <h3 className="text-2xl font-bold mb-4">Interpretación del Análisis</h3>
            <TendenciaUniforme />
          </div>
        )}
      </div>
    </div>
  );
}