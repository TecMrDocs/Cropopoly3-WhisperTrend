// core/web/src/tests/EditarProducto.test.tsx

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'

// ——————————————————————————————
// 1) Mock de useNavigate para espiar llamadas a navegación
// ——————————————————————————————
const navigateMock = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = (await vi.importActual('react-router-dom')) as any
  return {
    ...actual,
    useNavigate: () => navigateMock,
  }
})

// ——————————————————————————————
// 2) Mock de los subcomponentes usados en EditarProducto
// ——————————————————————————————
vi.mock('../src/components/BlueButton', () => ({
  default: ({ text, onClick }: any) => <button onClick={onClick}>{text}</button>,
}))
vi.mock('../src/components/WhiteButton', () => ({
  default: ({ text, onClick }: any) => <button onClick={onClick}>{text}</button>,
}))
vi.mock('../src/components/TextFieldWHolder', () => ({
  default: ({ label, value, onChange }: any) => (
    <div>
      <label>{label}</label>
      <input value={value} onChange={onChange} data-testid="nombre-input" />
    </div>
  ),
}))
vi.mock('../src/components/TextAreaField', () => ({
  default: ({ label, value, onChange }: any) => (
    <div>
      <label>{label}</label>
      <textarea value={value} onChange={onChange} data-testid="desc-input" />
    </div>
  ),
}))
vi.mock('../src/components/SelectField', () => ({
  default: ({ label, value, onChange }: any) => (
    <div>
      <label>{label}</label>
      <select value={value} onChange={onChange} data-testid="tipo-select">
        <option value="Producto">Producto</option>
        <option value="Servicio">Servicio</option>
      </select>
    </div>
  ),
}))

// ——————————————————————————————
// 3) Importar el componente bajo prueba
// ——————————————————————————————
import EditarProducto from '../pages/EditarProducto'

// ——————————————————————————————
// 4) Mock global.fetch por defecto (retorna { id: 3 } para getUserId)
// ——————————————————————————————
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ id: 3 }),
  })
) as any

// ——————————————————————————————
// 5) Estado simulado que recibe location.state
// ——————————————————————————————
const mockLocationState = {
  id: 1,
  name: 'Nombre Producto',
  description: 'Descripción...',
  r_type: 'Producto',
  related_words: 'calidad, diseño',
}

// ——————————————————————————————
// 6) Helper para renderizar con MemoryRouter y el state en location
// ——————————————————————————————
const renderWithRouter = () => {
  return render(
    <MemoryRouter initialEntries={[{ pathname: '/editarProducto', state: mockLocationState }]}>
      <EditarProducto />
    </MemoryRouter>
  )
}

