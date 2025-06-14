/**
 * VentasCalc Component - Sistema de Análisis y Visualización de Ventas
 * 
 * Este componente proporciona una interfaz completa para el análisis de datos
 * de ventas con múltiples tipos de visualización interactiva. Incluye cálculo
 * automático de estadísticas, tendencias, métricas de rendimiento y gráficos
 * dinámicos que se adaptan según el tipo seleccionado. Maneja tanto datos
 * reales como datos de demostración, proporcionando insights valiosos sobre
 * el comportamiento de ventas a lo largo del tiempo con diferentes perspectivas
 * visuales como área, barras, líneas, gráficos combinados, circulares, radiales
 * y de dispersión.
 * 
 * Autor: Lucio Arturo Reyes Castillo
 */

import React, { useMemo, useState } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  BarChart, Bar, Area, AreaChart, ComposedChart, PieChart, Pie, Cell,
  RadialBarChart, RadialBar, ScatterChart, Scatter
} from 'recharts';

/**
 * Estructura de datos para ventas individuales
 */
interface DatoVenta {
  id: number;
  month: number;
  year: number;
  units_sold: number;
  resource_id: number;
}

/**
 * Propiedades del componente VentasCalc
 */
interface VentasCalcProps {
  datosVentas?: DatoVenta[];
  resourceName?: string;
}

