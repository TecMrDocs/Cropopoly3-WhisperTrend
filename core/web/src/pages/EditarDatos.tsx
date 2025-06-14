/**
 * Página: EditarDatos.tsx
 * 
 * Descripción:
 * Este componente permite al usuario editar los datos históricos de ventas mensuales de un producto o servicio.
 * Carga automáticamente los últimos 12 meses y muestra una tabla editable. Los datos se pueden guardar nuevamente
 * en el backend. También permite navegar entre la edición de información general y ventas.
 * 
 * Autor: Santiago Villazón Ponce de León
 * Contribuyentes: Arturo Barrios Mendoza
 */

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { usePrompt } from "../contexts/PromptContext";
import { API_URL } from "@/utils/constants";
import { getConfig } from "@/utils/auth";
import BlueButton from "../components/BlueButton";
import WhiteButton from "../components/WhiteButton";

/**
 * Representa un mes y su posición en el tiempo (número y año).
 */
type Mes = {
  id: string;
  mes: string;
  año: number;
  numeroMes: number;
};

/**
 * Estructura para almacenar las ventas por mes, mapeadas por su ID.
 */
type Ventas = {
  [key: string]: string | null;
};

/**
 * Objeto enviado al backend con los datos de una venta mensual.
 */
type SaleRequest = {
  id: number;
  resource_id: number;
  month: number;
  year: number;
  units_sold: number;
};

/**
 * Genera una lista de los últimos 12 meses desde la fecha actual.
 * 
 * @return {Mes[]} Lista ordenada cronológicamente de meses anteriores.
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
      numeroMes: mesActual + 1,
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
 * Obtiene el ID del usuario autenticado consultando el endpoint `/auth/check`.
 * 
 * @return {Promise<number | null>} El ID del usuario o null si falla.
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
 * Componente principal que permite editar las ventas mensuales de un producto ya creado.
 */
