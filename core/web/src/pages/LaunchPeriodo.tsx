import { useState } from "react";
import ProgressBar from "../components/ProgressBar";
import SelectField from "../components/SelectField";
import BlueButton from "../components/BlueButton";
import WhiteButton from "../components/WhiteButton";
import { useNavigate } from "react-router-dom";

export default function LaunchPeriodo() {
  const tiempo: string[] = ["Mes", "Bimestre"];
  const [tiempoSeleccionado, setTiempoSeleccionado] = useState("");
  const navigate = useNavigate();

  const handleGuardar = () => {
    navigate("/launchRegistroVentas");
  }

  const handleCancelar = () => {
    navigate("/launchVentas");
  }

  return (
    <div>
      <ProgressBar activeStep={2} />
      <h1 className="text-center mb-4 text-[#141652] text-2xl font-semibold w-[80%] mx-auto">Mientras más exactos sean tus datos, más preciso será el análisis, pero también puedes ingresar valores muy aproximados a tus ventas reales de “Bolso Marianne”</h1>
      <p className="text-xl mt-10 text-center">Registrar tu número de ventas por:</p>
      <div className="mt-3 flex justify-center">
        <SelectField
          options={tiempo}
          width="300px"
          placeholder="Elige una opción"
          value={tiempoSeleccionado}
          onChange={(e) => setTiempoSeleccionado(e.target.value)}
        />
      </div>
      <div className="flex flex-row justify-center gap-100 p-10">
        <WhiteButton text="Cancelar" width="200px" onClick={handleCancelar}/>
        <BlueButton text="Guardar" width="200px" onClick={handleGuardar}/>
      </div>


    </div>

  );
}