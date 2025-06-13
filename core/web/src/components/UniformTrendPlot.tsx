/**
 * Componente React que muestra un gráfico de líneas con el promedio de métricas
 * relacionadas a distintos tipos de tendencias (ventas, hashtags, noticias).
 * Permite visualizar promedios por periodos y comparar diferentes categorías
 * de datos con su respectiva descripción y color.
 * 
 * Autor: Sebastián Antonio Almanza
 * Contribuyentes: -
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
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

interface PromedioPorPeriodo {
  periodo: string;
  promedio: number;
}

interface UniformTrendPlotProps {
  tipo?: 'ventas' | 'hashtag1' | 'hashtag2' | 'hashtag3' | 'noticia1' | 'noticia2' | 'noticia3';
}


const datosPorTipo = {
  ventas: [
    ["Ventas", 75.32, 82.45, 68.90, 91.75],
    ["Tendencia", 72.85, 80.12, 65.43, 90.21],
    ["Proyección", 78.45, 84.67, 70.12, 93.54],
    ["Estacionalidad", 65.78, 75.32, 62.90, 85.43]
  ],
  hashtag1: [
    ["Tasa Interacción X", 59.71584328, 27.89294126, 44.09088598, 0.21389545],
    ["Tasa Viralidad X", 30.83522961, 28.16962078, 28.90864849, 100],
    ["Tasa Interacción Instagram", 57.55587114, 100, 61.58059578, 50.34061158],
    ["Tasa Viralidad Instagram", 100, 93.3525156, 100, 54.13659347],
    ["Tasa interacción Reddit", 0, 23.4750867, 0, 0],
    ["Tasa viralidad reddit", 2.92743244, 0, 11.89992986, 6.53527224]
  ],
  hashtag2: [
    ["Tasa Interacción X", 45.20, 67.30, 22.50, 78.10],
    ["Tasa Viralidad X", 25.40, 88.20, 32.70, 55.90],
    ["Tasa Interacción Instagram", 77.80, 45.60, 91.30, 62.40],
    ["Tasa Viralidad Instagram", 81.20, 67.90, 52.40, 88.70],
    ["Tasa interacción Reddit", 12.50, 44.80, 9.20, 33.60],
    ["Tasa viralidad reddit", 18.70, 25.90, 42.30, 11.80]
  ],
  hashtag3: [
    ["Tasa Interacción X", 33.40, 18.70, 65.90, 44.20],
    ["Tasa Viralidad X", 54.70, 39.80, 48.60, 27.30],
    ["Tasa Interacción Instagram", 42.60, 75.30, 36.90, 81.40],
    ["Tasa Viralidad Instagram", 62.80, 39.10, 74.60, 45.80],
    ["Tasa interacción Reddit", 28.40, 15.70, 36.90, 22.40],
    ["Tasa viralidad reddit", 31.60, 47.80, 19.20, 36.50]
  ],
  noticia1: [
    ["Impacto", 78.90, 45.60, 33.20, 67.80],
    ["Alcance", 42.30, 79.40, 56.10, 23.70],
    ["Engagement", 64.50, 33.20, 88.90, 45.10],
    ["Menciones", 53.20, 68.70, 41.50, 77.90]
  ],
  noticia2: [
    ["Impacto", 55.30, 72.10, 38.60, 49.70],
    ["Alcance", 37.80, 62.40, 45.90, 33.20],
    ["Engagement", 88.70, 56.30, 43.80, 71.20],
    ["Menciones", 47.20, 73.90, 61.40, 39.60]
  ],
  noticia3: [
    ["Impacto", 41.20, 63.80, 27.90, 54.10],
    ["Alcance", 59.60, 36.40, 72.30, 48.50],
    ["Engagement", 37.90, 82.40, 53.60, 29.70],
    ["Menciones", 75.30, 44.60, 38.20, 66.90]
  ]
};


const titulos = {
  ventas: 'Tendencia de ventas para Bolso Marianne',
  hashtag1: '#EcoFriendly - Correlación: 91%',
  hashtag2: '#SustainableFashion - Correlación: 82%',
  hashtag3: '#NuevosMateriales - Correlación: 70%',
  noticia1: 'Moda sostenible en auge',
  noticia2: 'Materiales reciclados en bolsos',
  noticia3: 'Tendencias eco para 2025'
};


const colores = {
  ventas: '#0891b2',
  hashtag1: '#16a34a',
  hashtag2: '#60a5fa',
  hashtag3: '#94a3b8',
  noticia1: '#a855f7',
  noticia2: '#fbbf24',
  noticia3: '#14b8a6'
};


const descripciones = {
  ventas: 'Este gráfico muestra la tendencia de ventas del producto, analizando diferentes métricas relacionadas con los ingresos y unidades vendidas.',
  hashtag1: 'Este gráfico muestra el promedio de las métricas relacionadas con #EcoFriendly en redes sociales, que tiene una alta correlación (91%) con las ventas del producto.',
  hashtag2: 'Este gráfico muestra el promedio de las métricas relacionadas con #SustainableFashion, que presenta una correlación notable (82%) con las ventas del producto.',
  hashtag3: 'Este gráfico muestra el promedio de las métricas relacionadas con #NuevosMateriales, que tiene una correlación moderada (70%) con las ventas del producto.',
  noticia1: 'Este gráfico analiza el impacto de las noticias sobre "Moda sostenible en auge" y cómo influyen en la percepción de los consumidores.',
  noticia2: 'Este gráfico evalúa cómo las noticias sobre "Materiales reciclados en bolsos" están generando interés en el mercado.',
  noticia3: 'Este gráfico muestra la tendencia relacionada con noticias sobre "Tendencias eco para 2025" y su impacto en las preferencias de consumo futuras.'
};


const periodos = [
  "01/01/25 - 31/01/25",
  "01/02/25 - 28/02/25",
  "01/03/25 - 31/03/25",
  "01/04/25 - 19/04/25"
];

/**
 * Componente principal que renderiza un gráfico de línea con el promedio de valores
 * calculados para el tipo seleccionado, mostrando título, descripción y leyenda.
 * 
 * @param {UniformTrendPlotProps} props Objeto con la propiedad opcional 'tipo' para seleccionar la categoría de datos a mostrar.
 * @returns {JSX.Element} Elemento React que contiene la visualización del gráfico con datos promediados.
 */
