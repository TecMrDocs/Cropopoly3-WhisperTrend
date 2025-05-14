import React from 'react';
import MathCalc2 from '../mathCalculus/MathCalc2';
import MenuComponentes from '../components/MenuComponentes';
import InterpretacionDashboard from '../components/InterpretacionDashboard';

export default function Dashboard() {
  const nombreProducto = "Bolso Mariana :D";
  
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
        {/* Sección izquierda: Gráfica */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h3 className="text-2xl font-bold mb-4">Gráfica de Líneas</h3>
          <MathCalc2 />
        </div>
        
        {/* Sección derecha: MenuComponentes */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <MenuComponentes />
        </div>

        {/* Sección inferior: Interpretación (ocupa todo el ancho) */}
        <div className="bg-white shadow-md rounded-lg p-6 lg:col-span-2">
          <h3 className="text-2xl font-bold mb-4">Interpretación del Análisis</h3>
          <InterpretacionDashboard />
        </div>
      </div>
    </div>
  );
}
