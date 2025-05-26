import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import BlueButton from "../components/BlueButton";
import WhiteButton from "../components/WhiteButton";

type Venta = {
  mes: string;
  año: string;
  cantidad: string;
};

export default function EditarDatos() {
  const [ventas, setVentas] = useState<Venta[]>([
    { mes: "Mayo", año: "2024", cantidad: "50" },
    { mes: "Junio", año: "2024", cantidad: "193"},
  ]);

  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (index: number, field: keyof Venta, value: string) => {
    const actualizadas = [...ventas];
    actualizadas[index][field] = value;
    setVentas(actualizadas);
  };

  const agregarFila = () => {
    setVentas([...ventas, { mes: "", año: "", cantidad: "" }]);
  };

  const borrarFila = (index: number) => {
    const actualizadas = ventas.filter((_, i) => i !== index);
    setVentas(actualizadas);
  };

  return (
    <div className="p-8">
      {/* Tabs */}
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

      <p className="text-center text-lg mb-4 w-[600px] mx-auto">
        Si lo deseas, podrás poner algún campo vacío en caso de no contar con el dato del número de ventas que tuviste ese mes.
      </p>

      {/* Tabla editable */}
      <table className="border border-black text-center mb-6 mx-auto">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-black px-4 py-2">Mes</th>
            <th className="border border-black px-4 py-2">Año</th>
            <th className="border border-black px-4 py-2">Número de ventas</th>
            <th className="border border-black px-4 py-2">Eliminar</th>
          </tr>
        </thead>
        <tbody>
          {ventas.map((venta, index) => (
            <tr key={index}>
              <td className="border border-black px-4 py-2">
                <input
                  value={venta.mes}
                  onChange={(e) => handleChange(index, "mes", e.target.value)}
                  className="w-full p-1 text-center"
                />
              </td>
              <td className="border border-black px-4 py-2">
                <input
                  value={venta.año}
                  onChange={(e) => handleChange(index, "año", e.target.value)}
                  className="w-full p-1 text-center"
                />
              </td>
              <td className="border border-black px-4 py-2">
                <input
                  value={venta.cantidad}
                  onChange={(e) => handleChange(index, "cantidad", e.target.value)}
                  className="w-full p-1 text-center"
                />
              </td>
              <td className="border border-black px-4 py-2">
                <button
                  onClick={() => borrarFila(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Botón para agregar fila */}
      <button
        onClick={agregarFila}
        className="flex items-center gap-2 text-blue-600 mb-6 hover:scale-105 transition mx-auto"
      >
        <Plus /> Agregar fila
      </button>

      <div className="flex flex-row justify-center gap-10 mt-4">
        <WhiteButton text="Cancelar" width="300px" />
        <BlueButton text="Guardar" width="300px" />
      </div>
    </div>
  );
}