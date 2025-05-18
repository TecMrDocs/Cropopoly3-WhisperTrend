import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid
} from 'recharts';

// Datos originales
const datos = [
  ["", "01/01/25 - 31/01/25", "1/02/25 - 28/02/25", "1/03/25 - 31/03/25", "1/04/25 - 19/04/25"],
  ["Likes", 25, 25, 90, 178],
  ["Repost", 0, 6, 51, 48],
  ["Comentarios", 0, 1, 7, 5],
  ["Vistas", 721, 3665, 6825, 3226],
  ["Seguidores", 61643, 513589, 207664, 176927],
];

// Función que calcula la tasa de interacción
function generadorTasaInteraccion(datos: any[]) {
  const fechas = datos[0].slice(1);
  const likes = datos[1].slice(1);
  const repost = datos[2].slice(1);
  const comentarios = datos[3].slice(1);
  const vistas = datos[4].slice(1);

  return fechas.map((fecha: string, i: number) => {
    const interacciones = likes[i] + repost[i] + comentarios[i];
    const vistasActuales = vistas[i];
    const tasa = vistasActuales > 0 ? (interacciones / vistasActuales) * 100 : 0;
    return {
      fecha,
      tasa: parseFloat(tasa.toFixed(2)),
    };
  });
}

// Función que calcula la tasa de viralidad
function generadorTasaViralidad(datos: any[]) {
  const fechas = datos[0].slice(1);
  const likes = datos[1].slice(1);
  const repost = datos[2].slice(1);
  const comentarios = datos[3].slice(1);
  const seguidores = datos[5].slice(1);

  return fechas.map((fecha: string, i: number) => {
    const interacciones = likes[i] + repost[i] + comentarios[i];
    const seguidoresActuales = seguidores[i];
    const tasa = seguidoresActuales > 0 ? (interacciones / seguidoresActuales) * 100 : 0;
    return {
      fecha,
      tasa: parseFloat(tasa.toFixed(2)),
    };
  });
}

// Componente con dos gráficos
const InstaCalc: React.FC = () => {
  const datosInteraccion = generadorTasaInteraccion(datos);
  const datosViralidad = generadorTasaViralidad(datos);

  return (
    <div style={{ width: '100%' }}>
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
