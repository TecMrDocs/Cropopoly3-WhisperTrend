import React, { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  CartesianGrid, ReferenceLine
} from 'recharts';

// Definición de tipos
type DataValue = string | number;
type DataRow = DataValue[];
type DataTable = DataRow[];
type ChartDataPoint = { [key: string]: DataValue };

// Datos originales
const datos: DataTable = [
  ["", "01/01/25 - 31/01/25", "1/02/25 - 28/02/25", "1/03/25 - 31/03/25", "1/04/25 - 19/04/25"],
  ["Tasa Interacción X", 10.99, 1.88, 1.91, 25.52],
  ["Tasa Viralidad X", 1.75, 1.92, 0.69, 83.53],
  ["Tasa Interacción Instagram", 9.579002606, 346.0624043, 6.09294629, 4.261592452],
  ["Tasa Viralidad Instagram", 141.99, 213.98, 78.32, 5.35],
  ["Tasa interacción Reddit", 0.2474374817, 1.366677887, 0.1016653724, 0.2087342069],
  ["Tasa viralidad reddit", 0.2980078249, 0.2502433548, 0.224227941, 0.3087851555]
];

// Función para aplicar logaritmo base 10
function logBase10Tabla(tabla: DataTable): DataTable {
  return tabla.map((fila: DataRow, filaIdx: number) => {
    if (filaIdx === 0) return fila;
    return fila.map((valor: DataValue, colIdx: number) => {
      if (colIdx === 0) return valor;
      const num = typeof valor === "number" ? valor : parseFloat(String(valor));
      return num > 0 ? Math.log10(num) : NaN;
    });
  });
}

// Función para obtener mínimos y máximos por columna
function obtenerMinimosYMaximos(tabla: DataTable): { min: number[]; max: number[] } {
  const numCols = tabla[0].length;
  const min: number[] = [];
  const max: number[] = [];

  for (let col = 1; col < numCols; col++) {
    const valores: number[] = [];
    for (let fila = 1; fila < tabla.length; fila++) {
      const valor = tabla[fila][col];
      if (typeof valor === "number" && !isNaN(valor)) {
        valores.push(valor);
      }
    }
    min[col] = valores.length ? Math.min(...valores) : NaN;
    max[col] = valores.length ? Math.max(...valores) : NaN;
  }

  return { min, max };
}

// Función de normalización
function normalizarTabla(tabla: DataTable, min: number[], max: number[]): DataTable {
  return tabla.map((fila: DataRow, filaIdx: number) => {
    if (filaIdx === 0) return fila;
    return fila.map((valor: DataValue, colIdx: number) => {
      if (colIdx === 0) return fila[0];
      if (typeof valor !== "number" || isNaN(valor)) return NaN;
      const minVal = min[colIdx];
      const maxVal = max[colIdx];
      if (isNaN(minVal) || isNaN(maxVal) || maxVal === minVal) return NaN;
      return ((valor - minVal) / (maxVal - minVal)) * 100;
    });
  });
}

// Preparar datos
const logTabla: DataTable = logBase10Tabla(datos);
const { min, max } = obtenerMinimosYMaximos(logTabla);
const normalizada: DataTable = normalizarTabla(logTabla, min, max);

const fechas: DataValue[] = datos[0].slice(1);
const metricas: DataTable = datos.slice(1);

// Datos originales para la gráfica
const dataOriginal: ChartDataPoint[] = fechas.map((fecha, i) => {
  const punto: ChartDataPoint = { fecha };
  for (const fila of metricas) {
    const nombreMetrica = fila[0];
    if (typeof nombreMetrica === "string") {
      punto[nombreMetrica] = fila[i + 1];
    }
  }
  return punto;
});

// Datos en escala logarítmica para la gráfica
const dataLogaritmica: ChartDataPoint[] = fechas.map((fecha, i) => {
  const punto: ChartDataPoint = { fecha };
  for (let j = 1; j < logTabla.length; j++) {
    const nombreMetrica = logTabla[j][0];
    if (typeof nombreMetrica === "string") {
      punto[nombreMetrica] = logTabla[j][i + 1];
    }
  }
  return punto;
});

