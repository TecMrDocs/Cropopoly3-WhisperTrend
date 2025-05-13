const datos: (string | number)[][] = [
  ["", "01/01/25 - 31/01/25", "1/02/25 - 28/02/25", "1/03/25 - 31/03/25", "1/04/25 - 19/04/25"],
  ["Tasa Interacción X", 10.99, 1.88, 1.91, 25.52],
  ["Tasa Viralidad X", 1.75, 1.92, 0.69, 83.53],
  ["Tasa Interacción Instagram", 9.579002606, 346.0624043, 6.09294629, 4.261592452],
  ["Tasa Viralidad Instagram", 141.99, 213.98, 78.32, 5.35],
  ["Tasa interacción Reddit", 0.2474374817, 1.366677887, 0.1016653724, 0.2087342069],
  ["Tasa viralidad reddit", 0.2980078249, 0.2502433548, 0.224227941, 0.3087851555]
];

function logBase10Tabla(tabla: (string | number)[][]): (string | number)[][] {
  return tabla.map((fila, filaIdx) => {
    if (filaIdx === 0) return fila;
    return fila.map((valor, colIdx) => {
      if (colIdx === 0) return valor;
      const num = typeof valor === "number" ? valor : parseFloat(valor);
      return num > 0 ? Math.log(num) : "N/A";
    });
  });
}

function obtenerMinimosYMaximos(tabla: (string | number)[][]): { min: number[], max: number[] } {
  const numCols = tabla[0].length;
  const min: number[] = [];
  const max: number[] = [];

  for (let col = 1; col < numCols; col++) {
    const valores: number[] = [];

    for (let fila = 1; fila < tabla.length; fila++) {
      const valor = tabla[fila][col];
      if (typeof valor === "number") {
        valores.push(valor);
      }
    }

    min[col] = valores.length ? Math.min(...valores) : NaN;
    max[col] = valores.length ? Math.max(...valores) : NaN;
  }

  return { min, max };
}

function normalizarTabla(tabla: (string | number)[][], min: number[], max: number[]): (string | number)[][] {
  return tabla.map((fila, filaIdx) => {
    if (filaIdx === 0) return fila.map((val, i) => i === 0 ? "Normalizado" : val);
    return fila.map((valor, colIdx) => {
      if (colIdx === 0) return fila[0];
      if (typeof valor !== "number") return "N/A";

      const minVal = min[colIdx];
      const maxVal = max[colIdx];
      if (isNaN(minVal) || isNaN(maxVal) || maxVal === minVal) return "N/A";

      return ((valor - minVal) / (maxVal - minVal)) * 100;
    });
  });
}

const logTabla = logBase10Tabla(datos);
const { min, max } = obtenerMinimosYMaximos(logTabla);
const normalizada = normalizarTabla(logTabla, min, max);


console.log("\n=== Tabla Normalizada (0 a 100) ===");
normalizada.forEach(fila => console.log(fila.join("\t")));



//tsc consolidationLog.ts && node consolidationLog.js