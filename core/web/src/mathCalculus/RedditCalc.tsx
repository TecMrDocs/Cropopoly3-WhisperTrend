import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid
} from 'recharts';


const datos = {
  fechas: ["01/01/25 - 31/01/25", "1/02/25 - 28/02/25", "1/03/25 - 31/03/25", "1/04/25 - 19/04/25"],
  upVotes: [2836, 844, 284, 405],
  comentarios: [1001, 747, 323, 103],
  suscriptores: [4234000, 914000, 3533000, 950000],
  horas: [10905, 6415, 2712, 1416],
};

// Función que calcula la tasa de interacción
function generadorTasaInteraccion(data: typeof datos) {
  const { fechas, upVotes, comentarios, suscriptores } = data;
  return fechas.map((fecha: string, i: number) => {
    const interacciones = upVotes[i] + comentarios[i];
    const suscriptoresActuales = suscriptores[i];
    const tasa = suscriptoresActuales > 0 ? (interacciones / suscriptoresActuales) * 100 : 0;
    return {
      fecha,
      tasa: parseFloat(tasa.toFixed(2)),
    };
  });
}

// Función que calcula la tasa de viralidad
function generadorTasaViralidad(data: typeof datos) {
  const { fechas, upVotes, comentarios, horas } = data;
  return fechas.map((fecha: string, i: number) => {
    const interacciones = upVotes[i] + comentarios[i];
    const horasActuales = horas[i];
    const tasa = horasActuales > 0 ? (interacciones / horasActuales) * 100 : 0;
    return {
      fecha,
      tasa: parseFloat(tasa.toFixed(2)),
    };
  });
}

// Componente con dos gráficos
const RedditCalc: React.FC = () => {
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

export default RedditCalc;
