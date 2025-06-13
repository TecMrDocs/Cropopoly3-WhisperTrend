// ConsolidacionDatos.ts

import type { ResultadoFinal, Noticia } from './DescargaDatos';
import type { ResultadoInstagramCalculado } from './CalculosInstagram';
import type { ResultadoRedditCalculado } from './CalculosReddit';
import type { ResultadoXCalculado } from './CalculosX';

// 🆕 TIPOS PARA NÚMEROS DEL BACKEND
interface BackendHashtagMetric {
  name: string;
  instagram_interaction: number;
  instagram_virality: number;
  reddit_interaction: number;
  reddit_virality: number;
  twitter_interaction: number;
  twitter_virality: number;
}

interface BackendCalculatedResults {
  hashtags: BackendHashtagMetric[];
  total_hashtags: number;
  data_source: string;
  formulas_used: string[];
}

// 🆕 RESULTADO FINAL ACTUALIZADO
interface ResultadoFinalActualizado extends Omit<ResultadoFinal, 'resultadoInstaCalc' | 'resultadoRedditCalc' | 'resultadoXCalc'> {
  resultadoInstaCalc: ResultadoInstagramCalculado;
  resultadoRedditCalc: ResultadoRedditCalculado;
  resultadoXCalc: ResultadoXCalculado;
  calculated_results?: BackendCalculatedResults; 
}

interface HashtagComparativo {
  nombre: string;
  id: string;
  rendimiento: {
    instagram: {
      interaccionPromedio: number;
      viralidadPromedio: number;
      totalLikes: number;
      totalComentarios: number;
    };
    reddit: {
      interaccionPromedio: number;
      viralidadPromedio: number;
      totalUpVotes: number;
      totalComentarios: number;
    };
    x: {
      interaccionPromedio: number;
      viralidadPromedio: number;
      totalLikes: number;
      totalRepost: number;
    };
  };
  mejorPlataforma: 'instagram' | 'reddit' | 'x';
  puntuacionGlobal: number;
}

interface Insight {
  tipo: 'trending' | 'warning' | 'opportunity' | 'info';
  titulo: string;
  descripcion: string;
  hashtag?: string;
  plataforma?: string;
  valor?: number;
  recomendacion?: string;
}

interface RankingPlataforma {
  plataforma: string;
  emoji: string;
  puntuacion: number;
  fortalezas: string[];
  debilidades: string[];
  hashtagDestacado: string;
}

interface DashboardData {
  resultadoInstaCalc: ResultadoInstagramCalculado;
  resultadoRedditCalc: ResultadoRedditCalculado;
  resultadoXCalc: ResultadoXCalculado;
  noticias: Noticia[];
  calculated_results?: BackendCalculatedResults;
  resource_name?: string;

  consolidacion: {
    resumenEjecutivo: {
      totalHashtags: number;
      mejorHashtag: string;
      mejorPlataforma: string;
      tasaInteraccionGlobal: number;
      tendenciaGeneral: 'subiendo' | 'bajando' | 'estable';
    };
    hashtagsComparativos: HashtagComparativo[];
    rankingPlataformas: RankingPlataforma[];
    insights: Insight[];
    recomendaciones: string[];
    metricas: {
      totalInteracciones: number;
      alcanceEstimado: number;
      engagement: number;
      potencialViral: number;
    };
    dataSource: string; 
  };
  
  metadatos: {
    timestamp: string;
    hashtagsOriginales: string[];
    sentence: string;
    totalPosts: {
      instagram: number;
      reddit: number;
      twitter: number;
    };
    procesamientoCompletado: boolean;
    backendCalculations: boolean; 
  };
}

class ConsolidacionDatos {

