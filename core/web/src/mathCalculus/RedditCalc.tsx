import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid
} from 'recharts';

// 🔥 NUEVO: Importar datos con múltiples hashtags
import redditDataRaw from '../dataSets/data-reddit.json';

// 🔥 NUEVO: Tipos actualizados para múltiples hashtags
interface HashtagData {
  hashtag: string;
  id: string;
  fechas: string[];
  upVotes: number[];
  comentarios: number[];
  suscriptores: number[];
  horas: number[];
}

interface RedditData {
  hashtags: HashtagData[];
}

// Hacer type assertion para TypeScript
const redditData = redditDataRaw as RedditData;

// 🔥 FUNCIÓN PARA PROCESAR UN HASHTAG INDIVIDUAL
function procesarHashtag(hashtagData: HashtagData) {
  const datos = {
    fechas: hashtagData.fechas,
    upVotes: hashtagData.upVotes,
    comentarios: hashtagData.comentarios,
    suscriptores: hashtagData.suscriptores,
    horas: hashtagData.horas,
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

  return {
    id: hashtagData.id,
    nombre: hashtagData.hashtag,
    datosInteraccion: generadorTasaInteraccion(datos),
    datosViralidad: generadorTasaViralidad(datos),
    datosRaw: datos
  };
}

// 🚀 PROCESAMIENTO DINÁMICO DE TODOS LOS HASHTAGS
const procesarTodosLosHashtags = () => {
  return redditData.hashtags.map(hashtagData => procesarHashtag(hashtagData));
};

// 🎯 NUEVO RESULTADO DINÁMICO
export const resultadoRedditCalc = {
  plataforma: "Reddit",
  emoji: "🔴",
  color: "#94a3b8",
  hashtags: procesarTodosLosHashtags(),
  
  // 🔥 MANTENER COMPATIBILIDAD CON CÓDIGO ANTERIOR (primer hashtag por defecto)
  datosInteraccion: procesarTodosLosHashtags()[0]?.datosInteraccion || [],
  datosViralidad: procesarTodosLosHashtags()[0]?.datosViralidad || [],
  datosRaw: procesarTodosLosHashtags()[0]?.datosRaw || {},
  hashtag: redditData.hashtags[0]?.hashtag || "#EcoFriendly"
};

// 🎉 FUNCIONES HELPER PARA OBTENER DATOS ESPECÍFICOS
export const obtenerDatosHashtag = (hashtagId: string) => {
  return resultadoRedditCalc.hashtags.find(h => h.id === hashtagId);
};

export const obtenerListaHashtags = () => {
  return resultadoRedditCalc.hashtags.map(h => ({
    id: h.id,
    nombre: h.nombre
  }));
};

const RedditCalc: React.FC = () => {
  // Por defecto muestra el primer hashtag
  const primerHashtag = resultadoRedditCalc.hashtags[0];
  
  if (!primerHashtag) {
    return <div>No hay datos disponibles</div>;
  }

  const datosInteraccion = primerHashtag.datosInteraccion;
  const datosViralidad = primerHashtag.datosViralidad;

  return (
    <div style={{ width: '100%', maxWidth: 900, margin: '0 auto', padding: '20px' }}>
      <div className="text-center mb-4">
        <h1 className="text-2xl font-bold text-orange-600">
          🔴 Reddit Analytics - {primerHashtag.nombre}
        </h1>
        {/* 🔥 NUEVO: Mostrar cantidad de hashtags disponibles */}
        <p className="text-sm text-gray-600 mt-2">
          {resultadoRedditCalc.hashtags.length} hashtags disponibles
        </p>
      </div>

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
            <Line type="monotone" dataKey="tasa" stroke="#ff4500" name="Tasa de Interacción" strokeWidth={3} dot={{ r: 5 }} />
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
            <Line type="monotone" dataKey="tasa" stroke="#ff4500" name="Tasa de Viralidad" strokeWidth={3} dot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 🔥 NUEVO: Lista de hashtags disponibles */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Hashtags disponibles:</h3>
        <div className="flex flex-wrap gap-2">
          {resultadoRedditCalc.hashtags.map(hashtag => (
            <span 
              key={hashtag.id} 
              className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm"
            >
              {hashtag.nombre}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RedditCalc;