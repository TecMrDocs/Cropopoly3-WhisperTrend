/**
 * Componente: LaunchEmpresa
 * Autor: Arturo Barrios Mendoza
 * Contribuyentes: —
 *
 * Descripción:
 * Este componente representa la primera etapa del proceso de registro. 
 * Permite al usuario ingresar información sobre su empresa, incluyendo nombre, industria, 
 * tamaño, alcance, ubicaciones y sucursales. Incluye validación de campos y envío al backend.
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "@/utils/constants";
import { getConfig } from "@/utils/auth";
import { usePrompt } from "../contexts/PromptContext";
import ProgressBar from "../components/ProgressBar";
import TextFieldWHolder from "../components/TextFieldWHolder";
import SelectField from "../components/SelectField";
import TextAreaField from "../components/TextAreaField";
import WhiteButton from "../components/WhiteButton";
import BlueButton from "../components/BlueButton";

export default function LaunchEmpresa() {
  /**
   * Hook de navegación de React Router para redirigir entre rutas.
   */
  const navigate = useNavigate();

  /**
   * Hook de contexto para obtener y actualizar la información de la empresa.
   */
  const { empresa, setEmpresa } = usePrompt();

  /**
   * Listas de opciones que se usan para campos de selección en el formulario.
   */
  const industrias: string[] = ["Manufactura", "Moda", "Alimentos", "Tecnología", "Salud"];
  const opcionesColabs: string[] = ["10 o menos", "Entre 11 y 50", "Entre 51 y 250", "Más de 250"];
  const alcances: string[] = ["Internacional", "Nacional", "Local"];

  /**
   * Mapea el tamaño de empresa a una de las opciones de selección.
   * @param size Tamaño en formato de texto (ej: "micro empresa")
   * @return Opcion correspondiente al tamaño
   */
  function mapSizeToOption(size: string): string {
    switch (size) {
      case "micro empresa":
        return "10 o menos";
      case "pequeña empresa":
        return "Entre 11 y 50";
      case "empresa mediana":
        return "Entre 51 y 250";
      case "empresa grande":
        return "Más de 250";
      default:
        return "";
    }
  }

  /**
   * Estados para manejar los valores de los campos del formulario.
   */
  const [nombreEmpresa, setNombreEmpresa] = useState(empresa?.business_name || "");
  const [industria, setIndustria] = useState(empresa?.industry || "");
  const [numEmpleados, setNumEmpleados] = useState(mapSizeToOption(empresa?.company_size || ""));
  const [alcance, setAlcance] = useState(empresa?.scope || "");
  const [operaciones, setOperaciones] = useState(empresa?.locations || "");
  const [sucursales, setSucursales] = useState(empresa?.num_branches || "");

  /**
   * Estado para manejar mensajes de error asociados a cada campo del formulario.
   */
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  /**
   * Valida los campos del formulario y asigna errores si es necesario.
   * @return boolean que indica si el formulario es válido o no
   */
  const validarFormulario = () => {
    const nuevosErrores: { [key: string]: string } = {};

    if (!nombreEmpresa.trim()) nuevosErrores.nombreEmpresa = "Este campo es obligatorio";
    if (!industria) nuevosErrores.industria = "Este campo es obligatorio";
    if (!numEmpleados) nuevosErrores.numEmpleados = "Este campo es obligatorio";
    if (!alcance) nuevosErrores.alcance = "Este campo es obligatorio";
    if (!operaciones.trim()) nuevosErrores.operaciones = "Este campo es obligatorio";

    if (!sucursales.trim()) {
      nuevosErrores.sucursales = "Este campo es obligatorio";
    } else if (!/^\d+$/.test(sucursales)) {
      nuevosErrores.sucursales = "Debe ser un número válido";
    }

    setErrors(nuevosErrores);

    return Object.keys(nuevosErrores).length === 0;
  };

  /**
   * Redirige al usuario a la pantalla anterior del proceso de lanzamiento.
   */
  const handleReturn = () => {
    navigate("/launchProcess");
  };

  /**
   * Verifica la sesión del usuario y obtiene su ID.
   * @return ID del usuario autenticado, o null si falla
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
   * Envía los datos del formulario al backend si son válidos y redirige al siguiente paso.
   */
  const handleSubmit = async () => {
    if (!validarFormulario()) return;

    const userId = await getUserId();
    if (!userId) {
      alert("Token inválido. Inicia sesión de nuevo.");
      return;
    }

    let ne = "";
    if (numEmpleados === "10 o menos") ne = "micro empresa";
    else if (numEmpleados === "Entre 11 y 50") ne = "pequeña empresa";
    else if (numEmpleados === "Entre 51 y 250") ne = "empresa mediana";
    else if (numEmpleados === "Más de 250") ne = "empresa grande";

    const payload = {
      business_name: nombreEmpresa,
      industry: industria,
      company_size: ne,
      scope: alcance,
      locations: operaciones,
      num_branches: sucursales,
    };

    try {
      const res = await fetch(`${API_URL}user/update/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getConfig().headers,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const msg = await res.text();
        console.error("Error al registrar empresa:", msg);
        alert("No se pudo registrar la empresa.");
        return;
      }

      setEmpresa(payload);
      navigate("/launchProducto");
    } catch (err) {
      console.error("Error de red:", err);
      alert("Ocurrió un error inesperado.");
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-white">
      <ProgressBar activeStep={0} />
      <h1 className="text-4xl font-bold mt-2 text-center">Primero, cuéntanos sobre tu empresa</h1>
      <p className="text-xl mt-10 text-center">¿Cuál es el nombre de tu empresa?</p>
      <div className="mt-3">
        <TextFieldWHolder
          id="nombreEmpresa"
          label="Nombre de la empresa"
          placeholder="Escribe el nombre de tu empresa"
          width="600px"
          value={nombreEmpresa}
          onChange={(e) => setNombreEmpresa(e.target.value)}
        />
        {errors.nombreEmpresa && (
          <p className="text-red-500 text-sm mt-1">{errors.nombreEmpresa}</p>
        )}
      </div>

      <p className="text-xl mt-10 text-center">¿Cuál es la industria a la que te dedicas?</p>
      <div className="mt-3">
        <SelectField
          options={industrias}
          width="300px"
          placeholder="Selecciona tu industria"
          value={industria}
          onChange={(e) => setIndustria(e.target.value)}
        />
        {errors.industria && (
          <p className="text-red-500 text-sm mt-1">{errors.industria}</p>
        )}
      </div>

      <p className="text-xl mt-10 text-center">¿Cuántas personas trabajan en tu empresa?</p>
      <div className="mt-3">
        <SelectField
          options={opcionesColabs}
          width="300px"
          placeholder="Selecciona el número de empleados"
          value={numEmpleados}
          onChange={(e) => setNumEmpleados(e.target.value)}
        />
        {errors.numEmpleados && (
          <p className="text-red-500 text-sm mt-1">{errors.numEmpleados}</p>
        )}
      </div>

      <p className="text-xl mt-10 text-center">¿Cuál es tu alcance geográfico?</p>
      <div className="mt-3">
        <SelectField
          options={alcances}
          width="300px"
          placeholder="Selecciona tu alcance"
          value={alcance}
          onChange={(e) => setAlcance(e.target.value)}
        />
        {errors.alcance && (
          <p className="text-red-500 text-sm mt-1">{errors.alcance}</p>
        )}
      </div>

      <p className="text-xl mt-10 text-center">¿En qué país y ciudades desarrollas tus operaciones?</p>
      <div className="mt-3">
        <TextAreaField
          label="Operaciones"
          id="operaciones"
          placeholder="Escribe el país y las ciudades"
          maxLength={200}
          width="600px"
          value={operaciones}
          onChange={(e) => setOperaciones(e.target.value)}
        />
        {errors.operaciones && (
          <p className="text-red-500 text-sm mt-1">{errors.operaciones}</p>
        )}
      </div>

      <p className="text-xl mt-3 text-center">¿Cuántas sucursales o establecimientos tienes?</p>
      <div className="mt-3">
        <TextFieldWHolder
          id="sucursales"
          label="Número de sucursales"
          placeholder="Escribe tu número de sucursales"
          width="260px"
          value={sucursales}
          onChange={(e) => setSucursales(e.target.value)}
        />
        {errors.sucursales && (
          <p className="text-red-500 text-sm mt-1">{errors.sucursales}</p>
        )}
      </div>

      <div className="flex justify-between items-center w-[80%] mt-10 pb-10">
        <WhiteButton text="Regresar" width="200px" onClick={handleReturn} />
        <BlueButton text="Continuar" width="200px" onClick={handleSubmit} />
      </div>
    </div>
  );
}
