/**
 * Componente dinámico de gráfica de líneas que muestra la comparación de tasas seleccionadas
 * a lo largo del tiempo, con soporte para múltiples series (líneas) e identificación visual 
 * por color y nombre simplificado.
 * 
 * Utiliza `recharts` para renderizar la gráfica y `useMemo` para optimizar cálculos.
 *
 * Autor: Sebastian Antonio Almanza
 * Contribuyentes: Lucio Reyes Castillo (Graph optimization), Andrés Cabrera Alvarado (documentación)
 */

import React, { useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer
} from 'recharts';

interface TasasGraficaDinamicaProps {
  tasasIds: string[];
  datosTasas: any;
}

const TasasGraficaDinamica: React.FC<TasasGraficaDinamicaProps> = ({ tasasIds, datosTasas }) => {

  /**
   * Ordena un arreglo de fechas en formato "Mes Año" (ej. "Ene 25") en orden cronológico
   * usando un mapa de meses personalizados.
   * 
   * @param fechas - Arreglo de fechas en formato corto de mes y año (ej. "Feb 25")
   * @return Arreglo de fechas ordenadas cronológicamente por mes
   */
  const ordenarFechas = (fechas: string[]): string[] => {
    const ordenMeses: Record<string, number> = {
      'Ene': 1, 'Feb': 2, 'Mar': 3, 'Abr': 4, 'May': 5, 'Jun': 6,
      'Jul': 7, 'Ago': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dic': 12
    };

    return fechas.sort((a, b) => {
      const mesA = a.split(' ')[0];
      const mesB = b.split(' ')[0];
      const ordenA = ordenMeses[mesA] || 999;
      const ordenB = ordenMeses[mesB] || 999;
      return ordenA - ordenB;
    });
  };

  /**
   * Procesa los datos de entrada para crear un arreglo de objetos que representan
   * los puntos en el tiempo para cada tasa, listos para ser consumidos por el gráfico.
   *
   * @return Arreglo de objetos, cada uno con fecha y valores de tasa por ID
   */
  const datosParaGrafica = useMemo(() => {
    if (!tasasIds || tasasIds.length === 0) {
      console.log('⚠️ [TasasGrafica] No hay tasas seleccionadas');
      return [];
    }

    const todasFechas = new Set<string>();
    tasasIds.forEach(tasaId => {
      const dataTasa = datosTasas[tasaId];
      if (dataTasa?.datos) {
        dataTasa.datos.forEach((punto: any) => {
          todasFechas.add(punto.fecha);
        });
      }
    });

    const fechasOrdenadas = ordenarFechas(Array.from(todasFechas));
    console.log('📅 [TasasGrafica] Fechas ordenadas:', fechasOrdenadas);

    const datosCombinados = fechasOrdenadas.map((fecha, index) => {
      const punto: any = { fecha, orden: index };
      tasasIds.forEach(tasaId => {
        const dataTasa = datosTasas[tasaId];
        const datoFecha = dataTasa?.datos?.find((d: any) => d.fecha === fecha);
        punto[tasaId] = datoFecha ? datoFecha.tasa : 0;
      });
      return punto;
    });

    return datosCombinados;
  }, [tasasIds, datosTasas]);

  /**
   * Genera la información visual de cada línea a partir de los datos de tasa,
   * incluyendo color personalizado y nombre limpio (sin hashtags o emojis redundantes).
   *
   * @return Arreglo de objetos con id, nombre y color para cada línea del gráfico
   */
  const lineasInfo = useMemo(() => {
    return tasasIds.map(tasaId => {
      const dataTasa = datosTasas[tasaId];
      if (!dataTasa) {
        return {
          id: tasaId,
          nombre: tasaId,
          color: '#94a3b8'
        };
      }

      let nombreSimplificado = dataTasa.nombre || tasaId;

      if (nombreSimplificado.includes('📸')) {
        nombreSimplificado = nombreSimplificado.split('📸')[0].trim() + ' 📸';
      } else if (nombreSimplificado.includes('🔴')) {
        nombreSimplificado = nombreSimplificado.split('🔴')[0].trim() + ' 🔴';
      } else if (nombreSimplificado.includes('🐦')) {
        nombreSimplificado = nombreSimplificado.split('🐦')[0].trim() + ' 🐦';
      }

      nombreSimplificado = nombreSimplificado
        .replace(/#\w+\s*/g, '')
        .replace(/\s+/g, ' ')
        .trim();

      return {
        id: tasaId,
        nombre: nombreSimplificado,
        color: dataTasa.color || '#3b82f6'
      };
    });
  }, [tasasIds, datosTasas]);

  /**
   * Renderiza un mensaje de aviso cuando no hay datos seleccionados para mostrar.
   * 
   * @return JSX con mensaje de “no hay datos”
   */
  if (datosParaGrafica.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-bold text-gray-600">No hay datos para mostrar</h3>
          <p className="text-gray-500 mt-2">
            Selecciona al menos una tasa para visualizar
          </p>
        </div>
      </div>
    );
  }

  /**
   * Renderiza el componente gráfico de líneas usando Recharts con los datos procesados.
   * Incluye ejes, leyenda, tooltips y múltiples líneas personalizadas.
   * 
   * @return JSX que representa la gráfica con datos y leyenda
   */
  return (
    <div className="w-full">
      <div className="text-center mb-6">
        <div className="text-4xl mb-3">📈</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          Comparativa de Tasas Seleccionadas
        </h2>
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-12 h-1 bg-blue-500 rounded-full"></div>
          <span className="text-sm text-gray-600 font-medium">
            Mostrando {tasasIds.length} tasa(s) • {datosParaGrafica.length} períodos
          </span>
          <div className="w-12 h-1 bg-blue-500 rounded-full"></div>
        </div>
      </div>

      <div className="w-full h-[600px] bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart 
            data={datosParaGrafica} 
            margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
          >
            <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
            <XAxis 
              dataKey="fecha"
              stroke="#64748b"
              fontSize={12}
              angle={-45}
              textAnchor="end"
              height={80}
              interval={0}
              domain={['dataMin', 'dataMax']}
            />
            <YAxis 
              stroke="#64748b"
              fontSize={12}
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip 
              formatter={(value: any, name: string) => {
                const lineaInfo = lineasInfo.find(l => l.id === name);
                const nombreDisplay = lineaInfo?.nombre || name;
                return [`${value}%`, nombreDisplay];
              }}
              labelFormatter={(label) => `Período: ${label}`}
              contentStyle={{
                backgroundColor: '#f8fafc',
                border: '2px solid #3b82f6',
                borderRadius: '12px',
                fontSize: '14px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
              }}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              formatter={(value, entry) => {
                const lineaInfo = lineasInfo.find(l => l.id === value);
                return lineaInfo?.nombre || value;
              }}
            />
            {lineasInfo.map((linea) => (
              <Line
                key={linea.id}
                type="linear"
                dataKey={linea.id}
                stroke={linea.color}
                strokeWidth={3}
                dot={{ fill: linea.color, strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, stroke: linea.color, strokeWidth: 3, fill: '#ffffff' }}
                connectNulls={false}
                name={linea.id}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TasasGraficaDinamica;
