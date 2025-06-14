/**
 * Pruebas unitarias para ConsolidacionDatos
 * Statement Coverage: Cada línea de código ejecutada al menos una vez
 */

import { describe, it, expect } from 'vitest';
import { procesarParaDashboard } from '../../calculus/ConsolidacionDatos';
import type { ResultadoInstagramCalculado } from '../../calculus/CalculosInstagram';
import type { ResultadoRedditCalculado } from '../../calculus/CalculosReddit';
import type { ResultadoXCalculado } from '../../calculus/CalculosX';

describe('ConsolidacionDatos - Statement Coverage', () => {
  
  const resultadoMock = {
    resultadoInstaCalc: {
      hashtags: [{
        nombre: '#test',
        id: 'test-1',
        datosInteraccion: [{ fecha: 'Ene 25', tasa: 5.2 }],
        datosViralidad: [{ fecha: 'Ene 25', tasa: 2.1 }],
        datosRaw: { fechas: ['Ene 25'], likes: [100], comentarios: [20], vistas: [1000], seguidores: [5000], compartidos: [5] }
      }],
      emoji: '📸',
      plataforma: 'Instagram'
    } as ResultadoInstagramCalculado,
    
    resultadoRedditCalc: {
      hashtags: [{
        nombre: '#test',
        id: 'test-1',
        datosInteraccion: [{ fecha: 'Ene 25', tasa: 25.0 }],
        datosViralidad: [{ fecha: 'Ene 25', tasa: 2.3 }],
        datosRaw: { fechas: ['Ene 25'], upVotes: [95], comentarios: [28], suscriptores: [15000], horas: [24] }
      }],
      emoji: '🔴',
      plataforma: 'Reddit'
    } as ResultadoRedditCalculado,
    
    resultadoXCalc: {
      hashtags: [{
        nombre: '#test',
        id: 'test-1',
        datosInteraccion: [{ fecha: 'Ene 25', tasa: 6.1 }],
        datosViralidad: [{ fecha: 'Ene 25', tasa: 3.5 }],
        datosRaw: { fechas: ['Ene 25'], likes: [200], repost: [50], comentarios: [30], vistas: [2000], seguidores: [8000] }
      }],
      emoji: '🐦',
      plataforma: 'X (Twitter)'
    } as ResultadoXCalculado,
    
    noticias: [{
      title: 'Test News',
      description: 'Test Description',
      url: 'http://test.com',
      keywords: ['test']
    }],
    
    metadatos: {
      timestamp: '2025-01-15T10:00:00Z',
      hashtagsOriginales: ['#test'],
      sentence: 'Test sentence',
      totalPosts: { instagram: 1, reddit: 1, twitter: 0 },
      fuente: 'api' as const
    }
  };

  it('ejecuta procesamiento completo sin calculated_results', () => {
    const dashboard = procesarParaDashboard(resultadoMock);
    
    // Ejecuta flujo frontend (sin backend calculations)
    expect(dashboard).toBeDefined();
    expect(dashboard.consolidacion.dataSource).toBe('frontend_calculations');
    expect(dashboard.metadatos.backendCalculations).toBe(false);
    
    // Ejecuta creación de comparaciones frontend
    expect(dashboard.consolidacion.hashtagsComparativos).toHaveLength(1);
    expect(dashboard.consolidacion.hashtagsComparativos[0].nombre).toBe('#test');
    
    // Ejecuta generación de ranking
    expect(dashboard.consolidacion.rankingPlataformas).toHaveLength(3);
    
    // Ejecuta cálculo de métricas globales
    expect(dashboard.consolidacion.metricas).toBeDefined();
    expect(dashboard.consolidacion.metricas.totalInteracciones).toBeGreaterThan(0);
    
    // Ejecuta generación de insights
    expect(dashboard.consolidacion.insights.length).toBeGreaterThan(0);
    
    // Ejecuta generación de recomendaciones
    expect(dashboard.consolidacion.recomendaciones.length).toBeGreaterThan(0);
  });

  it('ejecuta procesamiento con calculated_results del backend', () => {
    const resultadoConBackend = {
      ...resultadoMock,
      calculated_results: {
        hashtags: [{
          name: '#test',
          instagram_interaction: 5.5,
          instagram_virality: 2.2,
          reddit_interaction: 26.0,
          reddit_virality: 2.4,
          twitter_interaction: 6.5,
          twitter_virality: 3.8
        }],
        total_hashtags: 1,
        data_source: 'backend',
        formulas_used: ['formula1', 'formula2']
      }
    };

    const dashboard = procesarParaDashboard(resultadoConBackend);
    
    // Ejecuta flujo backend
    expect(dashboard.consolidacion.dataSource).toBe('backend_calculations');
    expect(dashboard.metadatos.backendCalculations).toBe(true);
    expect(dashboard.calculated_results).toBeDefined();
    
    // Ejecuta creación de comparaciones backend
    expect(dashboard.consolidacion.hashtagsComparativos[0].rendimiento.instagram.interaccionPromedio).toBe(5.5);
  });

  it('ejecuta determinación de mejor plataforma', () => {
    const dashboard = procesarParaDashboard(resultadoMock);
    const hashtag = dashboard.consolidacion.hashtagsComparativos[0];
    
    // Ejecuta líneas de comparación de puntuaciones
    expect(hashtag.mejorPlataforma).toBeDefined();
    expect(['instagram', 'reddit', 'x']).toContain(hashtag.mejorPlataforma);
  });

  it('ejecuta cálculo de promedios y totales', () => {
    const dashboard = procesarParaDashboard(resultadoMock);
    const hashtag = dashboard.consolidacion.hashtagsComparativos[0];
    
    // Ejecuta líneas de cálculo de promedios
    expect(hashtag.rendimiento.instagram.interaccionPromedio).toBeGreaterThan(0);
    expect(hashtag.rendimiento.reddit.interaccionPromedio).toBeGreaterThan(0);
    expect(hashtag.rendimiento.x.interaccionPromedio).toBeGreaterThan(0);
    
    // Ejecuta líneas de cálculo de totales
    expect(hashtag.rendimiento.instagram.totalLikes).toBe(100);
    expect(hashtag.rendimiento.reddit.totalUpVotes).toBe(95);
    expect(hashtag.rendimiento.x.totalLikes).toBe(200);
  });

  it('ejecuta generación de insights específicos', () => {
    const dashboard = procesarParaDashboard(resultadoMock);
    
    // Ejecuta líneas de insight de hashtag líder
    const hashtagLider = dashboard.consolidacion.insights.find(i => i.tipo === 'trending');
    expect(hashtagLider).toBeDefined();
    expect(hashtagLider?.titulo).toContain('Hashtag Líder');
    
    // Ejecuta líneas de insight de oportunidad
    const oportunidad = dashboard.consolidacion.insights.find(i => i.tipo === 'opportunity');
    expect(oportunidad).toBeDefined();
    
    // Ejecuta líneas de insight de noticias
    const noticias = dashboard.consolidacion.insights.find(i => i.titulo.includes('Contexto de Mercado'));
    expect(noticias).toBeDefined();
  });

  it('ejecuta identificación de fortalezas y debilidades', () => {
    const dashboard = procesarParaDashboard(resultadoMock);
    
    // Ejecuta líneas de identificación para cada plataforma
    const instagram = dashboard.consolidacion.rankingPlataformas.find(p => p.plataforma === 'Instagram');
    const reddit = dashboard.consolidacion.rankingPlataformas.find(p => p.plataforma === 'Reddit');
    const x = dashboard.consolidacion.rankingPlataformas.find(p => p.plataforma === 'X (Twitter)');
    
    expect(instagram?.fortalezas).toContain('Alto engagement visual');
    expect(reddit?.fortalezas).toContain('Comunidades específicas');
    expect(x?.fortalezas).toContain('Viralidad rápida');
    
    expect(instagram?.debilidades).toContain('Algoritmo cambiante');
    expect(reddit?.debilidades).toContain('Audiencia nicho');
    expect(x?.debilidades).toContain('Contenido efímero');
  });

  it('ejecuta cálculo de resumen ejecutivo', () => {
    const dashboard = procesarParaDashboard(resultadoMock);
    const resumen = dashboard.consolidacion.resumenEjecutivo;
    
    // Ejecuta líneas de cálculo de resumen
    expect(resumen.totalHashtags).toBe(1);
    expect(resumen.mejorHashtag).toBe('#test');
    expect(resumen.mejorPlataforma).toBeDefined();
    expect(resumen.tasaInteraccionGlobal).toBeGreaterThan(0);
    expect(['subiendo', 'bajando', 'estable']).toContain(resumen.tendenciaGeneral);
  });

  it('ejecuta fallback a comparación frontend cuando no hay backend', () => {
    const resultadoSinBackend = {
      ...resultadoMock,
      calculated_results: {
        hashtags: [], // Array vacío fuerza fallback
        total_hashtags: 0,
        data_source: 'empty',
        formulas_used: []
      }
    };

    const dashboard = procesarParaDashboard(resultadoSinBackend);
    
    // Ejecuta líneas de fallback a frontend
    expect(dashboard.consolidacion.dataSource).toBe('frontend_calculations');
  });
});