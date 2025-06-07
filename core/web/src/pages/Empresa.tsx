import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "@/utils/constants";
import { getConfig } from "@/utils/auth";
import { usePrompt } from "../contexts/PromptContext";
import TextFieldWHolder from "../components/TextFieldWHolder";
import SelectField from "../components/SelectField";
import TextAreaField from "../components/TextAreaField";
import WhiteButton from "../components/WhiteButton";
import BlueButton from "../components/BlueButton";

export default function Empresa() {
  const navigate = useNavigate();
  const { setEmpresa } = usePrompt();

  const industrias: string[] = ["Manufactura", "Moda", "Alimentos", "Tecnología", "Salud"];
  const opcionesColabs: string[] = ["10 o menos",
    "Entre 11 y 50",
    "Entre 51 y 250",
    "Más de 250"];
  const alcances: string[] = ["Internacional", "Nacional", "Local"];

  const [nombreEmpresa, setNombreEmpresa] = useState("");
  const [industria, setIndustria] = useState("");
  const [numEmpleados, setNumEmpleados] = useState("");
  const [alcance, setAlcance] = useState("");
  const [operaciones, setOperaciones] = useState("");
  const [sucursales, setSucursales] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [showModal, setShowModal] = useState(false);
  const [isSuccess, setIsSuccess] = useState(true);

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

  useEffect(() => {
    const fetchBusinessData = async () => {
      try {
        const userId = await getUserId();
        if (!userId) return;
  
        const res = await fetch(`${API_URL}user/${userId}`, getConfig());
        if (!res.ok) throw new Error("Error al obtener datos del usuario");
  
        const data = await res.json();
  
        setNombreEmpresa(data.business_name || "");
        setIndustria(data.industry || "");
        setOperaciones(data.locations || "");
        setAlcance(data.scope || "");
        setSucursales(data.num_branches || "");
  
        if (data.company_size === "micro empresa") setNumEmpleados("10 o menos");
        else if (data.company_size === "pequeña empresa") setNumEmpleados("Entre 11 y 50");
        else if (data.company_size === "empresa mediana") setNumEmpleados("Entre 51 y 250");
        else if (data.company_size === "empresa grande") setNumEmpleados("Más de 250");
      } catch (err) {
        console.error("Error al cargar los datos de la empresa:", err);
      }
    };
  
    fetchBusinessData();
  }, []);

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
    
      setIsSuccess(res.ok);
      setEmpresa(payload);
    } catch (err) {
      console.error("Error de red:", err);
      setIsSuccess(false);
    } finally {
      setShowModal(true);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-white">
      <h1 className="text-4xl font-bold mt-2 text-center">Edita la información de tu empresa</h1>
      <p className="text-xl mt-10 text-center">¿Cuál es el nombre de tu empresa?</p>
      <div className="mt-3">
        <TextFieldWHolder id="Nombre empresa" label="Nombre de tu Empresa" placeholder="Escribe el nombre de tu empresa" width="600px" value={nombreEmpresa} onChange={(e) => setNombreEmpresa(e.target.value)} />
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
          id="Operaciones"
          label="Operaciones"
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
              id="Sucursales"
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
        <WhiteButton text="Cancelar" width="200px" onClick={() => navigate("/productos")} />
        <BlueButton text="Guardar" width="200px" onClick={handleSubmit} />
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-8 text-center space-y-6 w-[90%] max-w-md shadow-lg">
            <h3 className="text-xl font-bold text-[#141652]">
              {isSuccess ? "Cambios realizados con éxito" : "Ocurrió un error"}
            </h3>
            <p className="text-sm text-gray-700">
              {isSuccess
                ? "La información de la empresa fue actualizada correctamente."
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
