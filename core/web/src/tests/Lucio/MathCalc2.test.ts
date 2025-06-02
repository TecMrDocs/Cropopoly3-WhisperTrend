import { describe, it, expect } from 'vitest'

type DataValue = string | number
type DataRow = DataValue[]
type DataTable = DataRow[]

const normalizarTabla = (tabla: DataTable, min: number[], max: number[]): DataTable =>
  tabla.map((fila, filaIdx) =>                                    // LÍNEA 1: map externo
    filaIdx === 0 ? fila : fila.map((valor, colIdx) =>          // LÍNEA 2: condición encabezado + map interno
      colIdx === 0 ? fila[0] :                                   // LÍNEA 3: condición primera columna
      typeof valor !== "number" || isNaN(valor) || min[colIdx] === max[colIdx] ? NaN : // LÍNEA 4: condiciones de validación
      ((valor - min[colIdx]) / (max[colIdx] - min[colIdx])) * 100  // LÍNEA 5: cálculo normalización
    )
  )

describe('normalizarTabla - Statement Coverage', () => {
  it('ejecuta LÍNEA 1: map externo sobre todas las filas', () => {
    const tabla: DataTable = [["Métrica"]]
    const resultado = normalizarTabla(tabla, [], [])
    expect(resultado).toHaveLength(1) // Verifica que el map externo se ejecutó
  })

  it('ejecuta LÍNEA 2: condición filaIdx === 0 (caso TRUE)', () => {
    const tabla: DataTable = [["Métrica", "Col1"]]
    const resultado = normalizarTabla(tabla, [NaN, 0], [NaN, 10])
    expect(resultado[0]).toEqual(["Métrica", "Col1"]) // Encabezado sin cambios
  })

  it('ejecuta LÍNEA 2: condición filaIdx === 0 (caso FALSE) + map interno', () => {
    const tabla: DataTable = [
      ["Métrica", "Col1"], 
      ["Tasa", 5]
    ]
    const resultado = normalizarTabla(tabla, [NaN, 0], [NaN, 10])
    expect(resultado).toHaveLength(2) // Verifica que procesó fila de datos
  })

  it('ejecuta LÍNEA 3: condición colIdx === 0 (caso TRUE)', () => {
    const tabla: DataTable = [
      ["Métrica", "Col1"], 
      ["Tasa A", 5]
    ]
    const resultado = normalizarTabla(tabla, [NaN, 0], [NaN, 10])
    expect(resultado[1][0]).toBe("Tasa A") // Primera columna preservada
  })

  it('ejecuta LÍNEA 4: typeof valor !== "number" (caso TRUE)', () => {
    const tabla: DataTable = [
      ["Métrica", "Col1"], 
      ["Tasa A", "texto"]
    ]
    const resultado = normalizarTabla(tabla, [NaN, 0], [NaN, 10])
    expect(resultado[1][1]).toBeNaN() // Valor no numérico → NaN
  })

  it('ejecuta LÍNEA 4: isNaN(valor) (caso TRUE)', () => {
    const tabla: DataTable = [
      ["Métrica", "Col1"], 
      ["Tasa A", NaN]
    ]
    const resultado = normalizarTabla(tabla, [NaN, 0], [NaN, 10])
    expect(resultado[1][1]).toBeNaN() // NaN → NaN
  })

  it('ejecuta LÍNEA 4: min[colIdx] === max[colIdx] (caso TRUE)', () => {
    const tabla: DataTable = [
      ["Métrica", "Col1"], 
      ["Tasa A", 5]
    ]
    const resultado = normalizarTabla(tabla, [NaN, 5], [NaN, 5])
    expect(resultado[1][1]).toBeNaN() // División por cero → NaN
  })

  it('ejecuta LÍNEA 5: cálculo de normalización', () => {
    const tabla: DataTable = [
      ["Métrica", "Col1"], 
      ["Tasa A", 5]
    ]
    const resultado = normalizarTabla(tabla, [NaN, 0], [NaN, 10])
    expect(resultado[1][1]).toBe(50) // (5-0)/(10-0)*100 = 50
  })

  it('COBERTURA COMPLETA: todas las líneas en una sola prueba', () => {
    const tabla: DataTable = [
      ["Métrica", "Col1", "Col2"],     // LÍNEA 2: encabezado
      ["Tasa A", 10, "texto"],         // LÍNEA 3, 4 (no numérico), 5
      ["Tasa B", NaN, 5],              // LÍNEA 3, 4 (NaN), 5  
      ["Tasa C", 15, 8]                // LÍNEA 3, 5
    ]
    const min = [NaN, 10, 5]
    const max = [NaN, 20, 5]           // Col2: min===max para división por cero

    const resultado = normalizarTabla(tabla, min, max)
    
    // Verificar que cada línea se ejecutó:
    expect(resultado[0]).toEqual(["Métrica", "Col1", "Col2"]) // LÍNEA 2
    expect(resultado[1][0]).toBe("Tasa A")                     // LÍNEA 3
    expect(resultado[1][1]).toBe(0)                            // LÍNEA 5: (10-10)/(20-10)*100=0
    expect(resultado[1][2]).toBeNaN()                          // LÍNEA 4: no numérico
    expect(resultado[2][1]).toBeNaN()                          // LÍNEA 4: NaN
    expect(resultado[2][2]).toBeNaN()                          // LÍNEA 4: min===max
    expect(resultado[3][1]).toBe(50)                           // LÍNEA 5: (15-10)/(20-10)*100=50
  })
})