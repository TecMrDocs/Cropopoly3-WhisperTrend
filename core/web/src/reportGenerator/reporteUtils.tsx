// src/utils/reporteUtils.ts

export interface DatosReporte {
  // Header del reporte
  empresa: string;
  fechaGeneracion: Date;
  fechaAnalisis: string;
  
  // Resumen ejecutivo
  resumenEjecutivo: {
    totalHashtags: number;
    mejorHashtag: string;
    mejorPlataforma: string;
    tasaInteraccionGlobal: number;
    tendenciaGeneral: string;
  };
  
  // Métricas principales
  metricas: {
    totalInteracciones: number;
    alcanceEstimado: number;
    engagement: number;
    potencialViral: number;
  };
  
  // Análisis por hashtag
  hashtagsAnalisis: Array<{
    nombre: string;
    id: string;
    rendimiento: {
      instagram: any;
      reddit: any;
      x: any;
    };
    mejorPlataforma: string;
    puntuacionGlobal: number;
  }>;
  
  // Ranking de plataformas
  rankingPlataformas: Array<{
    plataforma: string;
    emoji: string;
    puntuacion: number;
    fortalezas: string[];
    debilidades: string[];
    hashtagDestacado: string;
  }>;
  
  // Insights y recomendaciones
  insights: Array<{
    tipo: string;
    titulo: string;
    descripcion: string;
    hashtag?: string;
    plataforma?: string;
    valor?: number;
    recomendacion?: string;
  }>;
  
  recomendaciones: string[];
  
  // Datos de ventas
  ventas: any[];
  
  // Contexto de mercado
  noticias: Array<{
    title: string;
    description: string;
    url: string;
    keywords: string[];
  }>;
  
  // Metadata
  metadatos: {
    timestamp: string;
    hashtagsOriginales: string[];
    sentence: string;
    totalPosts: {
      instagram: number;
      reddit: number;
      twitter: number;
    };
    fuente: string;
    backendCalculations: boolean;
  };
  
  // Datos calculados del backend (si están disponibles)
  calculated_results?: {
    hashtags: Array<{
      name: string;
      instagram_interaction: number;
      instagram_virality: number;
      reddit_interaction: number;
      reddit_virality: number;
      twitter_interaction: number;
      twitter_virality: number;
    }>;
    total_hashtags: number;
    data_source: string;
  };
}

/**
 * 🎯 FUNCIÓN PRINCIPAL: Recopila todos los datos necesarios para el reporte
 */
export const recopilarDatosReporte = (
  datosDelSistema: any,
  analysisData: any,
  nombreProducto: string
): DatosReporte => {
  console.log('📋 Recopilando datos para el reporte...');
  
  // Validar que tenemos datos
  if (!datosDelSistema) {
    throw new Error('No hay datos del sistema disponibles');
  }
  
  // Preparar datos base
  const fechaGeneracion = new Date();
  const fechaAnalisis = datosDelSistema.metadatos?.timestamp ? 
    new Date(datosDelSistema.metadatos.timestamp).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) : 
    'Tiempo real';

  // Extraer resumen ejecutivo
  const resumenEjecutivo = datosDelSistema.consolidacion?.resumenEjecutivo || {
    totalHashtags: 0,
    mejorHashtag: 'N/A',
    mejorPlataforma: 'N/A',
    tasaInteraccionGlobal: 0,
    tendenciaGeneral: 'Sin datos'
  };

  // Extraer métricas principales
  const metricas = datosDelSistema.consolidacion?.metricas || {
    totalInteracciones: 0,
    alcanceEstimado: 0,
    engagement: 0,
    potencialViral: 0
  };

  // Análisis por hashtag
  const hashtagsAnalisis = datosDelSistema.consolidacion?.hashtagsComparativos || [];

  // Ranking de plataformas
  const rankingPlataformas = datosDelSistema.consolidacion?.rankingPlataformas || [];

  // Insights y recomendaciones
  const insights = datosDelSistema.consolidacion?.insights || [];
  const recomendaciones = datosDelSistema.consolidacion?.recomendaciones || [];

  // Datos de ventas
  const ventas = analysisData?.sales || [];

  // Noticias
  const noticias = datosDelSistema.noticias || [];

  // Metadatos
  const metadatos = {
    timestamp: datosDelSistema.metadatos?.timestamp || new Date().toISOString(),
    hashtagsOriginales: datosDelSistema.metadatos?.hashtagsOriginales || [],
    sentence: analysisData?.sentence || 'N/A',
    totalPosts: datosDelSistema.metadatos?.totalPosts || {
      instagram: 0,
      reddit: 0,
      twitter: 0
    },
    fuente: datosDelSistema.metadatos?.fuente || 'desconocida',
    backendCalculations: datosDelSistema.metadatos?.backendCalculations || false
  };

  // Datos calculados del backend
  const calculated_results = analysisData?.calculated_results || null;

  const datosReporte: DatosReporte = {
    empresa: nombreProducto,
    fechaGeneracion,
    fechaAnalisis,
    resumenEjecutivo,
    metricas,
    hashtagsAnalisis,
    rankingPlataformas,
    insights,
    recomendaciones,
    ventas,
    noticias,
    metadatos,
    ...(calculated_results && { calculated_results })
  };

  console.log('✅ Datos recopilados exitosamente');
  console.log(`📊 Resumen: ${hashtagsAnalisis.length} hashtags, ${insights.length} insights, ${recomendaciones.length} recomendaciones`);
  
  return datosReporte;
};

