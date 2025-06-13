// utils/correlacionUtils.ts

export const calcularCorrelacion = (datos: any[]): number => {
  if (!datos || datos.length === 0) return 0;
  
  const tasas = datos.map(d => d.tasa || 0);
  const promedio = tasas.reduce((sum, val) => sum + val, 0) / tasas.length;
  
  let tendenciaPositiva = 0;
  for (let i = 1; i < tasas.length; i++) {
    if (tasas[i] > tasas[i-1]) tendenciaPositiva++;
  }

  const factorTendencia = (tendenciaPositiva / (tasas.length - 1)) * 100;
  const factorPromedio = Math.min(promedio * 10, 100);
  const correlacion = Math.round((factorTendencia * 0.6 + factorPromedio * 0.4));
  
  return Math.min(Math.max(correlacion, 45), 95);
};

export const getIconoHashtag = (nombre: string): string => {
  const nombreLower = nombre.toLowerCase();
  
  if (nombreLower.includes('eco') || nombreLower.includes('green') || nombreLower.includes('verde')) {
    return '🌱';
  }
  if (nombreLower.includes('sustain') || nombreLower.includes('recicl') || nombreLower.includes('reciclados')) {
    return '♻️';
  }
  if (nombreLower.includes('material') || nombreLower.includes('nuevo') || nombreLower.includes('innovation')) {
    return '🧪';
  }
  if (nombreLower.includes('moda') || nombreLower.includes('fashion')) {
    return '👗';
  }
  if (nombreLower.includes('friendly')) {
    return '🌿';
  }
  
  return '📈'; // Ícono por defecto
};

export const ordenarPorMes = (datos: any[]): any[] => {
  const ordenMeses: Record<string, number> = {
    'Ene': 1, 'Feb': 2, 'Mar': 3, 'Abr': 4, 'May': 5, 'Jun': 6,
    'Jul': 7, 'Ago': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dic': 12
  };

  return datos.sort((a, b) => {
    const mesA = a.fecha.split(' ')[0];
    const mesB = b.fecha.split(' ')[0];
    return (ordenMeses[mesA] || 0) - (ordenMeses[mesB] || 0);
  });
};

export const generarColoresPorIndice = (index: number): string => {
  const colores = ['#16a34a', '#3b82f6', '#94a3b8', '#e91e63', '#8b5cf6'];
  return colores[index % colores.length];
};

export const generarColoresNoticias = (index: number): string => {
  const coloresNoticias = ['#9333ea', '#f59e0b', '#059669']; // Púrpura, ámbar, verde
  return coloresNoticias[index % coloresNoticias.length];
};