const VentasCalc: React.FC<VentasCalcProps> = ({ datosVentas = [], resourceName = 'Producto' }) => {
  const [tipoGrafico, setTipoGrafico] = useState<'area' | 'bar' | 'line' | 'composed' | 'pie' | 'radial' | 'scatter'>('area');

  /**
   * Procesamiento de datos de ventas para visualización
   * Convierte datos brutos en formato optimizado para gráficas
   */
  const datosGrafica = useMemo(() => {
    if (!datosVentas || datosVentas.length === 0) {
      /**
       * Datos de fallback para demostración
       */
      return [
        { periodo: 'Jul 2024', ventas: 10, mes: 7, año: 2024, crecimiento: 0, acumulado: 10 },
        { periodo: 'Ago 2024', ventas: 12, mes: 8, año: 2024, crecimiento: 20, acumulado: 22 },
        { periodo: 'Sep 2024', ventas: 2, mes: 9, año: 2024, crecimiento: -83, acumulado: 24 },
        { periodo: 'Oct 2024', ventas: 3, mes: 10, año: 2024, crecimiento: 50, acumulado: 27 },
        { periodo: 'Nov 2024', ventas: 4, mes: 11, año: 2024, crecimiento: 33, acumulado: 31 },
        { periodo: 'Dic 2024', ventas: 4, mes: 12, año: 2024, crecimiento: 0, acumulado: 35 },
        { periodo: 'Ene 2025', ventas: 4, mes: 1, año: 2025, crecimiento: 0, acumulado: 39 },
        { periodo: 'Feb 2025', ventas: 4, mes: 2, año: 2025, crecimiento: 0, acumulado: 43 },
        { periodo: 'Mar 2025', ventas: 4, mes: 3, año: 2025, crecimiento: 0, acumulado: 47 },
        { periodo: 'Abr 2025', ventas: 5, mes: 4, año: 2025, crecimiento: 25, acumulado: 52 },
        { periodo: 'May 2025', ventas: 5, mes: 5, año: 2025, crecimiento: 0, acumulado: 57 },
        { periodo: 'Jun 2025', ventas: 8, mes: 6, año: 2025, crecimiento: 60, acumulado: 65 }
      ];
    }

    /**
     * Procesamiento de datos reales con ordenamiento y cálculos
     */
    const datosOrdenados = [...datosVentas].sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });

    let acumulado = 0;
    return datosOrdenados.map((venta, index) => {
      const nombresMeses = [
        'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
        'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
      ];
      
      const nombreMes = nombresMeses[venta.month - 1] || `Mes ${venta.month}`;
      const periodo = `${nombreMes} ${venta.year}`;
      
      /**
       * Cálculo de crecimiento mes a mes
       */
      let crecimiento = 0;
      if (index > 0) {
        const ventaAnterior = datosOrdenados[index - 1];
        if (ventaAnterior.units_sold > 0) {
          crecimiento = Math.round(((venta.units_sold - ventaAnterior.units_sold) / ventaAnterior.units_sold) * 100);
        }
      }
      
      acumulado += venta.units_sold;

      return {
        periodo,
        ventas: venta.units_sold,
        crecimiento,
        acumulado,
        mes: venta.month,
        año: venta.year,
        id: venta.id
      };
    });
  }, [datosVentas]);

  /**
   * Cálculo de estadísticas y métricas de rendimiento
   */
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
    
    const primeraVentaValida = ventasValidas[0]?.ventas || 0;
    const ultimaVentaValida = ventasValidas[ventasValidas.length - 1]?.ventas || 0;
    
    /**
     * Determinación de tendencia general
     */
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

  /**
   * Configuración visual basada en tendencias
   */
  const colorTendencia = estadisticas.tendenciaGeneral === 'Creciendo' ? '#22c55e' : 
                        estadisticas.tendenciaGeneral === 'Decreciendo' ? '#ef4444' : '#6b7280';

  const iconoTendencia = estadisticas.tendenciaGeneral === 'Creciendo' ? '📈' : 
                        estadisticas.tendenciaGeneral === 'Decreciendo' ? '📉' : '📊';

  /**
   * Renderizador de gráficos según tipo seleccionado
   */
  const renderGrafico = () => {
    const colores = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
    
    switch (tipoGrafico) {
      case 'area':
        return (
          <AreaChart data={datosGrafica} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="periodo" stroke="#64748b" fontSize={12} angle={-45} textAnchor="end" height={60} />
            <YAxis stroke="#64748b" fontSize={12} />
            <Tooltip />
            <Area type="monotone" dataKey="ventas" stroke="#3b82f6" fillOpacity={1} fill="url(#colorVentas)" strokeWidth={3} />
          </AreaChart>
        );

      case 'bar':
        return (
          <BarChart data={datosGrafica} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="periodo" stroke="#64748b" fontSize={12} angle={-45} textAnchor="end" height={60} />
            <YAxis stroke="#64748b" fontSize={12} />
            <Tooltip />
            <Bar dataKey="ventas" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        );

      case 'line':
        return (
          <LineChart data={datosGrafica} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="periodo" stroke="#64748b" fontSize={12} angle={-45} textAnchor="end" height={60} />
            <YAxis stroke="#64748b" fontSize={12} />
            <Tooltip />
            <Line type="monotone" dataKey="ventas" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 6 }} />
          </LineChart>
        );

      case 'composed':
        return (
          <ComposedChart data={datosGrafica} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="periodo" stroke="#64748b" fontSize={12} angle={-45} textAnchor="end" height={60} />
            <YAxis yAxisId="left" stroke="#64748b" fontSize={12} />
            <YAxis yAxisId="right" orientation="right" stroke="#64748b" fontSize={12} />
            <Tooltip />
            <Legend />
            <Bar yAxisId="left" dataKey="ventas" fill="#3b82f6" name="Ventas Mensuales" radius={[4, 4, 0, 0]} />
            <Line yAxisId="right" type="monotone" dataKey="acumulado" stroke="#10b981" strokeWidth={3} name="Acumulado" />
          </ComposedChart>
        );

      case 'pie':
        /**
         * Configuración para gráfico circular con últimos 6 períodos
         */
        const datosPie = datosGrafica.slice(-6).map((item, index) => ({
          name: item.periodo,
          value: item.ventas,
          fill: colores[index % colores.length]
        }));
        
        return (
          <PieChart>
            <Pie
              data={datosPie}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
            >
              {datosPie.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        );

      case 'radial':
        const datosRadial = datosGrafica.slice(-6).map((item, index) => ({
          name: item.periodo,
          ventas: item.ventas,
          fill: colores[index % colores.length]
        }));

        return (
          <RadialBarChart cx="50%" cy="50%" innerRadius="10%" outerRadius="80%" data={datosRadial}>
            <RadialBar 
              label={{ position: 'insideStart', fill: '#fff' }} 
              background 
              dataKey="ventas" 
            />
            <Legend iconSize={18} layout="vertical" verticalAlign="middle" wrapperStyle={{ paddingLeft: '20px' }} />
            <Tooltip />
          </RadialBarChart>
        );

      case 'scatter':
        const datosScatter = datosGrafica.map((item, index) => ({
          x: index + 1,
          y: item.ventas,
          z: item.crecimiento
        }));

        return (
          <ScatterChart data={datosScatter} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis type="number" dataKey="x" name="Período" stroke="#64748b" fontSize={12} />
            <YAxis type="number" dataKey="y" name="Ventas" stroke="#64748b" fontSize={12} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Scatter name="Ventas vs Tiempo" data={datosScatter} fill="#3b82f6" />
          </ScatterChart>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-white via-blue-50/40 to-indigo-100/60 rounded-2xl p-6">
      {/**
       * Header con información del producto y estadísticas básicas
       */}
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
      </div>

      {/**
       * Selector de tipo de gráfico con 7 opciones disponibles
       */}
      <div className="mb-6 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/40">
        <h3 className="text-lg font-bold text-gray-800 mb-3">🎨 Estilo de Gráfico</h3>
        <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
          {[
            { key: 'area', label: '📈 Área', desc: 'Área rellena' },
            { key: 'bar', label: '📊 Barras', desc: 'Barras verticales' },
            { key: 'line', label: '📉 Línea', desc: 'Línea simple' },
            { key: 'composed', label: '🔄 Combinado', desc: 'Barras + Línea' },
            { key: 'pie', label: '🥧 Circular', desc: 'Gráfico de torta' },
            { key: 'radial', label: '🌟 Radial', desc: 'Barras radiales' },
            { key: 'scatter', label: '⭐ Dispersión', desc: 'Puntos dispersos' }
          ].map((tipo) => (
            <button
              key={tipo.key}
              onClick={() => setTipoGrafico(tipo.key as any)}
              className={`p-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                tipoGrafico === tipo.key
                  ? 'bg-blue-500 text-white shadow-lg scale-105'
                  : 'bg-white text-gray-700 hover:bg-blue-50 border border-gray-200'
              }`}
              title={tipo.desc}
            >
              {tipo.label}
            </button>
          ))}
        </div>
      </div>

      {/**
       * Panel de estadísticas principales con 4 métricas clave
       */}
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

      {/**
       * Área principal del gráfico con renderizado dinámico
       */}
      <div className="flex-1 bg-white rounded-xl p-6 shadow-lg border border-blue-100 min-h-[400px]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">
            📈 Evolución de Ventas - Vista {tipoGrafico.charAt(0).toUpperCase() + tipoGrafico.slice(1)}
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Unidades Vendidas</span>
          </div>
        </div>
        
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            {renderGrafico()}
          </ResponsiveContainer>
        </div>
      </div>

      {/**
       * Footer informativo con estado de datos y timestamp
       */}
      <div className="mt-4 text-center">
        <div className="text-sm text-gray-500">
          {datosVentas.length > 0 ? (
            <>
              🔄 Datos actualizados • Gráfico: {tipoGrafico} • 
              Última actualización: {new Date().toLocaleDateString('es-ES', { 
                day: 'numeric', 
                month: 'long', 
                hour: '2-digit',
                minute: '2-digit'
              })}
            </>
          ) : (
            <>⚠️ Datos de demostración • Prueba diferentes estilos de gráfico</>
          )}
        </div>
      </div>
    </div>
  );
};

export default VentasCalc;