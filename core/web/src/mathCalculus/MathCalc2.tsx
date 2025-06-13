/**
 * Componente de visualización de métricas en gráfico de líneas usando Recharts.
 * Permite visualizar datos en tres modos distintos: original, logarítmico y normalizado,
 * facilitando la comparación de distintas tasas entre redes sociales a través del tiempo.
 * Es un backup visual para saber el comportamiento de las tasas de interacción y viralidad pero con datos dummys
 * Autor: Lucio Arturo Reyes Castillo
 */

import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  CartesianGrid, ReferenceLine
} from 'recharts';

// Tipos personalizados
type DataValue = string | number;
type DataRow = DataValue[];
type DataTable = DataRow[];
type ChartDataPoint = { [key: string]: DataValue };

// Props del componente
interface MathCalc2Props {
  modoVisualizacion: 'original' | 'logaritmo' | 'normalizado';
}

// Paleta de colores para las líneas del gráfico
const colores = ["#8884d8", "#82ca9d", "#ffc658", "#ff6384", "#00c49f", "#ff8042"];

/**
 * Tabla de datos original que contiene distintas tasas por red social y por periodo de tiempo.
 * La primera fila contiene los encabezados de las columnas (fechas).
 */

const datos: DataTable = [
  ["", "01/01/25 - 31/01/25", "1/02/25 - 28/02/25", "1/03/25 - 31/03/25", "1/04/25 - 19/04/25"],
  ["Tasa Interacción X", 3.47, 0.87, 2.17, 7.16],
  ["Tasa Viralidad X", 0.04, 0.01, 0.07, 0.13],
  ["Tasa Interacción Instagram", 3.36, 11.46, 7.9, 4.19],
  ["Tasa Viralidad Instagram", 7.15, 24.44, 50.24, 2.32],
  ["Tasa interacción Reddit", 0.09, .17, 0.02, 0.05],
  ["Tasa viralidad reddit", 35.18, 24.8, 22.38, 35.88]
];

/**
 * Aplica logaritmo base 10 a los valores numéricos de una tabla.
 * Ignora la primera fila y la primera columna (encabezados).
 *
 * @param tabla - La tabla de datos original
 * @return Una nueva tabla con los valores transformados en log base 10
 */
const logBase10Tabla = (tabla: DataTable): DataTable =>
  tabla.map((fila, filaIdx) =>
    filaIdx === 0 ? fila : fila.map((valor, colIdx) =>
      colIdx === 0 ? valor : typeof valor === "number" && valor > 0 ? Math.log10(valor) : NaN
    )
  );

/**
 * Extrae los valores mínimos y máximos por columna (excepto encabezados),
 * para ser utilizados en la normalización de los datos.
 *
 * @param tabla - Tabla de datos numéricos
 * @return Objeto con arreglos de mínimos y máximos por columna
 */
const obtenerMinimosYMaximos = (tabla: DataTable): { min: number[]; max: number[] } => {
  const numCols = tabla[0].length;
  const min: number[] = [];
  const max: number[] = [];

  for (let col = 1; col < numCols; col++) {
    const valores: number[] = tabla.slice(1).map(fila => typeof fila[col] === "number" ? fila[col] as number : NaN).filter(v => !isNaN(v));
    min[col] = valores.length ? Math.min(...valores) : NaN;
    max[col] = valores.length ? Math.max(...valores) : NaN;
  }

  return { min, max };
};

/**
 * Normaliza los valores de una tabla en base a los valores mínimos y máximos por columna.
 * El resultado es una tabla con valores entre 0 y 100, representando porcentajes.
 *
 * @param tabla - Tabla de datos a normalizar
 * @param min - Valores mínimos por columna
 * @param max - Valores máximos por columna
 * @return Una nueva tabla con valores normalizados entre 0 y 100
 */
