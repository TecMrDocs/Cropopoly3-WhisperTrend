import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TasasGraficaDinamicaProps {
  tasasIds: string[];
  datosTasas: any;
}

const TasasGraficaDinamica: React.FC<TasasGraficaDinamicaProps> = ({ tasasIds, datosTasas }) => {
  

  // Procesar datos para la gráfica
  const datosParaGrafica = useMemo(() => {
    if (!tasasIds || tasasIds.length === 0) {
      return [];
    }

    // Obtener todas las fechas únicas
    const todasFechas = new Set<string>();
    tasasIds.forEach(tasaId => {
      const dataTasa = datosTasas[tasaId];
      if (dataTasa && dataTasa.datos) {
        dataTasa.datos.forEach((punto: any) => {
          todasFechas.add(punto.fecha);
        });
      }
    });

    const fechasOrdenadas = Array.from(todasFechas).sort();

    // Crear datos combinados
    return fechasOrdenadas.map(fecha => {
      const punto: any = { fecha };
      
      tasasIds.forEach(tasaId => {
        const dataTasa = datosTasas[tasaId];
        if (dataTasa && dataTasa.datos) {
          const datoFecha = dataTasa.datos.find((d: any) => d.fecha === fecha);
          punto[tasaId] = datoFecha ? datoFecha.tasa : 0;
        }
      });
      
      return punto;
    });
  }, [tasasIds, datosTasas]);

  // Generar información de las líneas
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

      // Simplificar el nombre quitando las etiquetas de hashtags
      let nombreSimplificado = dataTasa.nombre || tasaId;
      
      // Quitar referencias específicas a hashtags (todo después del emoji de plataforma)
      if (nombreSimplificado.includes('📸')) {
        nombreSimplificado = nombreSimplificado.split('📸')[0].trim() + ' 📸';
      } else if (nombreSimplificado.includes('🔴')) {
        nombreSimplificado = nombreSimplificado.split('🔴')[0].trim() + ' 🔴';
      } else if (nombreSimplificado.includes('🐦')) {
        nombreSimplificado = nombreSimplificado.split('🐦')[0].trim() + ' 🐦';
      }
      
      // Remover hashtags específicos del nombre
      nombreSimplificado = nombreSimplificado
        .replace(/#\w+\s*/g, '') // Quitar hashtags
        .replace(/\s+/g, ' ') // Normalizar espacios
        .trim();

      return {
        id: tasaId,
        nombre: nombreSimplificado,
        color: dataTasa.color || '#3b82f6'
      };
    });
  }, [tasasIds, datosTasas]);

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

  return (
    <div className="w-full">
      {/* Header más compacto */}
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
        
        {/* Indicador de datos en tiempo real */}
        <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          🔄 Datos en tiempo real
        </div>
      </div>

      {/* Gráfica más grande */}
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
            
            {/* Renderizar líneas dinámicamente */}
            {lineasInfo.map((linea, index) => (
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

      {/* Footer con estadísticas 
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-4 shadow border border-gray-100 text-center">
          <div className="text-2xl mb-2">📊</div>
          <div className="text-lg font-bold text-blue-600">
            {tasasIds.length}
          </div>
          <div className="text-sm text-gray-600">Tasas activas</div>
        </div>
        
        <div className="bg-white rounded-lg p-4 shadow border border-gray-100 text-center">
          <div className="text-2xl mb-2">📅</div>
          <div className="text-lg font-bold text-green-600">
            {datosParaGrafica.length}
          </div>
          <div className="text-sm text-gray-600">Períodos analizados</div>
        </div>
        
        <div className="bg-white rounded-lg p-4 shadow border border-gray-100 text-center">
          <div className="text-2xl mb-2">🎯</div>
          <div className="text-lg font-bold text-purple-600">
            {lineasInfo.length}
          </div>
          <div className="text-sm text-gray-600">Líneas de tendencia</div>
        </div>
      </div>

      */}

     
    {/* ✅ COMENTADO - NO SE MOSTRARÁN LOS IDS LARGOS
    <div className="text-xs font-mono text-gray-500 bg-white p-2 rounded">
      {JSON.stringify(tasasIds, null, 2)}
    </div>
    */}
    
    </div>
  );
};

export default TasasGraficaDinamica;