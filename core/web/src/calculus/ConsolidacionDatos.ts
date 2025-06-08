// ConsolidacionDatos.ts
// Preparación final de datos para el Dashboard con insights y comparaciones

import type { ResultadoFinal, Noticia } from './DescargaDatos';
import type { ResultadoInstagramCalculado } from './CalculosInstagram';
import type { ResultadoRedditCalculado } from './CalculosReddit';
import type { ResultadoXCalculado } from './CalculosX';

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
  };
}

class ConsolidacionDatos {
  

  static procesarParaDashboard(resultadoFinal: ResultadoFinal): DashboardData {
    console.log('🔧 [ConsolidacionDatos] Iniciando consolidación final...');
    
    // 1. Crear comparaciones entre hashtags
    const hashtagsComparativos = this.crearComparacionHashtags(resultadoFinal);
    
    // 2. Generar ranking de plataformas
    const rankingPlataformas = this.generarRankingPlataformas(resultadoFinal);
    
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
      
      // Datos consolidados
      consolidacion: {
        resumenEjecutivo,
        hashtagsComparativos,
        rankingPlataformas,
        insights,
        recomendaciones,
        metricas
      },
      
      // Metadatos actualizados
      metadatos: {
        ...resultadoFinal.metadatos,
        procesamientoCompletado: true
      }
    };
    
    console.log('✅ [ConsolidacionDatos] Consolidación completada');
    console.log(`📊 Generados: ${insights.length} insights, ${recomendaciones.length} recomendaciones`);
    
    return dashboardData;
  }

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


  private static generarRankingPlataformas(datos: ResultadoFinal): RankingPlataforma[] {
    const plataformas = [
      {
        plataforma: 'Instagram',
        emoji: '📸',
        datos: datos.resultadoInstaCalc,
        calcularPuntuacion: () => this.calcularPuntuacionPlataforma(datos.resultadoInstaCalc.hashtags.map(h => h.datosInteraccion.concat(h.datosViralidad)))
      },
      {
        plataforma: 'Reddit', 
        emoji: '🔴',
        datos: datos.resultadoRedditCalc,
        calcularPuntuacion: () => this.calcularPuntuacionPlataforma(datos.resultadoRedditCalc.hashtags.map(h => h.datosInteraccion.concat(h.datosViralidad)))
      },
      {
        plataforma: 'X (Twitter)',
        emoji: '🐦',
        datos: datos.resultadoXCalc,
        calcularPuntuacion: () => this.calcularPuntuacionPlataforma(datos.resultadoXCalc.hashtags.map(h => h.datosInteraccion.concat(h.datosViralidad)))
      }
    ];

    return plataformas
      .map(p => ({
        plataforma: p.plataforma,
        emoji: p.emoji,
        puntuacion: p.calcularPuntuacion(),
        fortalezas: this.identificarFortalezas(p.plataforma, p.datos),
        debilidades: this.identificarDebilidades(p.plataforma, p.datos),
        hashtagDestacado: this.obtenerMejorHashtag(p.datos)
      }))
      .sort((a, b) => b.puntuacion - a.puntuacion);
  }


  private static generarInsights(datos: ResultadoFinal, comparativos: HashtagComparativo[]): Insight[] {
    const insights: Insight[] = [];
    
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
    
    const hashtagPotencial = comparativos.find(h => {
      const diferencias = [
        h.rendimiento.instagram.interaccionPromedio,
        h.rendimiento.reddit.interaccionPromedio,
        h.rendimiento.x.interaccionPromedio
      ].sort((a, b) => b - a);
      
      return diferencias[0] - diferencias[1] > 2; 
    });
    
    if (hashtagPotencial) {
      insights.push({
        tipo: 'warning',
        titulo: '⚠️ Potencial Desaprovechado',
        descripcion: `${hashtagPotencial.nombre} tiene rendimiento desigual entre plataformas`,
        hashtag: hashtagPotencial.nombre,
        recomendacion: 'Analizar estrategias exitosas en la mejor plataforma y replicar'
      });
    }
    
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


  private static calcularMetricasGlobales(datos: ResultadoFinal) {
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


  private static crearResumenEjecutivo(datos: ResultadoFinal, comparativos: HashtagComparativo[], ranking: RankingPlataforma[]) {
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


  private static calcularPromedio(valores: number[]): number {
    if (valores.length === 0) return 0;
    const suma = valores.reduce((sum, val) => sum + val, 0);
    return parseFloat((suma / valores.length).toFixed(2));
  }

  private static calcularPuntuacionPlataforma(datosHashtags: any[][]): number {
    const todosDatos = datosHashtags.flat().flat();
    return this.calcularPromedio(todosDatos.map(d => d.tasa || 0));
  }

  private static identificarFortalezas(plataforma: string, datos: any): string[] {
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

  private static identificarDebilidades(plataforma: string, datos: any): string[] {
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

  private static obtenerMejorHashtag(datos: any): string {
    if (!datos.hashtags || datos.hashtags.length === 0) return 'N/A';
    
    const mejor = datos.hashtags.reduce((mejor: any, actual: any) => {
      const promedioMejor = this.calcularPromedio(mejor.datosInteraccion.map((d: any) => d.tasa));
      const promedioActual = this.calcularPromedio(actual.datosInteraccion.map((d: any) => d.tasa));
      return promedioActual > promedioMejor ? actual : mejor;
    });
    
    return mejor.nombre;
  }
}

// 🚀 Exportar función principal
export const procesarParaDashboard = (resultadoFinal: ResultadoFinal): DashboardData => {
  return ConsolidacionDatos.procesarParaDashboard(resultadoFinal);
};

export default ConsolidacionDatos;
export type { DashboardData, HashtagComparativo, Insight, RankingPlataforma };