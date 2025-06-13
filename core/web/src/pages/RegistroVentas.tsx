/**
 * Componente: LaunchRegistroVentas
 * 
 * Descripción:
 * Este componente permite al usuario registrar el número de ventas mensuales
 * de su producto o servicio en los últimos 12 meses. Se valida que no existan
 * valores negativos y se envía la información al backend. También maneja errores,
 * carga, y navegación al siguiente paso o cancelación.
 * 
 * Autor: -
 * Contribuyentes: Arturo Barrios Mendoza
 *
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BlueButton from "../components/BlueButton";
import WhiteButton from "../components/WhiteButton";
import { usePrompt } from "../contexts/PromptContext";
import { API_URL } from "@/utils/constants";
import { getConfig } from "@/utils/auth";

/**
 * Tipo que representa un mes con año, número de mes y nombre.
 */
type Mes = {
  id: string;
  mes: string;
  año: number;
  numeroMes: number;
};

/**
 * Objeto que contiene los valores de ventas por mes, indexados por ID.
 */
type Ventas = {
  [key: string]: string | null;
};

/**
 * Estructura que representa una venta individual enviada al backend.
 */
type SaleRequest = {
  id: number;
  resource_id: number;
  month: number;
  year: number;
  units_sold: number;
};

/**
 * Genera los 12 meses anteriores al mes actual para ser usados como filas del registro.
 *
 * @returns Lista de objetos tipo `Mes` con nombre, año y número del mes.
 */
const generarMesesAtras = (): Mes[] => {
  const meses: Mes[] = [];
  const nombresMeses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const fechaActual = new Date();
  let mesActual = fechaActual.getMonth();
  let añoActual = fechaActual.getFullYear();

  for (let i = 0; i < 12; i++) {
    const id = `${añoActual}-${String(mesActual + 1).padStart(2, '0')}`;
    meses.unshift({
      id,
      mes: nombresMeses[mesActual],
      año: añoActual,
      numeroMes: mesActual + 1
    });

    if (mesActual === 0) {
      mesActual = 11;
      añoActual--;
    } else {
      mesActual--;
    }
  }

  return meses;
};

/**
 * Solicita el ID del usuario autenticado al backend.
 *
 * @returns El ID del usuario si tiene sesión válida, `null` en caso contrario.
 */
const getUserId = async (): Promise<number | null> => {
  try {
    const res = await fetch(`${API_URL}auth/check`, getConfig());
    if (!res.ok) throw new Error("Token inválido");
    const data = await res.json();
    return data.id;
  } catch (err) {
    console.error("Error obteniendo user_id:", err);
    return null;
  }
};

/**
 * Componente funcional que representa el formulario de registro de ventas mensuales.
 */
export default function LaunchRegistroVentas() {
  const [meses] = useState<Mes[]>(generarMesesAtras());
  const [ventas, setVentas] = useState<Ventas>(
    meses.reduce((acc, mes) => ({ ...acc, [mes.id]: "" }), {})
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { productId, setHasSalesData } = usePrompt();

  /**
   * Actualiza el estado `ventas` con el valor ingresado para un mes específico.
   *
   * @param id ID del mes en formato YYYY-MM
   * @param value Valor numérico ingresado en el campo de ventas
   */
  const handleChange = (id: string, value: string) => {
    if (value && Number(value) < 0) {
      setError("No se permiten valores negativos en las ventas");
      return;
    }
    setVentas(prev => ({ ...prev, [id]: value }));
    setError(null);
  };

  /**
   * Maneja el evento de guardar ventas y enviarlas al backend.
   *
   * @param e Evento de formulario
   */
  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();

    const hasData = meses.some(mes => ventas[mes.id] && ventas[mes.id] !== "");
    setHasSalesData(hasData);

    if (!hasData) {
      console.log("No se registraron datos de ventas");
    }

    const userId = await getUserId();
    if (!userId) {
      alert("Token inválido. Inicia sesión de nuevo.");
      return;
    }

    if (!productId) {
      setError("Falta información del producto. Por favor, completa el paso de producto.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const mesesConVentas = meses.filter(mes => ventas[mes.id] && ventas[mes.id] !== "");

      if (mesesConVentas.length === 0) {
        setError("Debes registrar al menos un mes de ventas para continuar");
        return;
      }

      const requests = mesesConVentas.map(mes => {
        const saleData: SaleRequest = {
          id: userId,
          resource_id: productId,
          month: mes.numeroMes,
          year: mes.año,
          units_sold: Number(ventas[mes.id])
        };

        console.log("Json de ventas enviado al backend:", saleData);

        return fetch(`${API_URL}sale`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getConfig().headers
          },
          body: JSON.stringify(saleData)
        });
      });

      const responses = await Promise.all(requests);

      for (const response of responses) {
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Error al guardar ventas');
        }
      }

      console.log("Ventas guardadas exitosamente");
      navigate("/ConfirmaProducto");
    } catch (err) {
      console.error("Error al guardar ventas:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Ocurrió un error al guardar las ventas. Por favor intenta nuevamente."
      );
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Redirige al usuario a la pantalla anterior si decide cancelar el registro.
   */
  const handleCancelar = () => {
    navigate("/PrevioRegistroVentas");
  };

  return (
    <div>
      {/* <ProgressBar activeStep={2} /> */}
      <h1 className="text-center mb-4 text-[#141652] text-2xl font-semibold">
        Registro de ventas
      </h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative w-[80%] mx-auto mb-4">
          {error}
        </div>
      )}

      <h3 className="text-lg font-w100 pt-8 pb-8 w-[80%] mx-auto text-center">
        Si lo deseas, podrás poner algún campo vacío en caso de no contar con el dato del número de ventas que tuviste ese mes
      </h3>

      <form onSubmit={handleGuardar}>
        <div className="overflow-x-auto w-[90%] mx-auto">
          <table className="min-w-full table-auto border border-black text-center">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-black px-4 py-2">Mes</th>
                <th className="border border-black px-4 py-2">Año</th>
                <th className="border border-black px-4 py-2">Número de ventas</th>
              </tr>
            </thead>
            <tbody>
              {meses.map((fila) => (
                <tr key={fila.id}>
                  <td className="border border-black px-4 py-2">{fila.mes}</td>
                  <td className="border border-black px-4 py-2">{fila.año}</td>
                  <td className="border border-black px-4 py-2">
                    <input
                      type="number"
                      id={`ventas-${fila.id}`}
                      name={`ventas-${fila.id}`}
                      aria-label={`Ventas de ${fila.mes} ${fila.año}`}
                      placeholder="Ej. 120"
                      className="w-full p-1 border border-gray-300 rounded"
                      value={ventas[fila.id] || ""}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleChange(fila.id, e.target.value)
                      }
                      autoComplete="off"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-row justify-center gap-100 p-10">
          <WhiteButton
            text="Cancelar"
            width="200px"
            type="button"
            onClick={handleCancelar}
          />
          <BlueButton
            text={isLoading ? "Guardando..." : "Guardar"}
            width="200px"
            type="submit"
          />
        </div>
      </form>
    </div>
  );
}
