/**
 * Pruebas unitarias para CalculosX
 * Statement Coverage: Cada línea de código ejecutada al menos una vez
 */

import { describe, it, expect } from 'vitest';
import CalculosX, { type XDataInput, type XHashtagInput } from '../../calculus/CalculosX';


describe('CalculosX - Statement Coverage', () => {
  
  const hashtagCompleto: XHashtagInput = {
    hashtag: '#testX',
    id: 'x-1',
    fechas: ['Ene 25', 'Feb 25'],
    likes: [200, 250],
    repost: [50, 60],
    comentarios: [30, 40],
    vistas: [2000, 2500],
    seguidores: [8000, 8500]
  };

  it('ejecuta todas las líneas del código con datos completos', () => {
    const resultado = CalculosX.procesarDatos({ hashtags: [hashtagCompleto] });
    
    expect(resultado).toBeDefined();
    expect(resultado.plataforma).toBe('X (Twitter)');
    expect(resultado.emoji).toBe('🐦');
    expect(resultado.hashtags).toHaveLength(1);
    
    const hashtag = resultado.hashtags[0];
    expect(hashtag.nombre).toBe('#testX');
    expect(hashtag.id).toBe('x-1');
    expect(hashtag.datosInteraccion).toHaveLength(6);
    expect(hashtag.datosViralidad).toHaveLength(6);
    expect(hashtag.datosRaw).toBeDefined();
  });

  it('ejecuta líneas de manejo de datos vacíos', () => {
    const hashtagVacio: XHashtagInput = {
      hashtag: '#empty',
      id: 'empty-1',
      fechas: [],
      likes: [],
      repost: [],
      comentarios: [],
      vistas: [],
      seguidores: []
    };

    const resultado = CalculosX.procesarDatos({ hashtags: [hashtagVacio] });
    
    // Ejecuta las líneas de valores por defecto (|| [])
    expect(resultado.hashtags[0].datosInteraccion).toHaveLength(6);
    expect(resultado.hashtags[0].datosViralidad).toHaveLength(6);
  });

  it('ejecuta líneas de cálculo con valores extremos', () => {
    const hashtagExtremo: XHashtagInput = {
      hashtag: '#extreme',
      id: 'extreme-1',
      fechas: ['Ene 25'],
      likes: [5000],
      repost: [2000],
      comentarios: [1000],
      vistas: [100],
      seguidores: [500]
    };

    const resultado = CalculosX.procesarDatos({ hashtags: [hashtagExtremo] });
    
    // Ejecuta las líneas de Math.min y Math.max
    expect(resultado.hashtags[0].datosInteraccion[0].tasa).toBe(15);
    expect(resultado.hashtags[0].datosViralidad[0].tasa).toBe(8);
  });

  it('ejecuta líneas de valores de respaldo', () => {
    const hashtagCeros: XHashtagInput = {
      hashtag: '#zeros',
      id: 'zeros-1',
      fechas: ['Ene 25'],
      likes: [0],
      repost: [0],
      comentarios: [0],
      vistas: [0],
      seguidores: [0]
    };

    const resultado = CalculosX.procesarDatos({ hashtags: [hashtagCeros] });
    
    // Ejecuta las líneas de valores base y Math.random
    expect(resultado.hashtags[0].datosInteraccion[0].tasa).toBeGreaterThan(0);
    expect(resultado.hashtags[0].datosViralidad[0].tasa).toBeGreaterThan(0);
  });

  it('ejecuta líneas de múltiples hashtags', () => {
    const dataMultiple: XDataInput = {
      hashtags: [
        hashtagCompleto,
        { ...hashtagCompleto, hashtag: '#test2', id: 'x-2' }
      ]
    };

    const resultado = CalculosX.procesarDatos(dataMultiple);
    
    // Ejecuta el .map() sobre múltiples elementos
    expect(resultado.hashtags).toHaveLength(2);
    expect(resultado.hashtags[0].nombre).toBe('#testX');
    expect(resultado.hashtags[1].nombre).toBe('#test2');
  });
});