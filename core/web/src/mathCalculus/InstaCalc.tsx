import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid
} from 'recharts';

// Importar datos desde archivo JSON
import instagramDataRaw from '../dataSets/data-instagram.json';

// Definir el tipo para los datos de Instagram
interface InstagramData {
  hashtag: string;
  fechas: string[];
  likes: number[];
  comentarios: number[];
  vistas: number[];
  seguidores: number[];
  compartidos: number[];
}

// Hacer type assertion para TypeScript
const instagramData = instagramDataRaw as InstagramData;

// Los datos ya vienen en el formato que necesitamos
const datos = {
  fechas: instagramData.fechas,
  likes: instagramData.likes,
  comentarios: instagramData.comentarios,
  vistas: instagramData.vistas,
  seguidores: instagramData.seguidores,
  compartidos: instagramData.compartidos,
};

// Función que calcula la tasa de interacción
function generadorTasaInteraccion(data: typeof datos) {
  const { fechas, likes, comentarios, vistas, compartidos } = data;

  return fechas.map((fecha: string, i: number) => {
    const interacciones = likes[i] + comentarios[i] + compartidos[i];
    const vistasActuales = vistas[i];
    const tasa = vistasActuales > 0 ? (interacciones / vistasActuales) * 100 : 0;
    return {
      fecha,
      tasa: parseFloat(tasa.toFixed(2)),
    };
  });
}

// Función que calcula la tasa de viralidad
function generadorTasaViralidad(data: typeof datos) {
  const { fechas, likes, comentarios, seguidores, compartidos } = data;

  return fechas.map((fecha: string, i: number) => {
    const interacciones = likes[i] + comentarios[i] + compartidos[i];
    const seguidoresActuales = seguidores[i];
    const tasa = seguidoresActuales > 0 ? (interacciones / seguidoresActuales) * 100 : 0;
    return {
      fecha,
      tasa: parseFloat(tasa.toFixed(2)),
    };
  });
}

// Exporta los datos para consolidación
export const resultadoInstaCalc = {
  datosInteraccion: generadorTasaInteraccion(datos),
  datosViralidad: generadorTasaViralidad(datos),
  // Exportar también los datos raw y el hashtag
  datosRaw: datos,
  hashtag: instagramData.hashtag
};

// Componente con dos gráficos (mantenemos el diseño original simplificado)
const InstaCalc: React.FC = () => {
  const datosInteraccion = resultadoInstaCalc.datosInteraccion;
  const datosViralidad = resultadoInstaCalc.datosViralidad;

  return (
    <div style={{ width: '100%' }}>
      <div className="text-center mb-4">
        <h1 className="text-2xl font-bold text-purple-700">
          📸 Instagram Analytics - {instagramData.hashtag}
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
            <Line type="monotone" dataKey="tasa" stroke="#8884d8" name="Tasa de Interacción" />
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
            <Line type="monotone" dataKey="tasa" stroke="#82ca9d" name="Tasa de Viralidad" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default InstaCalc;