import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid
} from 'recharts';

// 🔥 NUEVO: Importar datos con múltiples hashtags
// Para que funcione, necesitas actualizar data-instagram.json con la nueva estructura
import instagramDataRaw from '../dataSets/data-instagram.json';

// 🔥 NUEVO: Tipos actualizados para múltiples hashtags
interface HashtagData {
  hashtag: string;
  id: string;
  fechas: string[];
  likes: number[];
  comentarios: number[];
  vistas: number[];
  seguidores: number[];
  compartidos: number[];
}

interface InstagramData {
  hashtags: HashtagData[];
}

// Hacer type assertion para TypeScript
const instagramData = instagramDataRaw as InstagramData;

// 🔥 FUNCIÓN PARA PROCESAR UN HASHTAG INDIVIDUAL
function procesarHashtag(hashtagData: HashtagData) {
  const datos = {
    fechas: hashtagData.fechas,
    likes: hashtagData.likes,
    comentarios: hashtagData.comentarios,
    vistas: hashtagData.vistas,
    seguidores: hashtagData.seguidores,
    compartidos: hashtagData.compartidos,
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
  return instagramData.hashtags.map(hashtagData => procesarHashtag(hashtagData));
};

// 🎯 NUEVO RESULTADO DINÁMICO
export const resultadoInstaCalc = {
  plataforma: "Instagram",
  emoji: "📸",
  color: "#16a34a",
  hashtags: procesarTodosLosHashtags(),
  
  // 🔥 MANTENER COMPATIBILIDAD CON CÓDIGO ANTERIOR (primer hashtag por defecto)
  datosInteraccion: procesarTodosLosHashtags()[0]?.datosInteraccion || [],
  datosViralidad: procesarTodosLosHashtags()[0]?.datosViralidad || [],
  datosRaw: procesarTodosLosHashtags()[0]?.datosRaw || {},
  hashtag: instagramData.hashtags[0]?.hashtag || "#EcoFriendly"
};

// 🎉 FUNCIONES HELPER PARA OBTENER DATOS ESPECÍFICOS
export const obtenerDatosHashtag = (hashtagId: string) => {
  return resultadoInstaCalc.hashtags.find(h => h.id === hashtagId);
};

export const obtenerListaHashtags = () => {
  return resultadoInstaCalc.hashtags.map(h => ({
    id: h.id,
    nombre: h.nombre
  }));
};

// Componente React (mantiene el diseño original)
const InstaCalc: React.FC = () => {
  // Por defecto muestra el primer hashtag, pero podrías hacer esto dinámico
  const primerHashtag = resultadoInstaCalc.hashtags[0];
  
  if (!primerHashtag) {
    return <div>No hay datos disponibles</div>;
  }

  const datosInteraccion = primerHashtag.datosInteraccion;
  const datosViralidad = primerHashtag.datosViralidad;

  return (
    <div style={{ width: '100%' }}>
      <div className="text-center mb-4">
        <h1 className="text-2xl font-bold text-purple-700">
          📸 Instagram Analytics - {primerHashtag.nombre}
        </h1>
        {/* 🔥 NUEVO: Mostrar cantidad de hashtags disponibles */}
        <p className="text-sm text-gray-600 mt-2">
          {resultadoInstaCalc.hashtags.length} hashtags disponibles
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
            <YAxis domain={[0, 'dataMax']} tickFormatter={(value) => `${value}%`} />
            <Tooltip formatter={(value) => `${value}%`} />
            <Legend />
            <Line type="monotone" dataKey="tasa" stroke="#82ca9d" name="Tasa de Viralidad" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 🔥 NUEVO: Lista de hashtags disponibles */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Hashtags disponibles:</h3>
        <div className="flex flex-wrap gap-2">
          {resultadoInstaCalc.hashtags.map(hashtag => (
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

export default InstaCalc;