import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid
} from 'recharts';



const datos = {
  fechas: ["01/01/25 - 31/01/25", "1/02/25 - 28/02/25", "1/03/25 - 31/03/25", "1/04/25 - 19/04/25"],
  likes: [46822, 423520, 153642, 14964],
  comentarios: [940, 44062, 1277, 296],
  vistas: [1428400, 4672900, 2488200, 390800],
  seguidores: [636298, 2192196, 391213, 705736],
  compartidos: [37, 68136, 41645, 1112],
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
  const { fechas, likes, comentarios, seguidores, compartidos} = data;

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
