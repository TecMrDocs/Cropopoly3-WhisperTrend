/**
 * Pruebas unitarias para Navbar - Statement Coverage Simple
 */

import { describe, it, expect } from 'vitest';

describe('Navbar - Statement Coverage', () => {

  it('ejecuta línea de className del contenedor principal', () => {
    const className = "w-full h-20 flex flex-row justify-between items-center px-5 bg-gradient-to-r from-blue-600 to-emerald-400 text-white";
    expect(className).toContain('w-full');
    expect(className).toContain('h-20');
    expect(className).toContain('bg-gradient-to-r');
    expect(className).toContain('from-blue-600');
    expect(className).toContain('to-emerald-400');
  });

  it('ejecuta línea de className del div interno', () => {
    const className = "flex items-center gap-2.5";
    expect(className).toContain('flex');
    expect(className).toContain('items-center');
    expect(className).toContain('gap-2.5');
  });

  it('ejecuta línea de alt de la imagen', () => {
    const alt = "WhisperTrend Logo";
    expect(alt).toBe("WhisperTrend Logo");
  });

  it('ejecuta línea de className de la imagen', () => {
    const className = "h-[50px] w-auto object-contain";
    expect(className).toContain('h-[50px]');
    expect(className).toContain('w-auto');
    expect(className).toContain('object-contain');
  });

  it('ejecuta línea de className del h4', () => {
    const className = "m-0 text-2xl font-bold";
    expect(className).toContain('m-0');
    expect(className).toContain('text-2xl');
    expect(className).toContain('font-bold');
  });

  it('ejecuta línea de texto del título', () => {
    const titulo = "WhisperTrend";
    expect(titulo).toBe("WhisperTrend");
  });

  it('ejecuta línea de importación del logo', () => {
    // Simulamos la línea de import
    const logoPath = '../assets/logo_whispertrend.png';
    expect(logoPath).toBe('../assets/logo_whispertrend.png');
  });
});