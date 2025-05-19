import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid
} from 'recharts';

// Datos originales
const datos = [
  ["", "01/01/25 - 31/01/25", "1/02/25 - 28/02/25", "1/03/25 - 31/03/25", "1/04/25 - 19/04/25"],
  ["Likes", 46822, 423520, 153642, 14964],
  ["Comentarios", 940, 44062, 1277, 296],
  ["Vistas", 1428400, 4672900, 2488200, 390800],
  ["Seguidores", 636298, 2192196, 391213, 705736],
  ["Compartidos", 37, 68136, 41645, 1112],
];

// Función que calcula la tasa de interacción
function generadorTasaInteraccion(datos: any[]) {
  const fechas = datos[0].slice(1);
  const likes = datos[1].slice(1);
  const comentarios = datos[2].slice(1);
  const vistas = datos[3].slice(1);
  const compartidos = datos[5].slice(1);

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
function generadorTasaViralidad(datos: any[]) {
  const fechas = datos[0].slice(1);
const likes = datos[1].slice(1);  
  const comentarios = datos[2].slice(1);
  const seguidores = datos[4].slice(1);
  const compartidos = datos[5].slice(1);

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
