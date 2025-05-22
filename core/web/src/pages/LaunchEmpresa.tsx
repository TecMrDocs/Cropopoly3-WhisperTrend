import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ProgressBar from "../components/ProgressBar";
import TextFieldWHolder from "../components/TextFieldWHolder";
import SelectField from "../components/SelectField";
import TextAreaField from "../components/TextAreaField";
import WhiteButton from "../components/WhiteButton";
import BlueButton from "../components/BlueButton";

export default function LaunchEmpresa() {
  const token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6MywiZXhwIjoxNzQ5MjI4MTIwfQ.ysOpkiGz9d07Dm-d1og-xAoSFIf-V7laT8xWp4COPfc";

  const token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6MywiZXhwIjoxNzQ5MjI4MTIwfQ.ysOpkiGz9d07Dm-d1og-xAoSFIf-V7laT8xWp4COPfc";

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
  const [prompt1, setPrompt1] = useState("");
  const navigate = useNavigate();

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

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

  const handleReturn = () => {
    navigate("/launchProcess");
  };

  const getUserId = async (): Promise<number | null> => {
    try {
      const res = await fetch("http://127.0.0.1:8080/api/v1/auth/check", {
        headers: {
          token: token,
        },
      });
  
      if (!res.ok) throw new Error("Error al verificar usuario");
  
      const data = await res.json();
      return data.id;
    } catch (err) {
      console.error("Error obteniendo user_id:", err);
      return null;
    }
  };

  const handleSubmit = async () => {
  const getUserId = async (): Promise<number | null> => {
    try {
      const res = await fetch("http://127.0.0.1:8080/api/v1/auth/check", {
        headers: {
          token: token,
        },
      });
  
      if (!res.ok) throw new Error("Error al verificar usuario");
  
      const data = await res.json();
      return data.id;
    } catch (err) {
      console.error("Error obteniendo user_id:", err);
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!validarFormulario()) return;

    const userId = await getUserId();
    if (!userId) {
      alert("No se pudo obtener el usuario.");
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
    }
  
    try {
      const response = await fetch(`http://127.0.0.1:8080/api/v1/user/update/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
  
      if (!response.ok) {
        const msg = await response.text();
        console.error("Error al registrar información de empresa:", msg);
        alert("No se pudo registrar la información de la empresa.");
        return;
      }
  
      console.log("Información de empresa registrada con éxito");
      navigate("/launchProducto");
    } catch (err) {
      console.error("Error de red:", err);
      alert("Error de red o del servidor.");
    }
  };

    const userId = await getUserId();
    if (!userId) {
      alert("No se pudo obtener el usuario.");
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
    }
  
    try {
      const response = await fetch(`http://127.0.0.1:8080/api/v1/user/update/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
  
      if (!response.ok) {
        const msg = await response.text();
        console.error("Error al registrar información de empresa:", msg);
        alert("No se pudo registrar la información de la empresa.");
        return;
      }
  
      console.log("Información de empresa registrada con éxito");
      const prompt = promptBuilder1();
      console.log("Prompt: ", prompt);
      navigate("/launchProducto", { state: { prompt } });
    } catch (err) {
      console.error("Error de red:", err);
      alert("Error de red o del servidor.");
    }
  };

  const promptBuilder1 = () => {
    let ne = "";
    if (numEmpleados === "10 o menos") ne = "micro empresa";
    else if (numEmpleados === "Entre 11 y 50") ne = "pequeña empresa";
    else if (numEmpleados === "Entre 51 y 250") ne = "empresa mediana";
    else if (numEmpleados === "Más de 250") ne = "empresa grande";

    const t1 = "Me dedico a la industria de " + industria + ". ";
    const t2 = "Tengo una " + ne + " con alcance " + alcance + " y " + sucursales + " sucursales. ";
    const t3 = "Desarrollo mis operaciones en " + operaciones + ". ";

    return t1 + t2 + t3;
  }

  return(
    <div className="flex flex-col items-center h-screen bg-white">
      <ProgressBar activeStep={0} />
      <h1 className="text-4xl font-bold mt-2 text-center">Primero, cuéntanos sobre tu empresa</h1>
      <p className="text-xl mt-10 text-center">¿Cuál es el nombre de tu empresa?</p>
      <div className="mt-3">
        <TextFieldWHolder placeholder="Escribe el nombre de tu empresa" width="600px" value={nombreEmpresa} onChange={(e) => setNombreEmpresa(e.target.value)} />
        {errors.nombreEmpresa && (
          <p className="text-red-500 text-sm mt-1">{errors.nombreEmpresa}</p>
        )}
      </div>
      
      <p className="text-xl mt-10 text-center">¿Cuál es la industria a la que te dedicas?</p>
      <div className="mt-3">
        <SelectField options={industrias} width="300px" placeholder="Selecciona tu industria" value={industria} onChange={(e) => setIndustria(e.target.value)} />
        {errors.industria && (
          <p className="text-red-500 text-sm mt-1">{errors.industria}</p>
        )}
      </div>
      
      <p className="text-xl mt-10 text-center">¿Cuántas personas trabajan en tu empresa?</p>
      <div className="mt-3">
        <SelectField options={opcionesColabs} width="300px" placeholder="Selecciona el número de empleados" value={numEmpleados} onChange={(e) => setNumEmpleados(e.target.value)} />
        {errors.numEmpleados && (
          <p className="text-red-500 text-sm mt-1">{errors.numEmpleados}</p>
        )}
      </div>
      
      <p className="text-xl mt-10 text-center">¿Cuál es tu alcance geográfico?</p>
      <div className="mt-3">
        <SelectField options={alcances} width="300px" placeholder="Selecciona tu alcance" value={alcance} onChange={(e) => setAlcance(e.target.value)} />
        {errors.alcance && (
          <p className="text-red-500 text-sm mt-1">{errors.alcance}</p>
        )}
      </div>
      
      <p className="text-xl mt-10 text-center">¿En qué país y ciudades desarrollas tus operaciones?</p>
      <div className="mt-3">
        <TextAreaField placeholder="Escribe el país y las ciudades" maxLength={200} width="600px" value={operaciones} onChange={(e) => setOperaciones(e.target.value)} />
        {errors.operaciones && (
          <p className="text-red-500 text-sm mt-1">{errors.operaciones}</p>
        )}
      </div>
      
      <p className="text-xl mt-3 text-center">¿Cuántas sucursales o establecimientos tienes?</p>
      <div className="mt-3">
        <TextFieldWHolder placeholder="Escribe tu número de sucursales" width="260px" value={sucursales} onChange={(e) => setSucursales(e.target.value)} />
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