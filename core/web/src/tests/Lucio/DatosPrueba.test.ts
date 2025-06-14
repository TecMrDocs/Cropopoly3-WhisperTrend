/**
 * Pruebas unitarias para DatosPrueba
 * Statement Coverage: Cada línea de código ejecutada al menos una vez
 */

import { describe, it, expect } from 'vitest';
import { obtenerDatosPrueba } from '../../calculus/DatosPrueba';

describe('DatosPrueba - Statement Coverage', () => {

  it('ejecuta todas las líneas del módulo de datos de prueba', () => {
    const datos = obtenerDatosPrueba();
    
    // Ejecuta el return principal
    expect(datos).toBeDefined();
    expect(datos.hashtags).toBeDefined();
    expect(datos.sentence).toBeDefined();
    expect(datos.trends).toBeDefined();
    
    // Verifica estructura de hashtags
    expect(datos.hashtags).toEqual(['#EcoFriendly', '#SustainableFashion', '#NuevosMateriales']);
    expect(datos.sentence).toBe('Análisis de tendencias sostenibles en moda 2025');
    
    // Verifica estructura de trends
    expect(datos.trends.data).toBeDefined();
    expect(datos.trends.data.instagram).toBeDefined();
    expect(datos.trends.data.reddit).toBeDefined();
    expect(datos.trends.data.twitter).toBeDefined();
    expect(datos.trends.metadata).toBeDefined();
    
    // Ejecuta líneas de datos de Instagram
    expect(datos.trends.data.instagram).toHaveLength(3);
    expect(datos.trends.data.instagram[0].keyword).toBe('#EcoFriendly');
    expect(datos.trends.data.instagram[0].posts).toHaveLength(3);
    
    // Ejecuta líneas de datos de Reddit
    expect(datos.trends.data.reddit).toHaveLength(3);
    expect(datos.trends.data.reddit[0].keyword).toBe('#EcoFriendly');
    expect(datos.trends.data.reddit[0].posts).toHaveLength(2);
    
    // Ejecuta líneas de metadatos
    expect(datos.trends.metadata).toHaveLength(2);
    expect(datos.trends.metadata[0].title).toBe('Pieles sintéticas revolucionan la moda en Milán');
    
    // Verifica posts de Instagram
    const instaPost = datos.trends.data.instagram[0].posts[0];
    expect(instaPost.comments).toBe(45);
    expect(instaPost.followers).toBe(3500);
    expect(instaPost.likes).toBe(350);
    expect(instaPost.link).toBe('https://instagram.com/post/1');
    expect(instaPost.time).toBe('2025-01-15T10:00:00Z');
    
    // Verifica posts de Reddit
    const redditPost = datos.trends.data.reddit[0].posts[0];
    expect(redditPost.comments).toBe(28);
    expect(redditPost.members).toBe(15000);
    expect(redditPost.vote).toBe(95);
    expect(redditPost.subreddit).toBe('sustainability');
    expect(redditPost.title).toBe('Post sobre EcoFriendly - 1');
    
    // Verifica Twitter vacío
    expect(datos.trends.data.twitter).toEqual([]);
  });
});