  static procesarParaDashboard(resultadoFinal: ResultadoFinalActualizado): DashboardData {
    console.log('🔧 [ConsolidacionDatos] Iniciando consolidación final...');

    const tieneCalculosBackend = !!(resultadoFinal.calculated_results?.hashtags?.length);
    console.log(`🔍 [ConsolidacionDatos] ¿Cálculos backend disponibles? ${tieneCalculosBackend}`);

    const hashtagsComparativos = tieneCalculosBackend 
      ? this.crearComparacionHashtagsBackend(resultadoFinal)
      : this.crearComparacionHashtags(resultadoFinal);
    
    // 2. Generar ranking de plataformas
    const rankingPlataformas = this.generarRankingPlataformas(resultadoFinal, hashtagsComparativos);
    
    // 3. Crear insights automáticos
    const insights = this.generarInsights(resultadoFinal, hashtagsComparativos);
    
    // 4. Generar recomendaciones
    const recomendaciones = this.generarRecomendaciones(hashtagsComparativos, rankingPlataformas);
    
    // 5. Calcular métricas globales
    const metricas = this.calcularMetricasGlobales(resultadoFinal);
    
    // 6. Crear resumen ejecutivo
    const resumenEjecutivo = this.crearResumenEjecutivo(resultadoFinal, hashtagsComparativos, rankingPlataformas);
    
    const dashboardData: DashboardData = {
      // Datos originales
      resultadoInstaCalc: resultadoFinal.resultadoInstaCalc,
      resultadoRedditCalc: resultadoFinal.resultadoRedditCalc,
      resultadoXCalc: resultadoFinal.resultadoXCalc,
      noticias: resultadoFinal.noticias,
      calculated_results: resultadoFinal.calculated_results,
      resource_name: resultadoFinal.resource_name,
      
      // Datos consolidados
      consolidacion: {
        resumenEjecutivo,
        hashtagsComparativos,
        rankingPlataformas,
        insights,
        recomendaciones,
        metricas,
        dataSource: tieneCalculosBackend ? 'backend_calculations' : 'frontend_calculations' // 🆕
      },
      
      // Metadatos actualizados
      metadatos: {
        ...resultadoFinal.metadatos,
        procesamientoCompletado: true,
        backendCalculations: tieneCalculosBackend // 🆕
      }
    };
    
    console.log('✅ [ConsolidacionDatos] Consolidación completada');
    console.log(`📊 Generados: ${insights.length} insights, ${recomendaciones.length} recomendaciones`);
    console.log(`🎯 Fuente de datos: ${tieneCalculosBackend ? 'Backend' : 'Frontend'}`);
    
    return dashboardData;
  }

  // 🆕 NUEVA FUNCIÓN: Crear comparaciones usando números del backend
  private static crearComparacionHashtagsBackend(datos: ResultadoFinalActualizado): HashtagComparativo[] {
    if (!datos.calculated_results?.hashtags) {
      console.warn('⚠️ No hay datos calculados del backend, usando lógica frontend');
      return this.crearComparacionHashtags(datos);
    }

    const backendHashtags = datos.calculated_results.hashtags;
    console.log(`🎯 [ConsolidacionDatos] Procesando ${backendHashtags.length} hashtags del backend`);

    return backendHashtags.map(backendHashtag => {
      // Buscar datos raw para métricas adicionales
      const dataInstagram = datos.resultadoInstaCalc.hashtags.find(h => h.nombre === backendHashtag.name);
      const dataReddit = datos.resultadoRedditCalc.hashtags.find(h => h.nombre === backendHashtag.name);
      const dataX = datos.resultadoXCalc.hashtags.find(h => h.nombre === backendHashtag.name);

      // 🆕 USAR NÚMEROS DEL BACKEND DIRECTAMENTE
      const instagramStats = {
        interaccionPromedio: backendHashtag.instagram_interaction,
        viralidadPromedio: backendHashtag.instagram_virality,
        totalLikes: dataInstagram?.datosRaw.likes?.reduce((sum, val) => sum + val, 0) || 0,
        totalComentarios: dataInstagram?.datosRaw.comentarios?.reduce((sum, val) => sum + val, 0) || 0
      };

      const redditStats = {
        interaccionPromedio: backendHashtag.reddit_interaction,
        viralidadPromedio: backendHashtag.reddit_virality,
        totalUpVotes: dataReddit?.datosRaw.upVotes?.reduce((sum, val) => sum + val, 0) || 0,
        totalComentarios: dataReddit?.datosRaw.comentarios?.reduce((sum, val) => sum + val, 0) || 0
      };

      const xStats = {
        interaccionPromedio: backendHashtag.twitter_interaction,
        viralidadPromedio: backendHashtag.twitter_virality,
        totalLikes: dataX?.datosRaw.likes?.reduce((sum, val) => sum + val, 0) || 0,
        totalRepost: dataX?.datosRaw.repost?.reduce((sum, val) => sum + val, 0) || 0
      };

      // Determinar mejor plataforma usando números del backend
      const puntuaciones = {
        instagram: (instagramStats.interaccionPromedio + instagramStats.viralidadPromedio) / 2,
        reddit: (redditStats.interaccionPromedio + redditStats.viralidadPromedio) / 2,
        x: (xStats.interaccionPromedio + xStats.viralidadPromedio) / 2
      };

      let mejorPlataforma: 'instagram' | 'reddit' | 'x' = 'instagram';
      let mejorPuntuacion = puntuaciones.instagram;

      if (puntuaciones.reddit > mejorPuntuacion) {
        mejorPlataforma = 'reddit';
        mejorPuntuacion = puntuaciones.reddit;
      }

      if (puntuaciones.x > mejorPuntuacion) {
        mejorPlataforma = 'x';
        mejorPuntuacion = puntuaciones.x;
      }

      console.log(`✅ Hashtag ${backendHashtag.name}: Instagram(${instagramStats.interaccionPromedio.toFixed(2)}, ${instagramStats.viralidadPromedio.toFixed(2)}) Reddit(${redditStats.interaccionPromedio.toFixed(2)}, ${redditStats.viralidadPromedio.toFixed(2)})`);

      return {
        nombre: backendHashtag.name,
        id: dataInstagram?.id || dataReddit?.id || dataX?.id || 'backend_generated',
        rendimiento: {
          instagram: instagramStats,
          reddit: redditStats,
          x: xStats
        },
        mejorPlataforma,
        puntuacionGlobal: mejorPuntuacion
      };
    });
  }

