/**
 * Página: LaunchPeriodo.tsx
 * 
 * Descripción:
 * Esta vista permite al usuario seleccionar el periodo de tiempo (mes o bimestre) 
 * para registrar las ventas de su producto o servicio. Esta elección define cómo se organizarán 
 * los datos en los pasos posteriores del flujo de análisis.
 * 
 * Autor: Mariana Balderrábano Aguilar  
 * Contribuyentes: Arturo Barrios Mendoza
 */

import { useState } from "react";
import ProgressBar from "../components/ProgressBar";
import SelectField from "../components/SelectField";
import BlueButton from "../components/BlueButton";
import WhiteButton from "../components/WhiteButton";
import { useNavigate } from "react-router-dom";

/**
 * Componente principal de la vista que permite elegir 
 * el periodo de agrupación para los datos de ventas.
 */
export default function LaunchPeriodo() {
  /**
   * Opciones disponibles para seleccionar el periodo.
   * Actualmente disponibles: "Mes" y "Bimestre".
   */
  const tiempo: string[] = ["Mes", "Bimestre"];

  /**
   * Estado que almacena la opción seleccionada por el usuario.
   */
  const [tiempoSeleccionado, setTiempoSeleccionado] = useState("");

  const navigate = useNavigate();

  /**
   * Función que maneja el clic en el botón "Guardar".
   * Redirige a la pantalla de registro de ventas.
   */
  const handleGuardar = () => {
    navigate("/launchRegistroVentas");
  };

  /**
   * Función que maneja el clic en el botón "Cancelar".
   * Redirige a la pantalla anterior del flujo.
   */
  const handleCancelar = () => {
    navigate("/launchVentas");
  };

  /**
   * Renderiza la interfaz que permite al usuario seleccionar un periodo
   * para registrar ventas y navegar a los siguientes pasos del flujo.
   */
  return (
    <div>
      <ProgressBar activeStep={2} />

      <h1 className="text-center mb-4 text-[#141652] text-2xl font-semibold w-[80%] mx-auto">
        Mientras más exactos sean tus datos, más preciso será el análisis, pero también puedes ingresar valores muy aproximados a tus ventas reales de “Bolso Marianne”
      </h1>

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
        <WhiteButton 
          text="Cancelar" 
          width="200px" 
          onClick={handleCancelar}
        />
        <BlueButton 
          text="Guardar" 
          width="200px" 
          onClick={handleGuardar}
        />
      </div>
    </div>
  );
}