/**
 * 📈 Generar estadísticas rápidas para el reporte
 */
export const generarEstadisticasRapidas = (datosReporte: DatosReporte) => {
  const totalHashtags = datosReporte.hashtagsAnalisis.length;
  const totalInsights = datosReporte.insights.length;
  const totalRecomendaciones = datosReporte.recomendaciones.length;
  const totalNoticias = datosReporte.noticias.length;
  
  const mejorHashtag = datosReporte.hashtagsAnalisis.reduce((mejor, actual) => 
    actual.puntuacionGlobal > mejor.puntuacionGlobal ? actual : mejor,
    datosReporte.hashtagsAnalisis[0] || { nombre: 'N/A', puntuacionGlobal: 0 }
  );

  const peorHashtag = datosReporte.hashtagsAnalisis.reduce((peor, actual) => 
    actual.puntuacionGlobal < peor.puntuacionGlobal ? actual : peor,
    datosReporte.hashtagsAnalisis[0] || { nombre: 'N/A', puntuacionGlobal: 0 }
  );

  return {
    totalHashtags,
    totalInsights,
    totalRecomendaciones,
    totalNoticias,
    mejorHashtag: mejorHashtag.nombre,
    mejorPuntuacion: mejorHashtag.puntuacionGlobal,
    peorHashtag: peorHashtag.nombre,
    peorPuntuacion: peorHashtag.puntuacionGlobal,
    rangoRendimiento: mejorHashtag.puntuacionGlobal - peorHashtag.puntuacionGlobal
  };
};

/**
 * 🎨 Obtener color basado en valor de métrica
 */
export const obtenerColorMetrica = (valor: number, maximo: number = 100): string => {
  const porcentaje = (valor / maximo) * 100;
  
  if (porcentaje >= 75) return '#22c55e'; // Verde
  if (porcentaje >= 50) return '#eab308'; // Amarillo
  if (porcentaje >= 25) return '#f97316'; // Naranja
  return '#ef4444'; // Rojo
};

/**
 * 📅 Formatear fecha para el reporte
 */
export const formatearFechaReporte = (fecha: Date): string => {
  return fecha.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * 🔢 Formatear números para el reporte
 */
export const formatearNumero = (numero: number): string => {
  if (numero >= 1000000) {
    return (numero / 1000000).toFixed(1) + 'M';
  }
  if (numero >= 1000) {
    return (numero / 1000).toFixed(1) + 'K';
  }
  return numero.toLocaleString('es-ES');
};

/**
 * 📊 Calcular porcentaje de crecimiento
 */
export const calcularCrecimiento = (valorActual: number, valorAnterior: number): number => {
  if (valorAnterior === 0) return 0;
  return ((valorActual - valorAnterior) / valorAnterior) * 100;
};