  // ✅ FUNCIÓN ORIGINAL (para compatibility fallback)
  private static crearComparacionHashtags(datos: ResultadoFinal): HashtagComparativo[] {
    const hashtags = datos.metadatos.hashtagsOriginales;
    
    return hashtags.map(nombreHashtag => {
      // Buscar datos del hashtag en cada plataforma
      const dataInstagram = datos.resultadoInstaCalc.hashtags.find(h => h.nombre === nombreHashtag);
      const dataReddit = datos.resultadoRedditCalc.hashtags.find(h => h.nombre === nombreHashtag);
      const dataX = datos.resultadoXCalc.hashtags.find(h => h.nombre === nombreHashtag);
      
      // Calcular promedios y totales para Instagram
      const instagramStats = dataInstagram ? {
        interaccionPromedio: this.calcularPromedio(dataInstagram.datosInteraccion.map(d => d.tasa)),
        viralidadPromedio: this.calcularPromedio(dataInstagram.datosViralidad.map(d => d.tasa)),
        totalLikes: dataInstagram.datosRaw.likes?.reduce((sum, val) => sum + val, 0) || 0,
        totalComentarios: dataInstagram.datosRaw.comentarios?.reduce((sum, val) => sum + val, 0) || 0
      } : { interaccionPromedio: 0, viralidadPromedio: 0, totalLikes: 0, totalComentarios: 0 };
      
      // Calcular promedios y totales para Reddit
      const redditStats = dataReddit ? {
        interaccionPromedio: this.calcularPromedio(dataReddit.datosInteraccion.map(d => d.tasa)),
        viralidadPromedio: this.calcularPromedio(dataReddit.datosViralidad.map(d => d.tasa)),
        totalUpVotes: dataReddit.datosRaw.upVotes?.reduce((sum, val) => sum + val, 0) || 0,
        totalComentarios: dataReddit.datosRaw.comentarios?.reduce((sum, val) => sum + val, 0) || 0
      } : { interaccionPromedio: 0, viralidadPromedio: 0, totalUpVotes: 0, totalComentarios: 0 };
      
      // Calcular promedios y totales para X
      const xStats = dataX ? {
        interaccionPromedio: this.calcularPromedio(dataX.datosInteraccion.map(d => d.tasa)),
        viralidadPromedio: this.calcularPromedio(dataX.datosViralidad.map(d => d.tasa)),
        totalLikes: dataX.datosRaw.likes?.reduce((sum, val) => sum + val, 0) || 0,
        totalRepost: dataX.datosRaw.repost?.reduce((sum, val) => sum + val, 0) || 0
      } : { interaccionPromedio: 0, viralidadPromedio: 0, totalLikes: 0, totalRepost: 0 };
      
      // Determinar mejor plataforma
      const puntuaciones = {
        instagram: (instagramStats.interaccionPromedio + instagramStats.viralidadPromedio) / 2,
        reddit: (redditStats.interaccionPromedio + redditStats.viralidadPromedio) / 2,
        x: (xStats.interaccionPromedio + xStats.viralidadPromedio) / 2
      };
      
      let mejorPlataforma: 'instagram' | 'reddit' | 'x' = 'instagram';
      let mejorPuntuacion = puntuaciones.instagram;
      
      if (puntuaciones.reddit > mejorPuntuacion) {
        mejorPlataforma = 'reddit';
        mejorPuntuacion = puntuaciones.reddit;
      }
      
      if (puntuaciones.x > mejorPuntuacion) {
        mejorPlataforma = 'x';
        mejorPuntuacion = puntuaciones.x;
      }
      
      const puntuacionGlobal = mejorPuntuacion;
      
      return {
        nombre: nombreHashtag,
        id: dataInstagram?.id || dataReddit?.id || dataX?.id || 'unknown',
        rendimiento: {
          instagram: instagramStats,
          reddit: redditStats,
          x: xStats
        },
        mejorPlataforma,
        puntuacionGlobal
      };
    });
  }

