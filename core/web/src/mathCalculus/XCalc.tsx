import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid
} from 'recharts';

import xDataRaw from '../dataSets/data-x.json';

interface HashtagData {
  hashtag: string;
  id: string;
  fechas: string[];
  likes: number[];
  repost: number[];
  comentarios: number[];
  vistas: number[];
  seguidores: number[];
}

interface XData {
  hashtags: HashtagData[];
}
const xData = xDataRaw as XData;

function procesarHashtag(hashtagData: HashtagData) {
  const datos = {
    fechas: hashtagData.fechas,
    likes: hashtagData.likes,
    repost: hashtagData.repost,
    comentarios: hashtagData.comentarios,
    vistas: hashtagData.vistas,
    seguidores: hashtagData.seguidores,
  };

  function generadorTasaInteraccion(data: any) {
    return data.fechas.map((fecha: string, i: number) => {
      const interacciones = data.likes[i] + data.repost[i] + data.comentarios[i];
      const vistas = data.vistas[i];
      const tasa = vistas > 0 ? (interacciones / vistas) * 100 : 0;
      return {
        fecha,
        tasa: parseFloat(tasa.toFixed(2)),
      };
    });
  }

  function generadorTasaViralidad(data: any) {
    return data.fechas.map((fecha: string, i: number) => {
      const interacciones = data.likes[i] + data.repost[i] + data.comentarios[i];
      const seguidores = data.seguidores[i];
      const tasa = seguidores > 0 ? (interacciones / seguidores) * 100 : 0;
      return {
        fecha,
        tasa: parseFloat(tasa.toFixed(2)),
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

const procesarTodosLosHashtags = () => {
  return xData.hashtags.map(hashtagData => procesarHashtag(hashtagData));
};

export const resultadoXCalc = {
  plataforma: "X (Twitter)",
  emoji: "🐦",
  color: "#3b82f6",
  hashtags: procesarTodosLosHashtags(),
  datosInteraccion: procesarTodosLosHashtags()[0]?.datosInteraccion || [],
  datosViralidad: procesarTodosLosHashtags()[0]?.datosViralidad || [],
  datosRaw: procesarTodosLosHashtags()[0]?.datosRaw || {},
  hashtag: xData.hashtags[0]?.hashtag || "#EcoFriendly"
};

export const obtenerDatosHashtag = (hashtagId: string) => {
  return resultadoXCalc.hashtags.find(h => h.id === hashtagId);
};

export const obtenerListaHashtags = () => {
  return resultadoXCalc.hashtags.map(h => ({
    id: h.id,
    nombre: h.nombre
  }));
};

const XCalc: React.FC = () => {
  const primerHashtag = resultadoXCalc.hashtags[0];
  
  if (!primerHashtag) {
    return <div>No hay datos disponibles</div>;
  }

  const datosInteraccion = primerHashtag.datosInteraccion;
  const datosViralidad = primerHashtag.datosViralidad;
  
  return (
    <div style={{ width: '100%' }}>
      <div className="text-center mb-4">
        <h1 className="text-2xl font-bold text-blue-700">
          🐦 X (Twitter) Analytics - {primerHashtag.nombre}
        </h1>
        <p className="text-sm text-gray-600 mt-2">
          {resultadoXCalc.hashtags.length} hashtags disponibles
        </p>
      </div>

      <h2 style={{ textAlign: 'center' }}>Tasa de Interacción (%)</h2>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <LineChart data={datosInteraccion} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid stroke="#ccc" strokeDasharray="3 3" />
            <XAxis dataKey="fecha" />
            <YAxis domain={[0, 'dataMax']} tickFormatter={(value) => `${value}%`} />
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
            <YAxis domain={[0, 'dataMax']} tickFormatter={(value) => `${value}%`} />
            <Tooltip formatter={(value) => `${value}%`} />
            <Legend />
            <Line type="monotone" dataKey="tasa" stroke="#1da1f2" name="Tasa de Viralidad" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Hashtags disponibles:</h3>
        <div className="flex flex-wrap gap-2">
          {resultadoXCalc.hashtags.map(hashtag => (
            <span 
              key={hashtag.id} 
              className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
            >
              {hashtag.nombre}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default XCalc;