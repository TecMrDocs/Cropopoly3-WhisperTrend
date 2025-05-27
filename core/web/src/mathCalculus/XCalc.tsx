import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid
} from 'recharts';

// Importar datos desde archivo JSON
import xDataRaw from '../dataSets/data-x.json';

// Definir el tipo para los datos de X
interface XData {
  hashtag: string;
  fechas: string[];
  likes: number[];
  repost: number[];
  comentarios: number[];
  vistas: number[];
  seguidores: number[];
}

// Hacer type assertion para TypeScript
const xData = xDataRaw as XData;

// Convertir al formato que necesitan las funciones existentes
const datos = {
  fechas: xData.fechas,
  likes: xData.likes,
  repost: xData.repost,
  comentarios: xData.comentarios,
  vistas: xData.vistas,
  seguidores: xData.seguidores,
};

// Función que calcula la tasa de interacción
function generadorTasaInteraccion(datos: any) {
  return datos.fechas.map((fecha: string, i: number) => {
    const interacciones = datos.likes[i] + datos.repost[i] + datos.comentarios[i];
    const vistas = datos.vistas[i];
    const tasa = vistas > 0 ? (interacciones / vistas) * 100 : 0;
    return {
      fecha,
      tasa: parseFloat(tasa.toFixed(2)),
    };
  });
}

// Función que calcula la tasa de viralidad
function generadorTasaViralidad(datos: any) {
  return datos.fechas.map((fecha: string, i: number) => {
    const interacciones = datos.likes[i] + datos.repost[i] + datos.comentarios[i];
    const seguidores = datos.seguidores[i];
    const tasa = seguidores > 0 ? (interacciones / seguidores) * 100 : 0;
    return {
      fecha,
      tasa: parseFloat(tasa.toFixed(2)),
    };
  });
}

// Exportamos los resultados en formato JSON para uso externo
export const resultadoXCalc = {
  datosInteraccion: generadorTasaInteraccion(datos),
  datosViralidad: generadorTasaViralidad(datos),
  // Exportar también los datos raw y el hashtag
  datosRaw: datos,
  hashtag: xData.hashtag
};

// Componente React
const XCalc: React.FC = () => {
  const datosInteraccion = resultadoXCalc.datosInteraccion;
  const datosViralidad = resultadoXCalc.datosViralidad;
  
  return (
    <div style={{ width: '100%' }}>
      <div className="text-center mb-4">
        <h1 className="text-2xl font-bold text-blue-700">
          🐦 X (Twitter) Analytics - {xData.hashtag}
        </h1>
      </div>

      <h2 style={{ textAlign: 'center' }}>Tasa de Interacción (%)</h2>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <LineChart data={datosInteraccion} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid stroke="#ccc" strokeDasharray="3 3" />
            <XAxis dataKey="fecha" />
            <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
            <Tooltip formatter={(value) => `${value}%`} />
            <Legend />
            <Line type="monotone" dataKey="tasa" stroke="#1da1f2" name="Tasa de Interacción" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <h2 style={{ textAlign: 'center', marginTop: 40 }}>Tasa de Viralidad (%)</h2>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <LineChart data={datosViralidad} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid stroke="#ccc" strokeDasharray="3 3" />
            <XAxis dataKey="fecha" />
            <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
            <Tooltip formatter={(value) => `${value}%`} />
            <Legend />
            <Line type="monotone" dataKey="tasa" stroke="#1da1f2" name="Tasa de Viralidad" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default XCalc;