// ——————————————————————————————
// 7) Suite de pruebas sobre EditarProducto
// ——————————————————————————————
describe('EditarProducto', () => {
  beforeEach(() => {
    // Reiniciar mocks y espías
    vi.clearAllMocks()
    // Restaurar fetch por defecto (getUserId -> { id: 3 })
    ;(global.fetch as unknown as vi.Mock).mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ id: 3 }),
      })
    )
  })

  it('carga los datos iniciales desde location.state', () => {
    renderWithRouter()

    // Verificar select “tipo”
    const tipoSelect = screen.getByTestId('tipo-select') as HTMLSelectElement
    expect(tipoSelect.value).toBe('Producto')

    // Verificar input “nombre”
    const nombreInput = screen.getByTestId('nombre-input') as HTMLInputElement
    expect(nombreInput.value).toBe('Nombre Producto')

    // Verificar textarea “descripción”
    const descInput = screen.getByTestId('desc-input') as HTMLTextAreaElement
    expect(descInput.value).toBe('Descripción...')

    // Verificar que aparezcan las palabras iniciales “calidad” y “diseño”
    expect(screen.getByText('calidad')).toBeInTheDocument()
    expect(screen.getByText('diseño')).toBeInTheDocument()
  })

  it('agrega una palabra nueva al hacer click en el botón de agregar', async () => {
    renderWithRouter()

    // Capturar el campo de texto para “palabra”
    const inputPalabra = screen.getByPlaceholderText('Ej. Elegancia') as HTMLInputElement
    // Capturar el botón “+” (el contenido SVG de Plus)
    const botonAgregar = screen.getByRole('button', { name: /.+/ }) // capturamos cualquier botón, ya que el SVG no tiene texto

    // Simular que el usuario escribe “innovación”
    fireEvent.change(inputPalabra, { target: { value: 'innovación' } })
    // Hacer click para agregar
    fireEvent.click(botonAgregar)

    // Esperar a que “innovación” aparezca en la lista
    await waitFor(() => {
      expect(screen.getByText('innovación')).toBeInTheDocument()
    })
  })

  it('no permite agregar palabras duplicadas ni más de 10', async () => {
    renderWithRouter()

    const inputPalabra = screen.getByPlaceholderText('Ej. Elegancia') as HTMLInputElement
    const botonAgregar = screen.getByRole('button', { name: /.+/ })

    // Ya existen 2 palabras: “calidad” y “diseño”
    // Agreguemos 8 más (para llegar a 10 máximas)
    for (let i = 0; i < 8; i++) {
      fireEvent.change(inputPalabra, { target: { value: `palabra${i}` } })
      fireEvent.click(botonAgregar)
      // Esperar que se agregue
      // Notar: no necesitamos esperar en cada iteración, pero lo hacemos para garantizar que el DOM se actualice
      /* eslint-disable-next-line no-await-in-loop */
      await waitFor(() => {
        expect(screen.getByText(`palabra${i}`)).toBeInTheDocument()
      })
    }

    // Intentar agregar la undécima palabra (índice 8 → la número 11 contando las iniciales)
    fireEvent.change(inputPalabra, { target: { value: 'palabra9' } })
    fireEvent.click(botonAgregar)

    // Verificar que “palabra9” NO aparece (porque ya hay 10 palabras)
    await waitFor(() => {
      expect(screen.queryByText('palabra9')).not.toBeInTheDocument()
    })

    // Intentar agregar un duplicado: “calidad”
    fireEvent.change(inputPalabra, { target: { value: 'calidad' } })
    fireEvent.click(botonAgregar)

    // Seguimos teniendo una sola etiqueta “calidad”
    const etiquetasCalidad = screen.getAllByText('calidad')
    expect(etiquetasCalidad.length).toBe(1)
  })

  it('elimina una palabra al hacer click en el ícono de eliminar', async () => {
    renderWithRouter()

    // “calidad” ya existe inicialmente
    const palabraCalidad = screen.getByText('calidad')
    // Obtenemos el botón de eliminar que está dentro del mismo <span> de “calidad”
    const botonEliminar = palabraCalidad.parentElement?.querySelector('button') as HTMLElement

    fireEvent.click(botonEliminar)

    // Esperar a que “calidad” desaparezca
    await waitFor(() => {
      expect(screen.queryByText('calidad')).not.toBeInTheDocument()
    })
  })

  it('muestra alerta si falta un campo obligatorio y no llama a fetch PUT', async () => {
    renderWithRouter()

    // Dejar el campo “Nombre” vacío
    const nombreInput = screen.getByTestId('nombre-input') as HTMLInputElement
    fireEvent.change(nombreInput, { target: { value: '' } })

    // Espiar window.alert
    const alertaSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})

    // Pulsar “Continuar”
    const botonContinuar = screen.getByRole('button', { name: 'Continuar' })
    fireEvent.click(botonContinuar)

    await waitFor(() => {
      expect(alertaSpy).toHaveBeenCalledWith('Todos los campos son obligatorios.')
    })

    // Verificar que no se haya llamado a fetch (ni check ni PUT)
    expect(global.fetch).toHaveBeenCalledTimes(0)

    alertaSpy.mockRestore()
  })

  it('realiza PUT con los datos correctos y navega a /launchVentas', async () => {
    // Mockear fetch para dos llamadas encadenadas:
    //  1) getUserId (auth/check) → { id: 3 }
    //  2) PUT a /resource/3/1 → { ok: true, json: { id: 3 } }
    let callCount = 0
    ;(global.fetch as unknown as vi.Mock).mockImplementation(() => {
      callCount++
      if (callCount === 1) {
        // Primera llamada: getUserId
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ id: 3 }),
        })
      }
      // Segunda llamada: PUT de actualización
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ id: 3 }),
      })
    })

    renderWithRouter()

    // Verificamos que los campos iniciales estén cargados
    const tipoSelect = screen.getByTestId('tipo-select') as HTMLSelectElement
    const nombreInput = screen.getByTestId('nombre-input') as HTMLInputElement
    const descInput = screen.getByTestId('desc-input') as HTMLTextAreaElement

    expect(tipoSelect.value).toBe('Producto')
    expect(nombreInput.value).toBe('Nombre Producto')
    expect(descInput.value).toBe('Descripción...')

    // Pulsar “Continuar” para disparar handleSubmit
    const botonContinuar = screen.getByRole('button', { name: 'Continuar' })
    fireEvent.click(botonContinuar)

    await waitFor(() => {
      // Debe haberse llamado a fetch dos veces (check y PUT)
      expect(global.fetch).toHaveBeenCalledTimes(2)

      // Verificar la URL de la segunda llamada (PUT)
      const segundaURL = (global.fetch as unknown as vi.Mock).mock.calls[1][0]
      expect(segundaURL).toBe('http://127.0.0.1:8080/api/v1/resource/3/1')

      // Verificar opciones del PUT (headers + body)
      const opcionesPUT = (global.fetch as unknown as vi.Mock).mock.calls[1][1]
      const bodyEnviado = JSON.parse(opcionesPUT.body)
      expect(bodyEnviado).toEqual({
        r_type: 'Producto',
        name: 'Nombre Producto',
        description: 'Descripción...',
        related_words: 'calidad, diseño',
      })

      // Verificar que navigate haya sido llamado con '/launchVentas'
      expect(navigateMock).toHaveBeenCalledWith('/launchVentas')
    })
  })

  it('muestra alerta si getUserId falla', async () => {
    // Mockear la primera llamada fetch para que devuelva ok: false
    ;(global.fetch as unknown as vi.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        text: () => Promise.resolve('error'),
      })
    )

    renderWithRouter()

    // Espiar window.alert
    const alertaSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})

    // Pulsar “Continuar”
    const botonContinuar = screen.getByRole('button', { name: 'Continuar' })
    fireEvent.click(botonContinuar)

    await waitFor(() => {
      expect(alertaSpy).toHaveBeenCalledWith('No se pudo obtener el usuario.')
    })

    // Sólo se llamó a fetch una vez (para check), no para PUT
    expect(global.fetch).toHaveBeenCalledTimes(1)

    alertaSpy.mockRestore()
  })

  it('muestra alerta si el PUT devuelve error (response.ok = false)', async () => {
    // Primera llamada a getUserId → { id: 3 }
    // Segunda llamada: PUT → ok: false
    let callCount = 0
    ;(global.fetch as unknown as vi.Mock).mockImplementation(() => {
      callCount++
      if (callCount === 1) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ id: 3 }),
        })
      }
      // Respuesta PUT con ok: false
      return Promise.resolve({
        ok: false,
        text: () => Promise.resolve('Error servidor'),
      })
    })

    renderWithRouter()

    // Espiar window.alert y console.error
    const alertaSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    // Pulsar “Continuar”
    const botonContinuar = screen.getByRole('button', { name: 'Continuar' })
    fireEvent.click(botonContinuar)

    await waitFor(() => {
      // Se llamó primero a check, luego a PUT (2 llamadas)
      expect(global.fetch).toHaveBeenCalledTimes(2)
      // Debe mostrar alerta “No se pudo actualizar el recurso.”
      expect(alertaSpy).toHaveBeenCalledWith('No se pudo actualizar el recurso.')
      // Verificar que console.error se haya invocado con el mensaje de la segunda llamada
      expect(consoleErrorSpy).toHaveBeenCalled()
    })

    alertaSpy.mockRestore()
    consoleErrorSpy.mockRestore()
  })

  it('llama a navigate(-1) al pulsar “Regresar”', () => {
    renderWithRouter()

    const botonRegresar = screen.getByRole('button', { name: 'Regresar' })
    fireEvent.click(botonRegresar)

    expect(navigateMock).toHaveBeenCalledWith(-1)
  })
})
