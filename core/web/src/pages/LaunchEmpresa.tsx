import ProgressBar from "../components/ProgressBar";
import TextFieldWHolder from "../components/TextFieldWHolder";
import BackButton from "../components/BackButton";
import AcceptButton from "../components/AcceptButton";
import SelectField from "../components/SelectField";

export default function LaunchEmpresa() {
  const industrias: string[] = ["Manufactura", "Moda", "Alimentos", "Tecnología", "Salud"];
  const opcionesColabs: string[] = ["10 o menos", 
    "Entre 11 y 50", 
    "Entre 51 y 250", 
    "Más de 250"];
    const alcances: string[] = ["Internacional", "Nacional", "Local"];

  return(
    <div className="flex flex-col items-center h-screen bg-white">
      <ProgressBar activeStep={0} />
      <h1 className="text-4xl font-bold mt-2 text-center">Primero, cuéntanos sobre tu empresa</h1>
      <p className="text-xl mt-10 text-center">¿Cuál es el nombre de tu empresa?</p>
      <div className="mt-3">
        <TextFieldWHolder placeholder="Escribe el nombre de tu empresa" width="600px" />
      </div>
      <p className="text-xl mt-10 text-center">¿Cuál es la industria a la que te dedicas?</p>
      <div className="mt-3">
        <SelectField options={industrias} width="300px" placeholder="Selecciona tu industria" />
      </div>
      <p className="text-xl mt-10 text-center">¿Cuántas personas trabajan en tu empresa?</p>
      <div className="mt-3">
        <SelectField options={opcionesColabs} width="300px" placeholder="Selecciona el número de empleados" />
      </div>
      <p className="text-xl mt-10 text-center">¿Cuál es tu alcance geográfico?</p>
      <div className="mt-3">
        <SelectField options={alcances} width="300px" placeholder="Selecciona tu alcance" />
      </div>
      <p className="text-xl mt-10 text-center">¿En qué país y ciudades desarrollas tus operaciones?</p>
      <p className="text-xl mt-10 text-center">¿Cuántas sucursales o establecimientos tienes?</p>
      <div className="mt-3">
        <TextFieldWHolder placeholder="Escribe tu número de sucursales" width="260px" />
      </div>
      <div className="w-300">
        <BackButton text="Regresar" />
      </div>
      <div className="w-300">
        <AcceptButton text="Continuar" />
      </div>
    </div>
  );
}