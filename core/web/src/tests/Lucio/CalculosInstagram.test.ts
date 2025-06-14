/**
 * Pruebas unitarias para CalculosInstagram
 * Statement Coverage: Cada línea de código ejecutada al menos una vez
 */

import { describe, it, expect } from 'vitest';
import CalculosInstagram, { type InstagramDataInput, type InstagramHashtagInput } from '../../calculus/CalculosInstagram';

describe('CalculosInstagram - Statement Coverage', () => {
  
  const hashtagCompleto: InstagramHashtagInput = {
    hashtag: '#test',
    id: 'test-1',
    fechas: ['Ene 25', 'Feb 25'],
    likes: [100, 150],
    comentarios: [20, 30],
    vistas: [1000, 1500],
    seguidores: [10000, 10500],
    compartidos: [5, 8]
  };

  it('ejecuta todas las líneas del código con datos completos', () => {
    const resultado = CalculosInstagram.procesarDatos({ hashtags: [hashtagCompleto] });
    
    // Verificar que el método principal se ejecutó
    expect(resultado).toBeDefined();
    expect(resultado.plataforma).toBe('Instagram');
    expect(resultado.emoji).toBe('📸');
    expect(resultado.hashtags).toHaveLength(1);
    
    const hashtag = resultado.hashtags[0];
    expect(hashtag.nombre).toBe('#test');
    expect(hashtag.id).toBe('test-1');
    expect(hashtag.datosInteraccion).toHaveLength(6);
    expect(hashtag.datosViralidad).toHaveLength(6);
    expect(hashtag.datosRaw).toBeDefined();
  });

  it('ejecuta líneas de manejo de datos vacíos', () => {
    const hashtagVacio: InstagramHashtagInput = {
      hashtag: '#empty',
      id: 'empty-1',
      fechas: [],
      likes: [],
      comentarios: [],
      vistas: [],
      seguidores: [],
      compartidos: []
    };

    const resultado = CalculosInstagram.procesarDatos({ hashtags: [hashtagVacio] });
    
    // Esto ejecuta las líneas de valores por defecto (|| [])
    expect(resultado.hashtags[0].datosInteraccion).toHaveLength(6);
    expect(resultado.hashtags[0].datosViralidad).toHaveLength(6);
  });

  it('ejecuta líneas de cálculo con valores extremos', () => {
    const hashtagExtremo: InstagramHashtagInput = {
      hashtag: '#extreme',
      id: 'extreme-1',
      fechas: ['Ene 25'],
      likes: [10000],
      comentarios: [5000],
      vistas: [100],
      seguidores: [100],
      compartidos: [1000]
    };

    const resultado = CalculosInstagram.procesarDatos({ hashtags: [hashtagExtremo] });
    
    // Esto ejecuta las líneas de Math.min y Math.max
    expect(resultado.hashtags[0].datosInteraccion[0].tasa).toBe(10);
    expect(resultado.hashtags[0].datosViralidad[0].tasa).toBe(3);
  });

  it('ejecuta líneas de valores de respaldo', () => {
    const hashtagCeros: InstagramHashtagInput = {
      hashtag: '#zeros',
      id: 'zeros-1',
      fechas: ['Ene 25'],
      likes: [0],
      comentarios: [0],
      vistas: [0],
      seguidores: [0],
      compartidos: [0]
    };

    const resultado = CalculosInstagram.procesarDatos({ hashtags: [hashtagCeros] });
    
    // Esto ejecuta las líneas de valores base y Math.random
    expect(resultado.hashtags[0].datosInteraccion[0].tasa).toBeGreaterThan(0);
    expect(resultado.hashtags[0].datosViralidad[0].tasa).toBeGreaterThan(0);
  });

  it('ejecuta líneas de múltiples hashtags', () => {
    const dataMultiple: InstagramDataInput = {
      hashtags: [
        hashtagCompleto,
        { ...hashtagCompleto, hashtag: '#test2', id: 'test-2' }
      ]
    };

    const resultado = CalculosInstagram.procesarDatos(dataMultiple);
    
    // Esto ejecuta el .map() sobre múltiples elementos
    expect(resultado.hashtags).toHaveLength(2);
    expect(resultado.hashtags[0].nombre).toBe('#test');
    expect(resultado.hashtags[1].nombre).toBe('#test2');
  });
});