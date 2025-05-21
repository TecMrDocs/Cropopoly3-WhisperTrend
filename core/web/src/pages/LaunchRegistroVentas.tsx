import { useState } from "react";
import BlueButton from "../components/BlueButton";
import ProgressBar from "../components/ProgressBar";
import WhiteButton from "../components/WhiteButton";

const meses = [
  { mes: "Mayo", año: 2024 },
  { mes: "Junio", año: 2024 },
  { mes: "Julio", año: 2024 },
  { mes: "Agosto", año: 2024 },
  { mes: "Septiembre", año: 2024 },
  { mes: "Octubre", año: 2024 },
  { mes: "Noviembre", año: 2024 },
  { mes: "Diciembre", año: 2024 },
  { mes: "Enero", año: 2025 },
  { mes: "Febrero", año: 2025 },
  { mes: "Marzo", año: 2025 },
  { mes: "Abril", año: 2025 },
];

export default function LaunchRegistroVentas() {
  const [ventas, setVentas] = useState(Array(meses.length).fill(""));

  const handleChange = (index, value) => {
    const nuevasVentas = [...ventas];
    nuevasVentas[index] = value;
    setVentas(nuevasVentas);
  };

  const handleGuardar = () => {
    console.log("Datos de ventas:", ventas);
    // Aquí podrías enviar los datos a un backend si lo deseas
  };

  return (
    <div>
      <ProgressBar activeStep={2} />
      <h1 className="text-center mb-4 text-[#141652] text-2xl font-semibold">Registro de ventas</h1>
      <h3 className="text-lg font-w100 pt-8 pb-8 w-[80%] mx-auto text-center">
        Si lo deseas, podrás poner algún campo vacío en caso de no contar con el dato del número de ventas que tuviste ese mes
      </h3>

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
            {meses.map((fila, index) => (
              <tr key={index}>
                <td className="border border-black px-4 py-2">{fila.mes}</td>
                <td className="border border-black px-4 py-2">{fila.año}</td>
                <td className="border border-black px-4 py-2">
                  <input
                    type="number"
                    placeholder="Ej. 120"
                    className="w-full p-1 border border-gray-300 rounded"
                    value={ventas[index]}
                    onChange={(e) => handleChange(index, e.target.value)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="text-lg font-w100 pt-8 pb-8 w-[80%] mx-auto text-center">
        Si lo deseas, más adelante podrás editar esta información
      </h3>

      <div className="flex flex-row justify-center gap-100 p-10">
        <WhiteButton text="Cancelar" width="200px" />
        <BlueButton text="Guardar" width="200px" onClick={handleGuardar} />
      </div>
    </div>
  );
}