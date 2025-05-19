import BlueButton from "../components/BlueButton";
import TextFieldWHolder from "../components/TextFieldWHolder";
import WhiteButton from "../components/WhiteButton";
import SaveAlert from "../components/saveAlert";
import { useState } from "react";

type EmpresaData = {
  name: string;
  industria: string;
  n_workers: string;
  alcance_geografico: string;
  locaciones: string;
  n_sucursales: string;
}

export default function Empresa() {
  const [empresaFormData, setEmpresaFormData] = useState<EmpresaData>({
    name: "",
    industria: "",
    n_workers: "",
    alcance_geografico: "",
    locaciones: "",
    n_sucursales: "",
  });

  const [showAlert, setShowAlert] = useState(false);
  
  const handleInputChange = (field: keyof EmpresaData, value: string) => {
    setEmpresaFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    setShowAlert(true);
    console.log(empresaFormData);
    setTimeout(() => {
      setShowAlert(false);
    }, 3000);
  }

  


  return(
    <div>
      <div className="flex items-center justify-center">
        <h1 className="text-3xl font-bold">Edita la información de tu empresa</h1>
      </div>
      <br></br>
      <div className="flex flex-col gap-6 justify-center items-center">
        <TextFieldWHolder 
            label="Nombre de la empresa" 
            width="600px" 
            placeholder="Artículos de piel..." 
            onChange={(e) => handleInputChange("name", e.target.value)}
        />
        <TextFieldWHolder 
            label="Industria" 
            width="500px" 
            placeholder="Textile, etc." 
            onChange={(e) => handleInputChange("industria", e.target.value)}
        />
        <TextFieldWHolder 
            label="Número de trabajadores" 
            width="500px" 
            placeholder="100" 
            onChange={(e) => handleInputChange("n_workers", e.target.value)}
        />
        <TextFieldWHolder 
            label="Alcance geográfico" 
            width="500px" 
            placeholder="México, EEUU, etc." 
            onChange={(e) => handleInputChange("alcance_geografico", e.target.value)}
        />
        <TextFieldWHolder 
            label="País y ciudades donde desarrollas tus operaciones" 
            width="700px" 
            placeholder="México, Ciudad de México, Guadalajara, etc." 
            onChange={(e) => handleInputChange("locaciones", e.target.value)}
        />
        <TextFieldWHolder 
            label="Número de sucursales" 
            width="500px" 
            placeholder="10" 
            onChange={(e) => handleInputChange("n_sucursales", e.target.value)}
        />
      </div>
      <br></br>

      <div className="flex flex-row justify-center gap-10">
        <WhiteButton text="Cancelar" width="300px" />
        <BlueButton text="Guardar" width="300px" onClick={handleSave}/>
          
      </div>
      {showAlert && <SaveAlert />}
    </div>
  );
}