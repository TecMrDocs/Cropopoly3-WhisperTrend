import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, 
  CartesianGrid, BarChart, Bar, ComposedChart, Area, Cell
} from 'recharts';

// Importar datos de ventas
import ventasDataRaw from '../dataSets/data-ventas.json';

interface VentasData {
  fecha: string;
  unidades: number;
  ingresos: number;
  precio_promedio: number;
}

interface VentasInfo {
  producto: string;
  ventas: VentasData[];
  metricas: {
    crecimiento_promedio: string;
    mejor_mes: string;
    proyeccion_anual: number;
  };
}

const ventasData = ventasDataRaw as VentasInfo;

// Procesar los datos para incluir tendencias y proyecciones
const procesarDatosVentas = () => {
  const datosBase = ventasData.ventas;
  
  // Calcular tendencia (media móvil simple)
  const calcularTendencia = () => {
    return datosBase.map((dato, index) => {
      if (index === 0) return dato.unidades;
      if (index === 1) return (datosBase[0].unidades + dato.unidades) / 2;
      
      // Media móvil de 3 períodos cuando sea posible
      const inicio = Math.max(0, index - 2);
      const elementos = datosBase.slice(inicio, index + 1);
      const suma = elementos.reduce((acc, el) => acc + el.unidades, 0);
      return Math.round(suma / elementos.length);
    });
  };

  const tendencias = calcularTendencia();
  
  // Combinar todos los datos
  return datosBase.map((dato, index) => ({
    ...dato,
    tendencia: tendencias[index],
    // Añadir una proyección optimista (+10%) y pesimista (-5%)
    proyeccion_optimista: Math.round(tendencias[index] * 1.1),
    proyeccion_pesimista: Math.round(tendencias[index] * 0.95)
  }));
};

// Exportar el resultado para ser usado en otros componentes
export const resultadoVentasCalc = {
  plataforma: "Ventas",
  emoji: "💰",
  color: "#0891b2",
  datosVentas: procesarDatosVentas(),
  metricas: ventasData.metricas,
  producto: ventasData.producto
};

// Función helper para formatear valores monetarios
const formatearMoneda = (valor: number) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(valor);
};

// Componente principal
const VentasCalc: React.FC = () => {
  const datosCompletos = resultadoVentasCalc.datosVentas;
  
  return (
    <div className="w-full p-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-cyan-700 mb-2">
          💰 Análisis de Ventas - {ventasData.producto}
        </h1>
        <p className="text-gray-600">Período: Enero - Abril 2025</p>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-200">
          <h3 className="text-sm font-semibold text-gray-600 mb-1">Crecimiento Promedio</h3>
          <p className="text-2xl font-bold text-blue-600">{ventasData.metricas.crecimiento_promedio}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
          <h3 className="text-sm font-semibold text-gray-600 mb-1">Mejor Mes</h3>
          <p className="text-2xl font-bold text-green-600">{ventasData.metricas.mejor_mes}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-4 rounded-lg border border-purple-200">
          <h3 className="text-sm font-semibold text-gray-600 mb-1">Proyección Anual</h3>
          <p className="text-2xl font-bold text-purple-600">{ventasData.metricas.proyeccion_anual.toLocaleString()} unidades</p>
        </div>
      </div>

      {/* Gráfica de Ventas vs Tendencia */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
          📊 Unidades Vendidas y Tendencia
        </h2>
        <div className="w-full h-80">
          <ResponsiveContainer>
            <ComposedChart data={datosCompletos} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
              <XAxis 
                dataKey="fecha" 
                tick={{ fontSize: 12 }}
                angle={-30}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                yAxisId="left"
                tick={{ fontSize: 12 }}
                label={{ value: 'Unidades', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                formatter={(value: any, name: string) => {
                  if (name === 'Unidades Vendidas' || name === 'Tendencia') {
                    return [value.toLocaleString() + ' unidades', name];
                  }
                  return [value, name];
                }}
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              
              {/* Área de proyección */}
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="proyeccion_optimista"
                fill="#3b82f6"
                fillOpacity={0.1}
                stroke="none"
                name="Proyección Optimista"
              />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="proyeccion_pesimista"
                fill="#ef4444"
                fillOpacity={0.1}
                stroke="none"
                name="Proyección Pesimista"
              />
              
              {/* Barras de ventas */}
              <Bar 
                yAxisId="left"
                dataKey="unidades" 
                fill="#0891b2" 
                name="Unidades Vendidas"
                radius={[8, 8, 0, 0]}
              />
              
              {/* Línea de tendencia */}
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="tendencia" 
                stroke="#f59e0b" 
                name="Tendencia"
                strokeWidth={3}
                dot={{ r: 6, fill: '#f59e0b' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráfica de Ingresos */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
          💸 Ingresos por Período
        </h2>
        <div className="w-full h-80">
          <ResponsiveContainer>
            <BarChart data={datosCompletos} margin={{ top: 20, right: 30, left: 60, bottom: 60 }}>
              <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
              <XAxis 
                dataKey="fecha" 
                tick={{ fontSize: 12 }}
                angle={-30}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                label={{ value: 'Ingresos (MXN)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                formatter={(value: any) => formatearMoneda(value)}
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Bar 
                dataKey="ingresos" 
                fill="#16a34a"
                name="Ingresos"
                radius={[8, 8, 0, 0]}
              >
                {datosCompletos.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 2 ? '#059669' : '#16a34a'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabla de resumen */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-3">📋 Resumen Detallado</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-200 text-gray-700">
              <tr>
                <th className="px-4 py-2 text-left">Período</th>
                <th className="px-4 py-2 text-right">Unidades</th>
                <th className="px-4 py-2 text-right">Ingresos</th>
                <th className="px-4 py-2 text-right">Precio Promedio</th>
                <th className="px-4 py-2 text-right">Variación</th>
              </tr>
            </thead>
            <tbody>
              {datosCompletos.map((dato, index) => {
                const variacion = index > 0 
                  ? ((dato.unidades - datosCompletos[index - 1].unidades) / datosCompletos[index - 1].unidades * 100).toFixed(1)
                  : 0;
                  
                return (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="px-4 py-2">{dato.fecha}</td>
                    <td className="px-4 py-2 text-right font-medium">{dato.unidades.toLocaleString()}</td>
                    <td className="px-4 py-2 text-right font-medium">{formatearMoneda(dato.ingresos)}</td>
                    <td className="px-4 py-2 text-right">{formatearMoneda(dato.precio_promedio)}</td>
                    <td className={`px-4 py-2 text-right font-bold ${Number(variacion) > 0 ? 'text-green-600' : Number(variacion) < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                      {index > 0 ? `${Number(variacion) > 0 ? '+' : ''}${variacion}%` : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VentasCalc;