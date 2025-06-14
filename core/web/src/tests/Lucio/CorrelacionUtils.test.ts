/**
 * Pruebas unitarias para correlacionUtils - Statement Coverage Simple
 */

import { describe, it, expect } from 'vitest';
import { 
  calcularCorrelacion, 
  getIconoHashtag, 
  ordenarPorMes, 
  generarColoresPorIndice, 
  generarColoresNoticias 
} from '../../components/correlacionUtils';

describe('correlacionUtils - Statement Coverage', () => {

  it('ejecuta línea de datos vacíos en calcularCorrelacion', () => {
    const resultado = calcularCorrelacion([]);
    expect(resultado).toBe(0);
  });

  it('ejecuta línea de datos null en calcularCorrelacion', () => {
    const resultado = calcularCorrelacion(null as any);
    expect(resultado).toBe(0);
  });

  it('ejecuta líneas de cálculo con datos válidos', () => {
    const datos = [{ tasa: 10 }, { tasa: 20 }, { tasa: 30 }];
    const resultado = calcularCorrelacion(datos);
    expect(typeof resultado).toBe('number');
    expect(resultado).toBeGreaterThanOrEqual(45);
    expect(resultado).toBeLessThanOrEqual(95);
  });

  it('ejecuta línea de icono eco', () => {
    const resultado = getIconoHashtag('#eco');
    expect(resultado).toBe('🌱');
  });

  it('ejecuta línea de icono green', () => {
    const resultado = getIconoHashtag('#green');
    expect(resultado).toBe('🌱');
  });

  it('ejecuta línea de icono sustain', () => {
    const resultado = getIconoHashtag('#sustain');
    expect(resultado).toBe('♻️');
  });

  it('ejecuta línea de icono material', () => {
    const resultado = getIconoHashtag('#material');
    expect(resultado).toBe('🧪');
  });

  it('ejecuta línea de icono moda', () => {
    const resultado = getIconoHashtag('#moda');
    expect(resultado).toBe('👗');
  });

  it('ejecuta línea de icono friendly', () => {
    const resultado = getIconoHashtag('#friendly');
    expect(resultado).toBe('🌿');
  });

  it('ejecuta línea de icono por defecto', () => {
    const resultado = getIconoHashtag('#random');
    expect(resultado).toBe('📈');
  });

  it('ejecuta líneas de ordenamiento por mes', () => {
    const datos = [{ fecha: 'Mar 25' }, { fecha: 'Ene 25' }, { fecha: 'Feb 25' }];
    const resultado = ordenarPorMes(datos);
    expect(resultado[0].fecha).toBe('Ene 25');
    expect(resultado[1].fecha).toBe('Feb 25');
    expect(resultado[2].fecha).toBe('Mar 25');
  });

  it('ejecuta línea de color por índice 0', () => {
    const resultado = generarColoresPorIndice(0);
    expect(resultado).toBe('#16a34a');
  });

  it('ejecuta línea de color por índice superior al array', () => {
    const resultado = generarColoresPorIndice(10);
    expect(resultado).toBe('#16a34a'); // 10 % 5 = 0
  });

  it('ejecuta línea de color de noticias índice 0', () => {
    const resultado = generarColoresNoticias(0);
    expect(resultado).toBe('#9333ea');
  });

  it('ejecuta línea de color de noticias índice superior', () => {
    const resultado = generarColoresNoticias(5);
    expect(resultado).toBe('#f59e0b'); // 5 % 3 = 2
  });
});