  // ✅ RESTO DE FUNCIONES SIN CAMBIOS (pero actualizadas para usar hashtagsComparativos)
  
  private static generarRankingPlataformas(datos: ResultadoFinalActualizado, hashtagsComparativos: HashtagComparativo[]): RankingPlataforma[] {
    const plataformas = [
      {
        plataforma: 'Instagram',
        emoji: '📸',
        puntuacion: this.calcularPuntuacionPlataformaComparativo(hashtagsComparativos, 'instagram'),
        hashtagDestacado: this.obtenerMejorHashtagPlataforma(hashtagsComparativos, 'instagram')
      },
      {
        plataforma: 'Reddit', 
        emoji: '🔴',
        puntuacion: this.calcularPuntuacionPlataformaComparativo(hashtagsComparativos, 'reddit'),
        hashtagDestacado: this.obtenerMejorHashtagPlataforma(hashtagsComparativos, 'reddit')
      },
      {
        plataforma: 'X (Twitter)',
        emoji: '🐦',
        puntuacion: this.calcularPuntuacionPlataformaComparativo(hashtagsComparativos, 'x'),
        hashtagDestacado: this.obtenerMejorHashtagPlataforma(hashtagsComparativos, 'x')
      }
    ];

    return plataformas
      .map(p => ({
        plataforma: p.plataforma,
        emoji: p.emoji,
        puntuacion: p.puntuacion,
        fortalezas: this.identificarFortalezas(p.plataforma),
        debilidades: this.identificarDebilidades(p.plataforma),
        hashtagDestacado: p.hashtagDestacado
      }))
      .sort((a, b) => b.puntuacion - a.puntuacion);
  }

  private static calcularPuntuacionPlataformaComparativo(hashtagsComparativos: HashtagComparativo[], plataforma: 'instagram' | 'reddit' | 'x'): number {
    const promedios = hashtagsComparativos.map(h => {
      const stats = h.rendimiento[plataforma];
      return (stats.interaccionPromedio + stats.viralidadPromedio) / 2;
    });
    
    return this.calcularPromedio(promedios);
  }

  private static obtenerMejorHashtagPlataforma(hashtagsComparativos: HashtagComparativo[], plataforma: 'instagram' | 'reddit' | 'x'): string {
    let mejorHashtag = '';
    let mejorPuntuacion = 0;
    
    hashtagsComparativos.forEach(h => {
      const stats = h.rendimiento[plataforma];
      const puntuacion = (stats.interaccionPromedio + stats.viralidadPromedio) / 2;
      if (puntuacion > mejorPuntuacion) {
        mejorPuntuacion = puntuacion;
        mejorHashtag = h.nombre;
      }
    });
    
    return mejorHashtag || 'N/A';
  }

