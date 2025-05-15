import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  CartesianGrid, ReferenceLine
} from 'recharts';

interface PromedioPorPeriodo {
  periodo: string;
  promedio: number;
}

const datosNormalizados = [
  ["Tasa Interacción X", 59.71584328, 27.89294126, 44.09088598, 0.21389545],
  ["Tasa Viralidad X", 30.83522961, 28.16962078, 28.90864849, 100],
  ["Tasa Interacción Instagram", 57.55587114, 100, 61.58059578, 50.34061158],
  ["Tasa Viralidad Instagram", 100, 93.3525156, 100, 54.13659347],
  ["Tasa interacción Reddit", 0, 23.4750867, 0, 0],
  ["Tasa viralidad reddit", 2.92743244, 0, 11.89992986, 6.53527224]
];

const periodos = [
  "01/01/25 - 31/01/25", 
  "01/02/25 - 28/02/25", 
  "01/03/25 - 31/03/25", 
  "01/04/25 - 19/04/25"
];

const calcularPromedioGeneral = (): PromedioPorPeriodo[] => {
  const promediosPorPeriodo: PromedioPorPeriodo[] = [];
  
  for (let colIndex = 1; colIndex <= 4; colIndex++) {
    const valoresPeriodo = datosNormalizados.map(fila => Number(fila[colIndex]));
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

const TendenciaUniforme = () => {
  return (
    <div className="grafico-container">
      <h2 className="text-xl font-bold text-center mb-4">Promedio General de Todas las Métricas</h2>
      <ResponsiveContainer width="100%" height={500}>
        <LineChart data={datosPromedio} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
          <CartesianGrid strokeDasharray="3 3" />
<XAxis 
  dataKey="periodo"
  height={60}
/>
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
            stroke="#8884d8" 
            strokeWidth={3}
            name="Promedio General de Métricas"
            dot={{ r: 6 }} 
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="mt-4 p-4 bg-gray-100 rounded">
        <p className="text-sm"><strong>Descripción:</strong> Este gráfico muestra el promedio general de todas las métricas normalizadas para cada período de tiempo. Representa una visión global del rendimiento de todas las métricas combinadas.</p>
      </div>
    </div>
  );
};

export default TendenciaUniforme;
