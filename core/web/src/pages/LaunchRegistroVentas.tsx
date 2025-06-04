import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BlueButton from "../components/BlueButton";
import ProgressBar from "../components/ProgressBar";
import WhiteButton from "../components/WhiteButton";
import { usePrompt } from "../contexts/PromptContext";
import { API_URL } from "@/utils/constants";
import { getConfig } from "@/utils/auth";

//Definir tipos de datos
type Mes = {
  id: string;
  mes: string;
  año: number;
  numeroMes: number;
};

//Definir tipo de ventas
type Ventas = {
  [key: string]: string | null;
};

//Definir tipo de la solicitud que se envía al backend
type SaleRequest = {
  id: number;
  resource_id: number;
  month: number;
  year: number;
  units_sold: number;
};

//Función que genera 12 meses atrás desde el mes actual para el registro de ventas. 
const generarMesesAtras = (): Mes[] => {
  const meses: Mes[] = [];
  const nombresMeses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  //Define la fecha actual
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

//Función que obtiene el user_id del usuario autenticado
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

//Componente que maneja el registro de ventas
export default function LaunchRegistroVentas() {
  const [meses] = useState<Mes[]>(generarMesesAtras());
  const [ventas, setVentas] = useState<Ventas>(
    meses.reduce((acc, mes) => ({ ...acc, [mes.id]: "" }), {})
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { productId, setHasSalesData } = usePrompt();

  const handleChange = (id: string, value: string) => {
    if (value && Number(value) < 0) {
      setError("No se permiten valores negativos en las ventas");
      return;
    }

    setVentas(prev => ({ ...prev, [id]: value }));
    setError(null);
  };

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
      // Filtrar solo los meses con ventas registradas
      const mesesConVentas = meses.filter(mes => ventas[mes.id] && ventas[mes.id] !== "");

      if (mesesConVentas.length === 0) {
        setError("Debes registrar al menos un mes de ventas para continuar");
        return; 
      }

      // Enviar cada venta al backend
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

      // Verificar que todas las respuestas sean exitosas
      for (const response of responses) {
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Error al guardar ventas');
        }
      }

      console.log("Ventas guardadas exitosamente");
      navigate("/launchConfirmacion");
    } catch (err) {
      console.error("Error al guardar ventas:", err);
      // setError(err.message || "Ocurrió un error al guardar las ventas. Por favor intenta nuevamente.");
      setError(
        err instanceof Error
          ? err.message
          : "Ocurrió un error al guardar las ventas. Por favor intenta nuevamente."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelar = () => {
    navigate("/launchVentas");
  }

  return (
    <div>
      <ProgressBar activeStep={2} />
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