  private static generarInsights(datos: ResultadoFinalActualizado, comparativos: HashtagComparativo[]): Insight[] {
    const insights: Insight[] = [];
    
    // 🆕 INSIGHT SOBRE FUENTE DE DATOS
    if (datos.calculated_results?.hashtags?.length) {
      insights.push({
        tipo: 'info',
        titulo: '🚀 Cálculos Backend Activos',
        descripcion: `Se procesaron ${datos.calculated_results.hashtags.length} hashtags usando las fórmulas optimizadas del servidor`,
        recomendacion: 'Los cálculos backend garantizan mayor consistencia y rendimiento'
      });
    }
    
    const mejorHashtag = comparativos.reduce((mejor, actual) => 
      actual.puntuacionGlobal > mejor.puntuacionGlobal ? actual : mejor
    );
    
    insights.push({
      tipo: 'trending',
      titulo: '🚀 Hashtag Líder',
      descripcion: `${mejorHashtag.nombre} está mostrando el mejor rendimiento global`,
      hashtag: mejorHashtag.nombre,
      plataforma: mejorHashtag.mejorPlataforma,
      valor: mejorHashtag.puntuacionGlobal,
      recomendacion: `Enfocar estrategia en ${mejorHashtag.mejorPlataforma} para este hashtag`
    });
    
    // Resto de insights...
    let mejorPlataformaNombre = 'Instagram';
    let mejorPromedio = 0;
    
    comparativos.forEach(hashtag => {
      const instagramTotal = hashtag.rendimiento.instagram.interaccionPromedio;
      const redditTotal = hashtag.rendimiento.reddit.interaccionPromedio;
      const xTotal = hashtag.rendimiento.x.interaccionPromedio;
      
      if (instagramTotal > mejorPromedio) {
        mejorPromedio = instagramTotal;
        mejorPlataformaNombre = 'Instagram';
      }
      if (redditTotal > mejorPromedio) {
        mejorPromedio = redditTotal;
        mejorPlataformaNombre = 'Reddit';
      }
      if (xTotal > mejorPromedio) {
        mejorPromedio = xTotal;
        mejorPlataformaNombre = 'X (Twitter)';
      }
    });
    
    insights.push({
      tipo: 'opportunity',
      titulo: '📈 Oportunidad de Plataforma',
      descripcion: `${mejorPlataformaNombre} muestra las mejores tasas de interacción`,
      plataforma: mejorPlataformaNombre.toLowerCase(),
      recomendacion: `Incrementar inversión en contenido para ${mejorPlataformaNombre}`
    });
    
    if (datos.noticias.length > 0) {
      insights.push({
        tipo: 'info',
        titulo: '📰 Contexto de Mercado',
        descripcion: `Se encontraron ${datos.noticias.length} noticias relevantes que pueden impactar el rendimiento`,
        recomendacion: 'Revisar noticias para ajustar estrategia de contenido'
      });
    }
    
    return insights;
  }

  private static generarRecomendaciones(comparativos: HashtagComparativo[], ranking: RankingPlataforma[]): string[] {
    const recomendaciones: string[] = [];
    
    const mejorPlatform = ranking[0];
    recomendaciones.push(`Priorizar contenido en ${mejorPlatform.plataforma} (puntuación: ${mejorPlatform.puntuacion.toFixed(1)})`);
    
    const hashtagLider = comparativos.reduce((mejor, actual) => 
      actual.puntuacionGlobal > mejor.puntuacionGlobal ? actual : mejor
    );
    recomendaciones.push(`Aumentar frecuencia de posts con ${hashtagLider.nombre} en ${hashtagLider.mejorPlataforma}`);
    
    const hashtagsBajos = comparativos.filter(h => h.puntuacionGlobal < 1);
    if (hashtagsBajos.length > 0) {
      recomendaciones.push(`Revisar estrategia para ${hashtagsBajos.length} hashtag(s) con bajo rendimiento`);
    }
    
    const horaActual = new Date().getHours();
    if (horaActual >= 9 && horaActual <= 17) {
      recomendaciones.push('Considerar publicar contenido adicional en horario laboral para maximizar alcance');
    }
    
    return recomendaciones;
  }

