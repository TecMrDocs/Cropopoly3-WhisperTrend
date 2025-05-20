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

// Calcula la tasa de interacción: (upVotes + comentarios) / suscriptores * 100
function generadorTasaInteraccion(data: typeof datos) {
  const { fechas, upVotes, comentarios, suscriptores } = data;
  return fechas.map((fecha: string, i: number) => {
    const interacciones = upVotes[i] + comentarios[i];
    const suscriptoresActuales = suscriptores[i];
    const tasa = suscriptoresActuales > 0 ? (interacciones / suscriptoresActuales) * 100 : 0;
    return {
      fecha,
      tasa: parseFloat(tasa.toFixed(3)), // un decimal más para precisión
    };
  });
}

// Calcula la tasa de viralidad: (upVotes + comentarios) / horas * 100
function generadorTasaViralidad(data: typeof datos) {
  const { fechas, upVotes, comentarios, horas } = data;
  return fechas.map((fecha: string, i: number) => {
    const interacciones = upVotes[i] + comentarios[i];
    const horasActuales = horas[i];
    const tasa = horasActuales > 0 ? (interacciones / horasActuales) * 100 : 0;
    return {
      fecha,
      tasa: parseFloat(tasa.toFixed(3)),
    };
  });
}

const RedditCalc: React.FC = () => {
  const datosInteraccion = generadorTasaInteraccion(datos);
  const datosViralidad = generadorTasaViralidad(datos);

  return (
    <div style={{ width: '100%', maxWidth: 900, margin: '0 auto', padding: '20px' }}>
      <h2 style={{ textAlign: 'center', color: '#3b3b98', fontWeight: '700', marginBottom: 20 }}>
        Tasa de Interacción (%)
      </h2>
      <div style={{ width: '100%', height: 320 }}>
        <ResponsiveContainer>
          <LineChart data={datosInteraccion} margin={{ top: 20, right: 40, left: 20, bottom: 20 }}>
            <CartesianGrid stroke="#e0e0e0" strokeDasharray="4 4" />
            <XAxis dataKey="fecha" tick={{ fontSize: 12 }} interval={0} angle={-30} textAnchor="end" height={60} />
            <YAxis domain={[0, 'dataMax']} tickFormatter={(value) => `${value}%`} />
            <Tooltip formatter={(value: number) => `${value.toFixed(3)}%`} />
            <Legend verticalAlign="top" height={36} />
            <Line type="monotone" dataKey="tasa" stroke="#3b3b98" name="Tasa de Interacción" strokeWidth={3} dot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <h2 style={{ textAlign: 'center', color: '#22a6b3', fontWeight: '700', margin: '40px 0 20px' }}>
        Tasa de Viralidad (%)
      </h2>
      <div style={{ width: '100%', height: 320 }}>
        <ResponsiveContainer>
          <LineChart data={datosViralidad} margin={{ top: 20, right: 40, left: 20, bottom: 20 }}>
            <CartesianGrid stroke="#e0e0e0" strokeDasharray="4 4" />
            <XAxis dataKey="fecha" tick={{ fontSize: 12 }} interval={0} angle={-30} textAnchor="end" height={60} />
            <YAxis domain={[0, 'dataMax']} tickFormatter={(value) => `${value}%`} />
            <Tooltip formatter={(value: number) => `${value.toFixed(3)}%`} />
            <Legend verticalAlign="top" height={36} />
            <Line type="monotone" dataKey="tasa" stroke="#22a6b3" name="Tasa de Viralidad" strokeWidth={3} dot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Exportación para uso externo de los datos calculados
export const resultadoRedditCalc = {
  datosInteraccion: generadorTasaInteraccion(datos),
  datosViralidad: generadorTasaViralidad(datos),
};

export default RedditCalc;