const UniformTrendPlot: React.FC<UniformTrendPlotProps> = ({
  tipo = 'hashtag1'
}) => {

  const datosActuales = datosPorTipo[tipo];

  /**
   * Calcula el promedio general para cada periodo, sumando los valores
   * de todas las filas en ese periodo y dividiendo entre la cantidad de filas.
   * 
   * @returns {PromedioPorPeriodo[]} Arreglo con el promedio calculado para cada periodo.
   */
  const calcularPromedioGeneral = (): PromedioPorPeriodo[] => {
    const promediosPorPeriodo: PromedioPorPeriodo[] = [];

    for (let colIndex = 1; colIndex <= 4; colIndex++) {
      const valoresPeriodo = datosActuales.map(fila => Number(fila[colIndex]));
      const suma = valoresPeriodo.reduce((acc, curr) => acc + curr, 0);
      const promedio = suma / valoresPeriodo.length;

      promediosPorPeriodo.push({
        periodo: periodos[colIndex - 1],
        promedio
      });
    }

    return promediosPorPeriodo;
  };

  const datosPromedio = calcularPromedioGeneral();
  const titulo = titulos[tipo];
  const color = colores[tipo];
  const descripcion = descripciones[tipo];

  /**
   * Transformación de los datos promedio para adaptarlos
   * a la estructura requerida por el componente LineChart.
   */
  const chartData = datosPromedio.map(item => ({
    periodo: item.periodo,
    promedio: item.promedio
  }));


  const chartConfig: ChartConfig = {
    promedio: {
      label: "Promedio",
      color: color
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{titulo}</CardTitle>
        <CardDescription>{descripcion}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
              top: 12,
              bottom: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="periodo"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.split(' - ')[0]}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Line
              dataKey="promedio"
              type="linear"
              stroke={color}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Análisis de tendencias <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Visualización de promedios por período
        </div>
      </CardFooter>
    </Card>
  );
}

export default UniformTrendPlot;
