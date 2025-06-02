import { describe, it, expect } from 'vitest'

type DataValue = string | number
type DataRow = DataValue[]
type DataTable = DataRow[]

const normalizarTabla = (tabla: DataTable, min: number[], max: number[]): DataTable =>
  tabla.map((fila, filaIdx) =>
    filaIdx === 0 ? fila : fila.map((valor, colIdx) =>
      colIdx === 0 ? fila[0] :
      typeof valor !== "number" || isNaN(valor) || min[colIdx] === max[colIdx] ? NaN :
      ((valor - min[colIdx]) / (max[colIdx] - min[colIdx])) * 100
    )
  )

describe('normalizarTabla', () => {
  it('debe normalizar valores entre 0 y 100', () => {
    const tabla: DataTable = [
      ["Métrica", "Col1"],
      ["Tasa A", 10],
      ["Tasa B", 20]
    ]
    const min = [NaN, 10]
    const max = [NaN, 20]

    const resultado = normalizarTabla(tabla, min, max)
    
    expect(resultado[1]).toEqual(["Tasa A", 0])
    expect(resultado[2]).toEqual(["Tasa B", 100])
  })

  it('debe manejar casos donde min === max', () => {
    const tabla: DataTable = [["Métrica", "Col1"], ["Tasa", 10]]
    const resultado = normalizarTabla(tabla, [NaN, 10], [NaN, 10])
    
    expect(resultado[1][1]).toBeNaN()
  })
})