// Datos normalizados para la gráfica
const dataNormalizada: ChartDataPoint[] = fechas.map((fecha, i) => {
  const punto: ChartDataPoint = { fecha };
  for (let j = 1; j < normalizada.length; j++) {
    const nombreMetrica = normalizada[j][0];
    if (typeof nombreMetrica === "string") {
      punto[nombreMetrica] = normalizada[j][i + 1];
    }
  }
  return punto;
});

// Colores para líneas
const colores: string[] = [
  "#8884d8", "#82ca9d", "#ffc658", "#ff6384", "#00c49f", "#ff8042"
];

// Componente principal
const MathCalc2 = () => {
  const [modoVisualizacion, setModoVisualizacion] = useState<'original' | 'logaritmo' | 'normalizado'>('original');

  // Determinar qué conjunto de datos mostrar según el modo
  const getDatos = (): ChartDataPoint[] => {
    switch (modoVisualizacion) {
      case 'logaritmo': return dataLogaritmica;
      case 'normalizado': return dataNormalizada;
      case 'original':
      default: return dataOriginal;
    }
  };

  // Determinar los límites del eje Y según el modo
  const getDomain = (): [string | number, string | number] => {
    switch (modoVisualizacion) {
      case 'normalizado': return [0, 100];
      case 'logaritmo':
      case 'original':
      default: return ['auto', 'auto'];
    }
  };

  return (
    <div className="grafico-container">
      <div className="flex gap-4 mb-4">
        <button
          className={`px-4 py-2 rounded ${modoVisualizacion === 'original' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setModoVisualizacion('original')}
        >
          Datos Originales
        </button>
        <button
          className={`px-4 py-2 rounded ${modoVisualizacion === 'logaritmo' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setModoVisualizacion('logaritmo')}
        >
          Escala Logarítmica
        </button>
        <button
          className={`px-4 py-2 rounded ${modoVisualizacion === 'normalizado' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setModoVisualizacion('normalizado')}
        >
          Datos Normalizados (0-100)
        </button>
      </div>

      <h2 className="text-xl font-semibold mb-2">
        {modoVisualizacion === 'original' && 'Métricas en Escala Original'}
        {modoVisualizacion === 'logaritmo' && 'Métricas en Escala Logarítmica (Log10)'}
        {modoVisualizacion === 'normalizado' && 'Métricas Normalizadas (0-100)'}
      </h2>

      <ResponsiveContainer width="100%" height={500}>
        <LineChart
          data={getDatos()}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="fecha" />
          <YAxis domain={getDomain()} />
          <Tooltip />
          <Legend />
          {modoVisualizacion === 'normalizado' && (
            <ReferenceLine y={50} stroke="gray" strokeDasharray="3 3" />
          )}
          {metricas.map(([nombreMetrica], index) => {
            const metricaStr = String(nombreMetrica);
            return (
              <Line
                key={metricaStr}
                type="monotone"
                dataKey={metricaStr}
                stroke={colores[index % colores.length]}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>

      {modoVisualizacion === 'logaritmo' && (
        <div className="mt-4 bg-gray-100 p-4 rounded">
          <h3 className="text-lg font-semibold mb-2">Explicación de la Escala Logarítmica</h3>
          <p>Los valores mostrados son logaritmos base 10 de los datos originales. Esto permite comparar valores de diferentes magnitudes en el mismo gráfico.</p>
          <p className="mt-1">Por ejemplo, un valor de 2 significa 10<sup>2</sup> = 100 en la escala original.</p>
        </div>
      )}

      {modoVisualizacion === 'normalizado' && (
        <div className="mt-4 bg-gray-100 p-4 rounded">
          <h3 className="text-lg font-semibold mb-2">Explicación de la Normalización</h3>
          <ol className="list-decimal pl-5 space-y-1">
            <li>Aplicación de logaritmo base 10 a los valores originales</li>
            <li>Cálculo de mínimos y máximos para cada columna</li>
            <li>Normalización en escala 0-100 usando: ((valor - min) / (max - min)) * 100</li>
          </ol>
        </div>
      )}
    </div>
  );
};

export default MathCalc2;