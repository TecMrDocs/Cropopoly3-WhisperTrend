import { useState } from "react";
import ProgressBar from "../components/ProgressBar";
import TextFieldWHolder from "../components/TextFieldWHolder";
import SelectField from "../components/SelectField";
import TextAreaField from "../components/TextAreaField";
import WhiteButton from "../components/WhiteButton";
import BlueButton from "../components/BlueButton";

export default function LaunchEmpresa() {
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

  const handleSubmit = () => {
    const data = {
      nombreEmpresa,
      industria,
      numEmpleados,
      alcance,
      operaciones,
      sucursales,
    };
    console.log("Formulario:", data);
  };

  return(
    <div className="flex flex-col items-center h-screen bg-white">
      <ProgressBar activeStep={0} />
      <h1 className="text-4xl font-bold mt-2 text-center">Primero, cuéntanos sobre tu empresa</h1>
      <p className="text-xl mt-10 text-center">¿Cuál es el nombre de tu empresa?</p>
      <div className="mt-3">
        <TextFieldWHolder placeholder="Escribe el nombre de tu empresa" width="600px" value={nombreEmpresa} onChange={(e) => setNombreEmpresa(e.target.value)} />
      </div>
      
      <p className="text-xl mt-10 text-center">¿Cuál es la industria a la que te dedicas?</p>
      <div className="mt-3">
        <SelectField options={industrias} width="300px" placeholder="Selecciona tu industria" value={industria} onChange={(e) => setIndustria(e.target.value)} />
      </div>
      
      <p className="text-xl mt-10 text-center">¿Cuántas personas trabajan en tu empresa?</p>
      <div className="mt-3">
        <SelectField options={opcionesColabs} width="300px" placeholder="Selecciona el número de empleados" value={numEmpleados} onChange={(e) => setNumEmpleados(e.target.value)} />
      </div>
      
      <p className="text-xl mt-10 text-center">¿Cuál es tu alcance geográfico?</p>
      <div className="mt-3">
        <SelectField options={alcances} width="300px" placeholder="Selecciona tu alcance" value={alcance} onChange={(e) => setAlcance(e.target.value)} />
      </div>
      
      <p className="text-xl mt-10 text-center">¿En qué país y ciudades desarrollas tus operaciones?</p>
      <div className="mt-3">
        <TextAreaField placeholder="Escribe el país y las ciudades" maxLength={200} width="600px" value={operaciones} onChange={(e) => setOperaciones(e.target.value)} />
      </div>
      
      <p className="text-xl mt-3 text-center">¿Cuántas sucursales o establecimientos tienes?</p>
      <div className="mt-3">
        <TextFieldWHolder placeholder="Escribe tu número de sucursales" width="260px" value={sucursales} onChange={(e) => setSucursales(e.target.value)} />
      </div>
      <div className="flex justify-between items-center w-[80%] mt-10 pb-10">
        <WhiteButton text="Regresar" width="200px" />
        <BlueButton text="Continuar" width="200px" onClick={handleSubmit} />
      </div>
    </div>
  );
}