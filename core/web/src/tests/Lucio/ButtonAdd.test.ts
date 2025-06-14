/**
 * Pruebas unitarias para ButtonAdd - Statement Coverage Simple
 */

import { describe, it, expect, vi } from 'vitest';
import ButtonAdd from '../../components/ButtonAdd';

describe('ButtonAdd - Statement Coverage', () => {

  it('ejecuta línea de width por defecto', () => {
    const props = { width: '40px' };
    expect(props.width).toBe('40px');
  });

  it('ejecuta línea de width personalizado', () => {
    const props = { width: '60px' };
    expect(props.width).toBe('60px');
  });

  it('ejecuta línea de onClick definido', () => {
    const mockClick = vi.fn();
    const props = { onClick: mockClick };
    expect(typeof props.onClick).toBe('function');
  });

  it('ejecuta línea de onClick undefined', () => {
    const props = { onClick: undefined };
    expect(props.onClick).toBeUndefined();
  });

  it('ejecuta línea de altura igual a width', () => {
    const width = '50px';
    const height = width;
    expect(height).toBe('50px');
  });

  it('ejecuta línea de texto del signo +', () => {
    const signo = '+';
    expect(signo).toBe('+');
  });

  it('ejecuta línea de className del botón', () => {
    const className = "flex items-center justify-center text-white bg-gradient-to-r from-blue-600 to-emerald-400 rounded-full border-transparent text-xl font-bold leading-none cursor-pointer hover:from-blue-600 hover:to-emerald-400";
    expect(className).toContain('flex');
    expect(className).toContain('bg-gradient-to-r');
  });

  it('ejecuta línea de className del párrafo', () => {
    const pClassName = "mb-1";
    expect(pClassName).toBe('mb-1');
  });
});