export default function EditarDatos() {
  const navigate = useNavigate();
  const location = useLocation();

  const [meses] = useState<Mes[]>(generarMesesAtras());
  const [ventas, setVentas] = useState<Ventas>(
    meses.reduce((acc, mes) => ({ ...acc, [mes.id]: "" }), {})
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isSuccess, setIsSuccess] = useState(true);

  const { productId, setHasSalesData } = usePrompt();

  /**
   * Actualiza el valor de ventas para un mes específico. 
   * Evita números negativos.
   * 
   * @param {string} id - ID del mes (formato AAAA-MM).
   * @param {string} value - Valor numérico ingresado.
   */
  const handleChange = (id: string, value: string) => {
    if (value && Number(value) < 0) {
      setError("No se permiten valores negativos en las ventas");
      return;
    }
    setVentas((prev) => ({ ...prev, [id]: value }));
    setError(null);
  };

  /**
   * Guarda los datos de ventas ingresados para el producto.
   * Envía una petición por cada mes registrado.
   */
  const handleGuardar = async () => {
    const hasData = meses.some(mes => ventas[mes.id] && ventas[mes.id] !== "");
    setHasSalesData(hasData);

    if (!hasData) {
      setError("Debes registrar al menos un mes de ventas para continuar");
      return;
    }

    const userId = await getUserId();
    if (!userId) {
      alert("Token inválido. Inicia sesión de nuevo.");
      return;
    }

    if (!productId) {
      setError("Falta información del producto. Por favor, regresa al paso anterior.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const mesesConVentas = meses.filter(mes => ventas[mes.id]);
      const requests = mesesConVentas.map(mes => {
        const saleData: SaleRequest = {
          id: userId,
          resource_id: productId,
          month: mes.numeroMes,
          year: mes.año,
          units_sold: Number(ventas[mes.id])
        };

        return fetch(`${API_URL}sale`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...getConfig().headers,
          },
          body: JSON.stringify(saleData)
        });
      });

      const responses = await Promise.all(requests);

      for (const res of responses) {
        if (!res.ok) {
          const msg = await res.text();
          throw new Error(msg || "Error al guardar ventas");
        }
      }

      setIsSuccess(true);
      setShowModal(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error inesperado al guardar ventas"
      );
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Al montar el componente, carga las ventas existentes del producto si hay un `productId`.
   * Los valores se agrupan y se insertan en la tabla editable.
   */
  useEffect(() => {
    const cargarVentas = async () => {
      if (!productId) return;

      try {
        const res = await fetch(`${API_URL}sale/resource/${productId}`, getConfig());

        if (!res.ok) throw new Error("No se pudieron obtener las ventas");

        const data: {
          month: number;
          year: number;
          units_sold: number;
        }[] = await res.json();

        const ventasAgrupadas: { [key: string]: number } = {};
        for (const venta of data) {
          const id = `${venta.year}-${String(venta.month).padStart(2, "0")}`;
          ventasAgrupadas[id] = venta.units_sold;
        }

        setVentas((prev) =>
          meses.reduce((acc, mes) => {
            const id = mes.id;
            acc[id] = ventasAgrupadas[id]?.toString() || "";
            return acc;
          }, {} as Ventas)
        );
      } catch (error) {
        console.error("Error cargando ventas existentes:", error);
      }
    };

    cargarVentas();
  }, [productId]);

  /**
   * Renderiza el formulario de edición de ventas con una tabla y acciones de guardar/cancelar.
   */
  return (
    <div className="p-8">
      {/* Tabs para navegación entre edición de producto y ventas */}
      <div className="flex justify-center mb-6">
        <div className="flex border rounded-md overflow-hidden">
          <button
            className={`px-6 py-2 font-semibold ${
              location.pathname === "/editarProducto"
                ? "bg-gradient-to-r from-[#00BFB3] to-[#0091D5] text-white"
                : "bg-white text-black"
            }`}
            onClick={() => navigate("/editarProducto")}
          >
            Editar información del producto
          </button>
          <button
            className={`px-6 py-2 font-semibold ${
              location.pathname === "/editarDatos"
                ? "bg-gradient-to-r from-[#00BFB3] to-[#0091D5] text-white"
                : "bg-white text-black"
            }`}
            onClick={() => navigate("/editarDatos")}
          >
            Editar datos de ventas
          </button>
        </div>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative w-[80%] mx-auto mb-4">
          {error}
        </div>
      )}

      <p className="text-center text-lg mb-6 w-[600px] mx-auto">
        Si lo deseas, podrás dejar campos vacíos si no cuentas con el dato del número de ventas que tuviste ese mes.
      </p>

      {/* Tabla editable */}
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
                    className="w-full p-1 border border-gray-300 rounded"
                    placeholder="Ej. 120"
                    value={ventas[fila.id] || ""}
                    onChange={(e) => handleChange(fila.id, e.target.value)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Botones */}
      <div className="flex flex-row justify-center gap-10 mt-8">
        <WhiteButton
          text="Cancelar"
          width="200px"
          onClick={() => navigate("/productos")}
        />
        <BlueButton
          text={isLoading ? "Guardando..." : "Guardar"}
          width="200px"
          onClick={handleGuardar}
        />
      </div>

      {/* Modal de resultado */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-8 text-center space-y-6 w-[90%] max-w-md shadow-lg">
            <h3 className="text-xl font-bold text-[#141652]">
              {isSuccess ? "Cambios realizados con éxito" : "Ocurrió un error"}
            </h3>
            <p className="text-sm text-gray-700">
              {isSuccess
                ? "La información del producto fue actualizada correctamente."
                : "No se pudieron guardar los cambios. Por favor, intenta de nuevo más tarde."}
            </p>
            <button
              onClick={() => navigate("/productos")}
              className="mt-4 px-6 py-2 bg-gradient-to-r from-[#00BFB3] to-[#0091D5] text-white rounded-full hover:scale-105 transition"
            >
              Aceptar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
