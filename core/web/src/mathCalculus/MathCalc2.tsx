import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  CartesianGrid, ReferenceLine
} from 'recharts';

// Tipos
type DataValue = string | number;
type DataRow = DataValue[];
type DataTable = DataRow[];
type ChartDataPoint = { [key: string]: DataValue };

// Props del componente
interface MathCalc2Props {
  modoVisualizacion: 'original' | 'logaritmo' | 'normalizado';
}
const colores = ["#8884d8", "#82ca9d", "#ffc658", "#ff6384", "#00c49f", "#ff8042"];

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
const logBase10Tabla = (tabla: DataTable): DataTable =>
  tabla.map((fila, filaIdx) =>
    filaIdx === 0 ? fila : fila.map((valor, colIdx) =>
      colIdx === 0 ? valor : typeof valor === "number" && valor > 0 ? Math.log10(valor) : NaN
    )
  );

// Función para obtener mínimos y máximos por columna
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

// Función de normalización
const normalizarTabla = (tabla: DataTable, min: number[], max: number[]): DataTable =>
  tabla.map((fila, filaIdx) =>
    filaIdx === 0 ? fila : fila.map((valor, colIdx) =>
      colIdx === 0 ? fila[0] :
      typeof valor !== "number" || isNaN(valor) || min[colIdx] === max[colIdx] ? NaN :
      ((valor - min[colIdx]) / (max[colIdx] - min[colIdx])) * 100
    )
  );

// Preparar datos
const logTabla = logBase10Tabla(datos);
const { min, max } = obtenerMinimosYMaximos(logTabla);
const normalizada = normalizarTabla(logTabla, min, max);

const fechas: DataValue[] = datos[0].slice(1);
const metricas: DataTable = datos.slice(1);

const transformarDatos = (tabla: DataTable): ChartDataPoint[] =>
  fechas.map((fecha, i) =>
    tabla.slice(1).reduce<ChartDataPoint>((punto, fila) => {
      const nombreMetrica = fila[0];
      if (typeof nombreMetrica === "string") punto[nombreMetrica] = fila[i + 1];
      return punto;
    }, { fecha })
  );


const dataOriginal = transformarDatos(metricas);
const dataLogaritmica = transformarDatos(logTabla);
const dataNormalizada = transformarDatos(normalizada);

// Colores para líneas

const MathCalc2: React.FC<MathCalc2Props> = ({ modoVisualizacion }) => {
  const getDatos = (): ChartDataPoint[] => {
    switch (modoVisualizacion) {
      case 'logaritmo': return dataLogaritmica;
      case 'normalizado': return dataNormalizada;
      case 'original':
      default: return dataOriginal;
    }
  };

  const getDomain = (): [string | number, string | number] => 
    modoVisualizacion === 'normalizado' ? [0, 100] : ['auto', 'auto'];

  const metricasActuales = modoVisualizacion === 'logaritmo' ? logTabla.slice(1) :
    modoVisualizacion === 'normalizado' ? normalizada.slice(1) : metricas;

  return (
    <div className="grafico-container">
      <ResponsiveContainer width="100%" height={500}>
        <LineChart data={getDatos()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="fecha" />
          <YAxis domain={getDomain()} />
          <Tooltip />
          <Legend />
          {modoVisualizacion === 'normalizado' && <ReferenceLine y={50} stroke="gray" strokeDasharray="3 3" />}
          {metricasActuales.map(([nombreMetrica], index) => (
            <Line key={String(nombreMetrica)}
              type="monotone"
              dataKey={String(nombreMetrica)}
              stroke={colores[index % colores.length]}
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
