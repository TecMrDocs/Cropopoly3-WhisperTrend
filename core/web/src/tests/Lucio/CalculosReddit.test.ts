/**
 * Pruebas unitarias para CalculosReddit
 * Statement Coverage: Cada línea de código ejecutada al menos una vez
 */

import { describe, it, expect } from 'vitest';
import CalculosReddit, { type RedditDataInput, type RedditHashtagInput } from '../../calculus/CalculosReddit';

describe('CalculosReddit - Statement Coverage', () => {
  
  const hashtagCompleto: RedditHashtagInput = {
    hashtag: '#testReddit',
    id: 'reddit-1',
    fechas: ['Ene 25', 'Feb 25'],
    upVotes: [95, 112],
    comentarios: [28, 34],
    suscriptores: [15000, 15200],
    horas: [24, 24]
  };

  it('ejecuta todas las líneas del código con datos completos', () => {
    const resultado = CalculosReddit.procesarDatos({ hashtags: [hashtagCompleto] });
    
    expect(resultado).toBeDefined();
    expect(resultado.plataforma).toBe('Reddit');
    expect(resultado.emoji).toBe('🔴');
    expect(resultado.hashtags).toHaveLength(1);
    
    const hashtag = resultado.hashtags[0];
    expect(hashtag.nombre).toBe('#testReddit');
    expect(hashtag.id).toBe('reddit-1');
    expect(hashtag.datosInteraccion).toHaveLength(6);
    expect(hashtag.datosViralidad).toHaveLength(6);
    expect(hashtag.datosRaw).toBeDefined();
  });

  it('ejecuta líneas de manejo de datos vacíos', () => {
    const hashtagVacio: RedditHashtagInput = {
      hashtag: '#empty',
      id: 'empty-1',
      fechas: [],
      upVotes: [],
      comentarios: [],
      suscriptores: [],
      horas: []
    };

    const resultado = CalculosReddit.procesarDatos({ hashtags: [hashtagVacio] });
    
    // Ejecuta las líneas de valores por defecto (|| [])
    expect(resultado.hashtags[0].datosInteraccion).toHaveLength(6);
    expect(resultado.hashtags[0].datosViralidad).toHaveLength(6);
  });

  it('ejecuta líneas de cálculo con valores extremos', () => {
    const hashtagExtremo: RedditHashtagInput = {
      hashtag: '#extreme',
      id: 'extreme-1',
      fechas: ['Ene 25'],
      upVotes: [1000],
      comentarios: [500],
      suscriptores: [100],
      horas: [1]
    };

    const resultado = CalculosReddit.procesarDatos({ hashtags: [hashtagExtremo] });
    
    // Ejecuta las líneas de Math.min y Math.max
    expect(resultado.hashtags[0].datosInteraccion[0].tasa).toBe(60);
    expect(resultado.hashtags[0].datosViralidad[0].tasa).toBe(5);
  });

  it('ejecuta líneas de valores de respaldo', () => {
    const hashtagCeros: RedditHashtagInput = {
      hashtag: '#zeros',
      id: 'zeros-1',
      fechas: ['Ene 25'],
      upVotes: [0],
      comentarios: [0],
      suscriptores: [0],
      horas: [0]
    };

    const resultado = CalculosReddit.procesarDatos({ hashtags: [hashtagCeros] });
    
    // Ejecuta las líneas de valores base y Math.random
    expect(resultado.hashtags[0].datosInteraccion[0].tasa).toBeGreaterThan(0);
    expect(resultado.hashtags[0].datosViralidad[0].tasa).toBeGreaterThan(0);
  });

  it('ejecuta líneas de múltiples hashtags', () => {
    const dataMultiple: RedditDataInput = {
      hashtags: [
        hashtagCompleto,
        { ...hashtagCompleto, hashtag: '#test2', id: 'reddit-2' }
      ]
    };

    const resultado = CalculosReddit.procesarDatos(dataMultiple);
    
    // Ejecuta el .map() sobre múltiples elementos
    expect(resultado.hashtags).toHaveLength(2);
    expect(resultado.hashtags[0].nombre).toBe('#testReddit');
    expect(resultado.hashtags[1].nombre).toBe('#test2');
  });
});