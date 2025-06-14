/**
 * Componente React que muestra una gráfica de tendencias de métricas con opciones
 * para visualizar datos en escala original, logarítmica o normalizada.
 * Utiliza la librería recharts para renderizar líneas y un diseño basado en tarjetas.
 * 
 * Autor: Sebastián Antonio Almanza
 */

import React from 'react';
import { TrendingUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

type DataValue = string | number;
type DataRow = DataValue[];
type DataTable = DataRow[];
type ChartDataPoint = { [key: string]: DataValue };

/**
 * Props del componente PlotTrend
 * @property {'original' | 'logaritmo' | 'normalizado'} modoVisualizacion - Define la escala para la gráfica
 */
interface PlotTrendProps {
  modoVisualizacion: 'original' | 'logaritmo' | 'normalizado';
}

const colores = ["#8884d8", "#82ca9d", "#ffc658", "#ff6384", "#00c49f", "#ff8042"];


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
 * Aplica logaritmo base 10 a todos los valores numéricos positivos de la tabla, 
 * dejando sin cambio los encabezados (primera fila y primera columna).
 * 
 * @param {DataTable} tabla - Tabla de datos a transformar
 * @returns {DataTable} - Nueva tabla con valores transformados
 */
const logBase10Tabla = (tabla: DataTable): DataTable =>
  tabla.map((fila, filaIdx) =>
    filaIdx === 0 ? fila : fila.map((valor, colIdx) =>
      colIdx === 0 ? valor : typeof valor === "number" && valor > 0 ? Math.log10(valor) : NaN
    )
  );

/**
 * Obtiene el mínimo y máximo valor por cada columna (ignorando encabezados y valores no numéricos)
 * 
 * @param {DataTable} tabla - Tabla de datos numéricos
 * @returns {{min: number[], max: number[]}} - Objetos con arrays de mínimos y máximos por columna
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
 * Normaliza los valores numéricos de la tabla para cada columna, transformándolos a un rango 0-100
 * con base en los valores mínimos y máximos de cada columna.
 * 
 * @param {DataTable} tabla - Tabla con datos a normalizar
 * @param {number[]} min - Valores mínimos por columna
 * @param {number[]} max - Valores máximos por columna
 * @returns {DataTable} - Tabla normalizada
 */
const normalizarTabla = (tabla: DataTable, min: number[], max: number[]): DataTable =>
  tabla.map((fila, filaIdx) =>
    filaIdx === 0 ? fila : fila.map((valor, colIdx) =>
      colIdx === 0 ? fila[0] :
      typeof valor !== "number" || isNaN(valor) || min[colIdx] === max[colIdx] ? NaN :
      ((valor - min[colIdx]) / (max[colIdx] - min[colIdx])) * 100
    )
  );

// Preparación de datos derivados para la gráfica
const logTabla = logBase10Tabla(datos);
const { min, max } = obtenerMinimosYMaximos(logTabla);
const normalizada = normalizarTabla(logTabla, min, max);

const fechas: DataValue[] = datos[0].slice(1);
const metricas: DataTable = datos.slice(1);

/**
 * Transforma una tabla en un arreglo de objetos con clave "fecha" y claves para cada métrica con sus valores
 * 
 * @param {DataTable} tabla - Tabla de métricas para transformar
 * @returns {ChartDataPoint[]} - Arreglo de puntos para graficar
 */
const transformarDatos = (tabla: DataTable): ChartDataPoint[] =>
  fechas.map((fecha, i) =>
    tabla.slice(1).reduce<ChartDataPoint>((punto, fila) => {
      const nombreMetrica = fila[0];
      if (typeof nombreMetrica === "string") punto[nombreMetrica] = fila[i + 1];
      return punto;
    }, { fecha })
  );

// Datos preparados para cada modo de visualización
const dataOriginal = transformarDatos(metricas);
const dataLogaritmica = transformarDatos(logTabla);
const dataNormalizada = transformarDatos(normalizada);

/**
 * Componente principal que renderiza la gráfica con las métricas según el modo de visualización seleccionado.
 * 
 * @param {PlotTrendProps} props - Propiedades del componente
 * @returns {JSX.Element} - Componente React con la gráfica
 */
const PlotTrend: React.FC<PlotTrendProps> = ({modoVisualizacion}) => {
  /**
   * Obtiene los datos a mostrar en la gráfica según el modo seleccionado
   * @returns {ChartDataPoint[]} Datos procesados para graficar
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
   * Define el dominio del eje Y dependiendo del modo de visualización
   * @returns {[string | number, string | number]} Dominio para el eje Y
   */
  const getDomain = (): [string | number, string | number] => 
    modoVisualizacion === 'normalizado' ? [0, 100] : ['auto', 'auto'];

  // Métricas actuales para configurar las líneas y leyendas
  const metricasActuales = modoVisualizacion === 'logaritmo' ? logTabla.slice(1) :
    modoVisualizacion === 'normalizado' ? normalizada.slice(1) : metricas;

  // Configuración para la leyenda y colores de cada métrica
  const chartConfig: ChartConfig = metricasActuales.reduce((config, [nombreMetrica]) => ({
    ...config,
    [String(nombreMetrica)]: {
      label: String(nombreMetrica),
      color: colores[Object.keys(config).length % colores.length],
    }
  }), {});

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tendencias de Métricas</CardTitle>
        <CardDescription>
          {fechas[0]} - {fechas[fechas.length - 1]}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={getDatos()}
            margin={{
              left: 12,
              right: 12,
              top: 12,
              bottom: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="fecha"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.split(' - ')[0]}
            />
            <YAxis
              domain={getDomain()}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            {metricasActuales.map(([nombreMetrica], index) => (
              <Line
                key={String(nombreMetrica)}
                dataKey={String(nombreMetrica)}
                type="linear"
                stroke={colores[index % colores.length]}
                strokeWidth={2}
                dot={false}
              />
            ))}
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Análisis de tendencias <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Visualización en {modoVisualizacion === 'logaritmo' ? 'escala logarítmica' : 
            modoVisualizacion === 'normalizado' ? 'valores normalizados' : 'valores originales'}
        </div>
      </CardFooter>
    </Card>
  );
};

export default PlotTrend;
