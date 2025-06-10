import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, Area, AreaChart } from 'recharts';

// 🆕 TIPO PARA LOS DATOS DE VENTAS
interface DatoVenta {
  id: number;
  month: number;
  year: number;
  units_sold: number;
  resource_id: number;
}

interface VentasCalcProps {
  datosVentas?: DatoVenta[];
  resourceName?: string;
}

const VentasCalc: React.FC<VentasCalcProps> = ({ datosVentas = [], resourceName = 'Producto' }) => {
  console.log('📊 [VentasCalc] Datos recibidos:', datosVentas);

  // 🆕 PROCESAR DATOS DINÁMICOS
  const datosGrafica = useMemo(() => {
    if (!datosVentas || datosVentas.length === 0) {
      console.log('⚠️ [VentasCalc] No hay datos, usando fallback');
      
      // Datos de fallback si no hay datos reales
      return [
        { periodo: 'Ene 2024', ventas: 0, tendencia: 'Sin datos', mes: 1, año: 2024, id: 0 },
        { periodo: 'Feb 2024', ventas: 0, tendencia: 'Sin datos', mes: 2, año: 2024, id: 0 },
        { periodo: 'Mar 2024', ventas: 0, tendencia: 'Sin datos', mes: 3, año: 2024, id: 0 },
      ];
    }

    // 🚀 PROCESAR DATOS REALES
    const datosOrdenados = [...datosVentas].sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });

    console.log('📊 [VentasCalc] Datos ordenados:', datosOrdenados);

    return datosOrdenados.map((venta, index) => {
      // Convertir número de mes a nombre
      const nombresMeses = [
        'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
        'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
      ];
      
      const nombreMes = nombresMeses[venta.month - 1] || `Mes ${venta.month}`;
      const periodo = `${nombreMes} ${venta.year}`;
      
      // Calcular tendencia comparando con el mes anterior
      let tendencia = 'Estable';
      if (index > 0) {
        const ventaAnterior = datosOrdenados[index - 1];
        if (venta.units_sold > ventaAnterior.units_sold) {
          tendencia = 'Subiendo';
        } else if (venta.units_sold < ventaAnterior.units_sold) {
          tendencia = 'Bajando';
        }
      } else {
        tendencia = 'Inicial';
      }

      return {
        periodo,
        ventas: venta.units_sold,
        tendencia,
        mes: venta.month,
        año: venta.year,
        id: venta.id
      };
    });
  }, [datosVentas]);

  // 🆕 CALCULAR ESTADÍSTICAS
  const estadisticas = useMemo(() => {
    if (datosGrafica.length === 0 || datosGrafica.every(item => item.ventas === 0)) {
      return {
        totalVentas: 0,
        promedioMensual: 0,
        mejorMes: 'N/A',
        peorMes: 'N/A',
        tendenciaGeneral: 'Sin datos',
        crecimientoTotal: 0,
        ventaMaxima: 0,
        ventaMinima: 0
      };
    }

    const ventasValidas = datosGrafica.filter(item => item.ventas > 0);
    const totalVentas = ventasValidas.reduce((sum, item) => sum + item.ventas, 0);
    const promedioMensual = Math.round(totalVentas / ventasValidas.length);
    
    const mejorVenta = ventasValidas.reduce((max, current) => 
      current.ventas > max.ventas ? current : max
    );
    
    const peorVenta = ventasValidas.reduce((min, current) => 
      current.ventas < min.ventas ? current : min
    );
    
    // Tendencia general (comparar primer y último mes con datos)
    const primeraVentaValida = ventasValidas[0]?.ventas || 0;
    const ultimaVentaValida = ventasValidas[ventasValidas.length - 1]?.ventas || 0;
    
    let tendenciaGeneral = 'Estable';
    let crecimientoTotal = 0;
    
    if (primeraVentaValida > 0 && ultimaVentaValida > 0) {
      crecimientoTotal = Math.round(((ultimaVentaValida - primeraVentaValida) / primeraVentaValida) * 100);
      
      if (ultimaVentaValida > primeraVentaValida * 1.1) {
        tendenciaGeneral = 'Creciendo';
      } else if (ultimaVentaValida < primeraVentaValida * 0.9) {
        tendenciaGeneral = 'Decreciendo';
      }
    }

    return {
      totalVentas,
      promedioMensual,
      mejorMes: mejorVenta.periodo,
      peorMes: peorVenta.periodo,
      tendenciaGeneral,
      crecimientoTotal,
      ventaMaxima: mejorVenta.ventas,
      ventaMinima: peorVenta.ventas
    };
  }, [datosGrafica]);

  // 🎨 COLORES Y EMOJIS DINÁMICOS
  const colorTendencia = estadisticas.tendenciaGeneral === 'Creciendo' ? '#22c55e' : 
                        estadisticas.tendenciaGeneral === 'Decreciendo' ? '#ef4444' : '#6b7280';

  const iconoTendencia = estadisticas.tendenciaGeneral === 'Creciendo' ? '📈' : 
                        estadisticas.tendenciaGeneral === 'Decreciendo' ? '📉' : '📊';

  const bgGradient = estadisticas.tendenciaGeneral === 'Creciendo' ? 'from-green-50 to-emerald-50' :
                    estadisticas.tendenciaGeneral === 'Decreciendo' ? 'from-red-50 to-pink-50' :
                    'from-blue-50 to-indigo-50';

  return (
    <div className={`h-full flex flex-col bg-gradient-to-br from-white ${bgGradient} rounded-2xl p-6`}>
      {/* Header con información dinámica */}
      <div className="text-center mb-6">
        <div className="text-6xl mb-4">💰</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Ventas de {resourceName}
        </h2>
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-16 h-1 bg-blue-500 rounded-full"></div>
          <span className="text-sm text-gray-600 font-medium">
            {datosGrafica.length} períodos analizados
          </span>
          <div className="w-16 h-1 bg-blue-500 rounded-full"></div>
        </div>
        
        {/* Indicador de fuente de datos */}
        <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {datosVentas.length > 0 ? (
            <>🔄 Datos en tiempo real</>
          ) : (
            <>⚠️ Modo demostración</>
          )}
        </div>
      </div>

      {/* Estadísticas mejoradas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-lg border border-blue-100 text-center hover:shadow-xl transition-shadow">
          <div className="text-3xl mb-2">📦</div>
          <div className="text-2xl font-bold text-blue-600">
            {estadisticas.totalVentas.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">Total Vendido</div>
          <div className="text-xs text-gray-400 mt-1">
            {datosGrafica.length} meses
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-lg border border-green-100 text-center hover:shadow-xl transition-shadow">
          <div className="text-3xl mb-2">📊</div>
          <div className="text-2xl font-bold text-green-600">
            {estadisticas.promedioMensual.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">Promedio Mensual</div>
          <div className="text-xs text-gray-400 mt-1">
            unidades/mes
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-lg border border-purple-100 text-center hover:shadow-xl transition-shadow">
          <div className="text-3xl mb-2">🏆</div>
          <div className="text-lg font-bold text-purple-600">
            {estadisticas.mejorMes}
          </div>
          <div className="text-sm text-gray-600">Mejor Mes</div>
          <div className="text-xs text-gray-400 mt-1">
            {estadisticas.ventaMaxima.toLocaleString()} unidades
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100 text-center hover:shadow-xl transition-shadow">
          <div className="text-3xl mb-2">{iconoTendencia}</div>
          <div className="text-lg font-bold" style={{ color: colorTendencia }}>
            {estadisticas.tendenciaGeneral}
          </div>
          <div className="text-sm text-gray-600">Tendencia</div>
          <div className="text-xs text-gray-400 mt-1">
            {estadisticas.crecimientoTotal !== 0 && `${estadisticas.crecimientoTotal > 0 ? '+' : ''}${estadisticas.crecimientoTotal}%`}
          </div>
        </div>
      </div>

      {/* Gráfica Principal Mejorada */}
      <div className="flex-1 bg-white rounded-xl p-6 shadow-lg border border-blue-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">
            📈 Evolución de Ventas Mensual
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Unidades Vendidas</span>
          </div>
        </div>
        
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={datosGrafica} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="periodo" 
                stroke="#64748b"
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={60}
                interval={0}
              />
              <YAxis 
                stroke="#64748b"
                fontSize={12}
                tickFormatter={(value) => value.toLocaleString()}
              />
              <Tooltip 
                formatter={(value: any, name: string) => [
                  `${value.toLocaleString()} unidades`, 
                  'Ventas'
                ]}
                labelFormatter={(label) => `Período: ${label}`}
                contentStyle={{
                  backgroundColor: '#f8fafc',
                  border: '2px solid #3b82f6',
                  borderRadius: '12px',
                  fontSize: '14px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                }}
              />
              <Area
                type="monotone"
                dataKey="ventas"
                stroke="#3b82f6"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorVentas)"
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, stroke: '#1d4ed8', strokeWidth: 3, fill: '#ffffff' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Análisis adicional */}
      {estadisticas.totalVentas > 0 && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 shadow border border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Rango de Ventas</span>
              <span className="text-2xl">📊</span>
            </div>
            <div className="mt-2">
              <div className="text-lg font-bold text-gray-800">
                {estadisticas.ventaMinima.toLocaleString()} - {estadisticas.ventaMaxima.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">
                Variación: {((estadisticas.ventaMaxima - estadisticas.ventaMinima) / estadisticas.ventaMinima * 100).toFixed(1)}%
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow border border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Consistencia</span>
              <span className="text-2xl">🎯</span>
            </div>
            <div className="mt-2">
              <div className="text-lg font-bold text-gray-800">
                {estadisticas.ventaMaxima > 0 ? 
                  ((estadisticas.promedioMensual / estadisticas.ventaMaxima) * 100).toFixed(0) : 0}%
              </div>
              <div className="text-xs text-gray-500">
                Estabilidad de ventas
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow border border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Proyección</span>
              <span className="text-2xl">🔮</span>
            </div>
            <div className="mt-2">
              <div className="text-lg font-bold text-gray-800">
                {(estadisticas.promedioMensual * 12).toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">
                Ventas anuales estimadas
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer con información detallada */}
      <div className="mt-4 text-center">
        <div className="text-sm text-gray-500">
          {datosVentas.length > 0 ? (
            <>
              🔄 Datos actualizados desde la base de datos • 
              Resource ID: {datosVentas[0]?.resource_id} • 
              Última actualización: {new Date().toLocaleDateString('es-ES', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </>
          ) : (
            <>⚠️ Sin datos de ventas disponibles • Usando datos de demostración</>
          )}
        </div>
      </div>
    </div>
  );
};

export default VentasCalc;