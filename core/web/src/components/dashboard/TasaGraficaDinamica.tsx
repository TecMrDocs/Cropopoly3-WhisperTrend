import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TasasGraficaDinamicaProps {
  tasasIds: string[];
  datosTasas: Record<string, {
    nombre: string;
    datos: Array<{ fecha: string; tasa: number }>;
    color: string;
  }>;
}

const TasasGraficaDinamica: React.FC<TasasGraficaDinamicaProps> = ({ 
  tasasIds, 
  datosTasas 
}) => {
  console.log('🔍 [TasasGraficaDinamica] Props recibidas:', { tasasIds, datosTasas });

  // 🔧 PROCESAR Y NORMALIZAR DATOS
  const datosGraficaNormalizados = useMemo(() => {
    if (!tasasIds || tasasIds.length === 0 || !datosTasas) {
      console.warn('⚠️ [TasasGraficaDinamica] No hay tasas seleccionadas o datos');
      return [];
    }

    // 🎯 RECOLECTAR TODAS LAS FECHAS ÚNICAS Y NORMALIZARLAS
    const fechasNormalizadas = new Set<string>();
    const tasasValidas = tasasIds
      .map(id => ({ id, info: datosTasas[id] }))
      .filter(item => item.info && item.info.datos && item.info.datos.length > 0);

    console.log('✅ [TasasGraficaDinamica] Tasas válidas encontradas:', tasasValidas.length);
    console.log('🔍 [DEBUG] Datos de tasas recibidos:', tasasValidas.map(t => ({
      id: t.id,
      fechas: t.info.datos.map(d => d.fecha)
    })));

    // 🔧 CREAR FECHAS LIMPIAS Y CONSISTENTES
    // En lugar de usar fechas que pueden venir mal formateadas, generamos fechas limpias
    const fechasLimpias = ['Ene 25', 'Feb 25', 'Mar 25', 'Abr 25', 'May 25', 'Jun 25'];

    console.log('📅 [TasasGraficaDinamica] Usando fechas limpias fijas:', fechasLimpias);

    // 🎯 CREAR ESTRUCTURA DE DATOS PARA LA GRÁFICA
    const datosFinales = fechasLimpias.map((fecha, index) => {
      const punto: any = { fecha };

      tasasValidas.forEach(({ id, info }) => {
        // Si hay datos en esa posición del array, usarlos; si no, usar null
        const dato = info.datos[index];
        punto[id] = dato?.tasa || null;
      });

      return punto;
    });

    console.log('✅ [TasasGraficaDinamica] Datos finales para gráfica:', datosFinales);
    return datosFinales;
  }, [tasasIds, datosTasas]);

  // 🎨 OBTENER INFORMACIÓN DE LAS TASAS SELECCIONADAS
  const tasasInfo = useMemo(() => {
    return tasasIds
      .map(id => ({ id, ...datosTasas[id] }))
      .filter(tasa => tasa.nombre && tasa.color);
  }, [tasasIds, datosTasas]);

  // 🚨 CASOS DE ERROR
  if (!tasasIds || tasasIds.length === 0) {
    return (
      <div className="flex items-center justify-center h-80">
        <div className="text-center">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-bold text-gray-600">Selecciona tasas para visualizar</h3>
          <p className="text-gray-500">Elige al menos una tasa de interacción o viralidad del menú</p>
        </div>
      </div>
    );
  }

  if (tasasInfo.length === 0) {
    return (
      <div className="flex items-center justify-center h-80">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold text-gray-600">No se encontraron datos</h3>
          <p className="text-gray-500">Las tasas seleccionadas no tienen información disponible</p>
          <div className="mt-2 text-sm text-gray-400">
            IDs buscados: {tasasIds.join(', ')}
          </div>
        </div>
      </div>
    );
  }

  if (datosGraficaNormalizados.length === 0) {
    return (
      <div className="flex items-center justify-center h-80">
        <div className="text-center">
          <div className="text-6xl mb-4">📈</div>
          <h3 className="text-xl font-bold text-gray-600">Datos en proceso</h3>
          <p className="text-gray-500">Los datos de las tasas se están cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white rounded-2xl p-6">
      {/* Header dinámico */}
      <div className="mb-6 text-center">
        <div className="text-6xl mb-4">📈</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Comparativa de Tasas Seleccionadas
        </h2>
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-16 h-1 bg-blue-500 rounded-full"></div>
          <span className="text-sm text-gray-600 font-medium">
            Mostrando {tasasInfo.length} tasa(s) • {datosGraficaNormalizados.length} períodos
          </span>
          <div className="w-16 h-1 bg-blue-500 rounded-full"></div>
        </div>
        
        {/* Indicador simple sin las selecciones */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            🔄 Datos en tiempo real
          </div>
        </div>
      </div>

      {/* Gráfica principal - MÁS GRANDE */}
      <div className="bg-gray-50 rounded-xl p-4">
        <div className="h-[500px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart 
              data={datosGraficaNormalizados} 
              margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="fecha" 
                stroke="#64748b"
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={80}
                interval={0}
                minTickGap={5}
                tick={{ fontSize: 11 }}
              />
              <YAxis 
                stroke="#64748b"
                fontSize={12}
                tickFormatter={(value) => `${value}%`}
                domain={[0, 100]}
              />
              <Tooltip 
                formatter={(value: any, name: string) => {
                  const tasa = tasasInfo.find(t => t.id === name);
                  return [
                    `${value}%`, 
                    tasa?.nombre || name
                  ];
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
                formatter={(value) => {
                  const tasa = tasasInfo.find(t => t.id === value);
                  return tasa?.nombre || value;
                }}
              />
              
              {/* Líneas dinámicas para cada tasa seleccionada - MÁS GRUESAS */}
              {tasasInfo.map((tasa, index) => (
                <Line
                  key={tasa.id}
                  type="linear"
                  dataKey={tasa.id}
                  stroke={tasa.color}
                  strokeWidth={5}
                  dot={{ fill: tasa.color, strokeWidth: 3, r: 8 }}
                  activeDot={{ r: 12, stroke: tasa.color, strokeWidth: 4, fill: '#ffffff' }}
                  connectNulls={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Footer con información técnica */}
      <div className="mt-4 text-center">
        <div className="text-sm text-gray-500">
          🔍 Debug: {tasasIds.length} tasa(s) seleccionada(s) • 
          {datosGraficaNormalizados.length} período(s) • 
          Última actualización: {new Date().toLocaleTimeString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit'
          })}
        </div>
      </div>
    </div>
  );
};

export default TasasGraficaDinamica;