  private static calcularMetricasGlobales(datos: ResultadoFinalActualizado) {
    const totalInteracciones = [
      ...datos.resultadoInstaCalc.hashtags.flatMap(h => h.datosRaw.likes || []),
      ...datos.resultadoInstaCalc.hashtags.flatMap(h => h.datosRaw.comentarios || []),
      ...datos.resultadoRedditCalc.hashtags.flatMap(h => h.datosRaw.upVotes || []),
      ...datos.resultadoRedditCalc.hashtags.flatMap(h => h.datosRaw.comentarios || [])
    ].reduce((sum, val) => sum + val, 0);
    
    const totalSeguidores = [
      ...datos.resultadoInstaCalc.hashtags.flatMap(h => h.datosRaw.seguidores || []),
      ...datos.resultadoRedditCalc.hashtags.flatMap(h => h.datosRaw.suscriptores || [])
    ].reduce((sum, val) => sum + val, 0);
    
    const alcanceEstimado = totalSeguidores * 0.1; // 10% del total de seguidores
    const engagement = totalSeguidores > 0 ? (totalInteracciones / totalSeguidores) * 100 : 0;
    const potencialViral = totalInteracciones > 0 ? Math.min((totalInteracciones / 1000) * 10, 100) : 0;
    
    return {
      totalInteracciones,
      alcanceEstimado: Math.round(alcanceEstimado),
      engagement: parseFloat(engagement.toFixed(2)),
      potencialViral: parseFloat(potencialViral.toFixed(1))
    };
  }

  private static crearResumenEjecutivo(datos: ResultadoFinalActualizado, comparativos: HashtagComparativo[], ranking: RankingPlataforma[]) {
    const mejorHashtag = comparativos.reduce((mejor, actual) => 
      actual.puntuacionGlobal > mejor.puntuacionGlobal ? actual : mejor
    );
    
    const tasaGlobal = comparativos.reduce((sum, h) => sum + h.puntuacionGlobal, 0) / comparativos.length;
    const tendenciaGeneral: 'subiendo' | 'bajando' | 'estable' = tasaGlobal > 2 ? 'subiendo' : tasaGlobal < 1 ? 'bajando' : 'estable';
    
    return {
      totalHashtags: datos.metadatos.hashtagsOriginales.length,
      mejorHashtag: mejorHashtag.nombre,
      mejorPlataforma: ranking[0].plataforma,
      tasaInteraccionGlobal: parseFloat(tasaGlobal.toFixed(2)),
      tendenciaGeneral
    };
  }

  // Helper functions (sin cambios)
  private static calcularPromedio(valores: number[]): number {
    if (valores.length === 0) return 0;
    const suma = valores.reduce((sum, val) => sum + val, 0);
    return parseFloat((suma / valores.length).toFixed(2));
  }

  private static identificarFortalezas(plataforma: string): string[] {
    const fortalezas = [];
    
    if (plataforma === 'Instagram') {
      fortalezas.push('Alto engagement visual', 'Alcance amplio');
    } else if (plataforma === 'Reddit') {
      fortalezas.push('Comunidades específicas', 'Discusiones profundas');
    } else {
      fortalezas.push('Viralidad rápida', 'Tendencias en tiempo real');
    }
    
    return fortalezas;
  }

  private static identificarDebilidades(plataforma: string): string[] {
    const debilidades = [];
    
    if (plataforma === 'Instagram') {
      debilidades.push('Algoritmo cambiante');
    } else if (plataforma === 'Reddit') {
      debilidades.push('Audiencia nicho');
    } else {
      debilidades.push('Contenido efímero');
    }
    
    return debilidades;
  }
}

// 🚀 Exportar función principal
export const procesarParaDashboard = (resultadoFinal: ResultadoFinalActualizado): DashboardData => {
  return ConsolidacionDatos.procesarParaDashboard(resultadoFinal);
};

export default ConsolidacionDatos;
export type { DashboardData, HashtagComparativo, Insight, RankingPlataforma, BackendCalculatedResults, BackendHashtagMetric };