/**
 * Este componente de React muestra visualizaciones analíticas de datos de Instagram
 * relacionados con distintos hashtags. Calcula métricas como la tasa de interacción
 * y la tasa de viralidad, y las representa mediante gráficas utilizando la librería Recharts.
 * 
 * Autor: Lucio Arturo Reyes Castillo
 * Contribuyentes: [Nombres de los contribuyentes si aplica]
 */

import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid
} from 'recharts';

// Importación de los datos de Instagram con estructura para múltiples hashtags
import instagramDataRaw from '../dataSets/data-instagram.json';

/**
 * Tipos que representan la estructura de los datos de cada hashtag
 * y del conjunto completo de datos de Instagram.
 */
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

// Conversión de datos importados para uso con TypeScript
const instagramData = instagramDataRaw as InstagramData;

/**
 * Procesa los datos de un solo hashtag, generando los datos necesarios
 * para calcular tasas de interacción y de viralidad.
 * 
 * @param hashtagData Objeto con los datos de un hashtag individual
 * @return Un objeto con los datos procesados listos para graficar
 */
function procesarHashtag(hashtagData: HashtagData) {
  const datos = {
    fechas: hashtagData.fechas,
    likes: hashtagData.likes,
    comentarios: hashtagData.comentarios,
    vistas: hashtagData.vistas,
    seguidores: hashtagData.seguidores,
    compartidos: hashtagData.compartidos,
  };

  /**
   * Calcula la tasa de interacción a partir de las interacciones (likes, comentarios,
   * compartidos) y las vistas.
   * 
   * @param data Conjunto de datos crudos del hashtag
   * @return Un arreglo de objetos con fecha y tasa de interacción (%)
   */
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

  /**
   * Calcula la tasa de viralidad a partir de las interacciones (likes, comentarios,
   * compartidos) y los seguidores.
   * 
   * @param data Conjunto de datos crudos del hashtag
   * @return Un arreglo de objetos con fecha y tasa de viralidad (%)
   */
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

/**
 * Procesa todos los hashtags encontrados en los datos crudos importados.
 * 
 * @return Un arreglo con los datos procesados por hashtag
 */
const procesarTodosLosHashtags = () => {
  return instagramData.hashtags.map(hashtagData => procesarHashtag(hashtagData));
};

/**
 * Objeto con los resultados analíticos ya procesados, incluyendo la información
 * por hashtag, además de compatibilidad con datos anteriores (primer hashtag).
 */
export const resultadoInstaCalc = {
  plataforma: "Instagram",
  emoji: "📸",
  color: "#16a34a",
  hashtags: procesarTodosLosHashtags(),
  
  datosInteraccion: procesarTodosLosHashtags()[0]?.datosInteraccion || [],
  datosViralidad: procesarTodosLosHashtags()[0]?.datosViralidad || [],
  datosRaw: procesarTodosLosHashtags()[0]?.datosRaw || {},
  hashtag: instagramData.hashtags[0]?.hashtag || "#EcoFriendly"
};

/**
 * Permite obtener los datos procesados de un hashtag específico mediante su ID.
 * 
 * @param hashtagId ID del hashtag deseado
 * @return Objeto con los datos del hashtag o `undefined` si no se encuentra
 */
export const obtenerDatosHashtag = (hashtagId: string) => {
  return resultadoInstaCalc.hashtags.find(h => h.id === hashtagId);
};

/**
 * Obtiene una lista de hashtags disponibles con su ID y nombre.
 * 
 * @return Un arreglo de objetos con { id, nombre }
 */
export const obtenerListaHashtags = () => {
  return resultadoInstaCalc.hashtags.map(h => ({
    id: h.id,
    nombre: h.nombre
  }));
};

/**
 * Componente principal que renderiza las gráficas de tasas de interacción y viralidad
 * para el primer hashtag disponible. También muestra una lista de hashtags analizados.
 * 
 * @return Componente visual de React con gráficas y resumen de hashtags.
 */
const InstaCalc: React.FC = () => {
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
