/**
 * Pruebas unitarias para correlationCalculator - Statement Coverage Simple
 */

import { describe, it, expect } from 'vitest';
import { interpretarPearson, calcularCorrelacionTransparente } from '../../components/correlationCalculator';

describe('correlationCalculator - Statement Coverage', () => {

  it('ejecuta línea de correlación muy fuerte positiva', () => {
    const resultado = interpretarPearson(0.95);
    expect(resultado.categoria).toBe('Muy fuerte positiva');
    expect(resultado.color).toBe('#16a34a');
    expect(resultado.emoji).toBe('💚');
  });

  it('ejecuta línea de correlación muy fuerte negativa', () => {
    const resultado = interpretarPearson(-0.95);
    expect(resultado.categoria).toBe('Muy fuerte negativa');
    expect(resultado.color).toBe('#dc2626');
    expect(resultado.emoji).toBe('💔');
  });

  it('ejecuta línea de correlación fuerte positiva', () => {
    const resultado = interpretarPearson(0.8);
    expect(resultado.categoria).toBe('Fuerte positiva');
    expect(resultado.color).toBe('#22c55e');
  });

  it('ejecuta línea de correlación moderada', () => {
    const resultado = interpretarPearson(0.6);
    expect(resultado.categoria).toBe('Moderada positiva');
    expect(resultado.emoji).toBe('📈');
  });

  it('ejecuta línea de correlación débil', () => {
    const resultado = interpretarPearson(0.4);
    expect(resultado.categoria).toBe('Débil positiva');
    expect(resultado.emoji).toBe('📊');
  });

  it('ejecuta línea de correlación muy débil', () => {
    const resultado = interpretarPearson(0.1);
    expect(resultado.categoria).toBe('Muy débil/Nula');
    expect(resultado.emoji).toBe('🤷');
  });

  it('ejecuta línea sin datos de ventas', () => {
    const resultado = calcularCorrelacionTransparente({}, []);
    expect(resultado.correlacion).toBe(0);
    expect(resultado.esReal).toBe(false);
    expect(resultado.confianza).toBe('insuficiente');
  });

  it('ejecuta línea con datos insuficientes', () => {
    const ventas = [{ year: 2025, month: 1, units_sold: 100 }];
    const resultado = calcularCorrelacionTransparente({}, ventas);
    expect(resultado.esEstimacion).toBe(true);
    expect(resultado.datosUsados.ventasDisponibles).toBe(1);
  });

  it('ejecuta línea sin métricas de hashtag', () => {
    const ventas = [
      { year: 2025, month: 1, units_sold: 100 },
      { year: 2025, month: 2, units_sold: 200 },
      { year: 2025, month: 3, units_sold: 300 }
    ];
    const resultado = calcularCorrelacionTransparente(null, ventas);
    expect(resultado.datosUsados.metricsDisponibles).toBe(false);
  });

  it('ejecuta líneas de cálculo completo', () => {
    const hashtag = {
      instagram_interaction: 50,
      reddit_interaction: 60,
      twitter_interaction: 40
    };
    const ventas = [
      { year: 2025, month: 1, units_sold: 100 },
      { year: 2025, month: 2, units_sold: 200 },
      { year: 2025, month: 3, units_sold: 300 }
    ];
    const resultado = calcularCorrelacionTransparente(hashtag, ventas);
    expect(resultado.esReal).toBe(true);
    expect(resultado.confianza).toBe('baja');
  });

  it('ejecuta línea de confianza alta', () => {
    const hashtag = { instagram_interaction: 50, reddit_interaction: 60, twitter_interaction: 40 };
    const ventas = Array.from({ length: 12 }, (_, i) => ({ 
      year: 2025, 
      month: i + 1, 
      units_sold: 100 + i * 10 
    }));
    const resultado = calcularCorrelacionTransparente(hashtag, ventas);
    expect(resultado.confianza).toBe('alta');
  });

  it('ejecuta línea de confianza media', () => {
    const hashtag = { instagram_interaction: 50, reddit_interaction: 60, twitter_interaction: 40 };
    const ventas = Array.from({ length: 6 }, (_, i) => ({ 
      year: 2025, 
      month: i + 1, 
      units_sold: 100 + i * 10 
    }));
    const resultado = calcularCorrelacionTransparente(hashtag, ventas);
    expect(resultado.confianza).toBe('media');
  });
});