const normalizarTabla = (tabla: DataTable, min: number[], max: number[]): DataTable =>
  tabla.map((fila, filaIdx) =>
    filaIdx === 0 ? fila : fila.map((valor, colIdx) =>
      colIdx === 0 ? fila[0] :
      typeof valor !== "number" || isNaN(valor) || min[colIdx] === max[colIdx] ? NaN :
      ((valor - min[colIdx]) / (max[colIdx] - min[colIdx])) * 100
    )
  );

// Procesamiento de datos base: logarítmicos y normalizados
const logTabla = logBase10Tabla(datos);
const { min, max } = obtenerMinimosYMaximos(logTabla);
const normalizada = normalizarTabla(logTabla, min, max);

// Extrae fechas de la primera fila
const fechas: DataValue[] = datos[0].slice(1);

// Extrae métricas sin encabezado de fechas
const metricas: DataTable = datos.slice(1);

/**
 * Transforma una tabla de datos en una estructura compatible con Recharts.
 * Convierte los datos por fecha en un arreglo de objetos clave-valor.
 *
 * @param tabla - Tabla de métricas a transformar
 * @return Arreglo de puntos para usar en gráficos
 */
const transformarDatos = (tabla: DataTable): ChartDataPoint[] =>
  fechas.map((fecha, i) =>
    tabla.slice(1).reduce<ChartDataPoint>((punto, fila) => {
      const nombreMetrica = fila[0];
      if (typeof nombreMetrica === "string") punto[nombreMetrica] = fila[i + 1];
      return punto;
    }, { fecha })
  );

// Datos transformados para cada modo
const dataOriginal = transformarDatos(metricas);
const dataLogaritmica = transformarDatos(logTabla);
const dataNormalizada = transformarDatos(normalizada);

/**
 * Componente principal que muestra un gráfico de líneas en diferentes modos de visualización.
 *
 * @param modoVisualizacion - Define el tipo de escala a utilizar: original, logaritmo o normalizado
 * @return JSX.Element con gráfico de líneas interactivo
 */
const MathCalc2: React.FC<MathCalc2Props> = ({ modoVisualizacion }) => {
  /**
   * Selecciona el dataset correspondiente al modo actual.
   *
   * @return Datos a mostrar en el gráfico
   */
  const getDatos = (): ChartDataPoint[] => {
    switch (modoVisualizacion) {
      case 'logaritmo': return dataLogaritmica;
      case 'normalizado': return dataNormalizada;
      case 'original':
      default: return dataOriginal;
    }
  };

  /**
   * Define el dominio del eje Y en función del modo de visualización.
   *
   * @return Rango del eje Y
   */
  const getDomain = (): [string | number, string | number] => 
    modoVisualizacion === 'normalizado' ? [0, 100] : ['auto', 'auto'];

  // Métricas actuales a renderizar
  const metricasActuales = modoVisualizacion === 'logaritmo' ? logTabla.slice(1) :
    modoVisualizacion === 'normalizado' ? normalizada.slice(1) : metricas;

  return (
    <div className="grafico-container">
      <ResponsiveContainer width="100%" height={500}>
        <LineChart data={getDatos()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="fecha" />
          <YAxis domain={getDomain()} 
            label={{
              value: modoVisualizacion === 'logaritmo' ? 'Log₁₀(valor)' : modoVisualizacion === 'normalizado' ? 'Valor Normalizado (%)' : 'Valor',
              angle: -90,
              position: 'insideLeft'
            }}
          />
          <Tooltip 
            formatter={(value: any) => 
              typeof value === 'number' ? 
              (modoVisualizacion === 'normalizado' ? `${value.toFixed(1)}%` : value.toFixed(2)) : value}
          />
          <Legend />
          {modoVisualizacion === 'normalizado' && <ReferenceLine y={50} stroke="gray" strokeDasharray="3 3" />}
          {metricasActuales.map(([nombreMetrica], index) => (
            <Line key={String(nombreMetrica)}
              type="monotone"
              dataKey={String(nombreMetrica)}
              stroke={colores[index % colores.length]}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MathCalc2;
