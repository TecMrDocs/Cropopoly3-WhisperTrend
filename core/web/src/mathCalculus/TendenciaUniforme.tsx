import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  CartesianGrid, ReferenceLine
} from 'recharts';

interface PromedioPorPeriodo {
  periodo: string;
  promedio: number;
}

interface TendenciaUniformeProps {
  tipo?: 'ventas' | 'hashtag1' | 'hashtag2' | 'hashtag3' | 'noticia1' | 'noticia2' | 'noticia3';
}

// Datos específicos para cada tipo
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

// Títulos para cada tipo
const titulos = {
  ventas: 'Tendencia de ventas para Bolso Marianne',
  hashtag1: '#EcoFriendly - Correlación: 91%',
  hashtag2: '#SustainableFashion - Correlación: 82%',
  hashtag3: '#NuevosMateriales - Correlación: 70%',
  noticia1: 'Moda sostenible en auge',
  noticia2: 'Materiales reciclados en bolsos',
  noticia3: 'Tendencias eco para 2025'
};

// Colores para cada tipo
const colores = {
  ventas: '#0891b2',
  hashtag1: '#16a34a',
  hashtag2: '#60a5fa',
  hashtag3: '#94a3b8',
  noticia1: '#a855f7',
  noticia2: '#fbbf24',
  noticia3: '#14b8a6'
};

// Descripciones para cada tipo
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

const TendenciaUniforme: React.FC<TendenciaUniformeProps> = ({ tipo = 'hashtag1' }) => {
  // Obtener los datos correspondientes al tipo
  const datosActuales = datosPorTipo[tipo];
  
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

  return (
    <div className="grafico-container">
      <h2 className="text-xl font-bold text-center mb-4">{titulo}</h2>
      <ResponsiveContainer width="100%" height={500}>
        <LineChart data={datosPromedio} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="periodo" height={60} />
          <YAxis domain={[0, 100]} />
          <Tooltip 
            formatter={(valor) => {
              if (typeof valor === 'number') {
                return [valor.toFixed(2), "Promedio General"];
              }
              return [valor, "Promedio General"];
            }}
            labelFormatter={(periodo) => `Período: ${periodo}`}
          />
          <Legend />
          <ReferenceLine y={50} stroke="gray" strokeDasharray="3 3" />
          <Line
            type="monotone"
            dataKey="promedio"
            stroke={color}
            strokeWidth={3}
            name="Promedio General de Métricas"
            dot={{ r: 6 }}
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="mt-4 p-4 bg-gray-100 rounded">
        <p className="text-sm"><strong>Descripción:</strong> {descripcion}</p>
      </div>
    </div>
  );
};

export default TendenciaUniforme;