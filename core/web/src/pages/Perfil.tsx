import WhiteButton from "../components/WhiteButton";
import BlueButton from "../components/BlueButton";
import TextFieldWHolder from "../components/TextFieldWHolder";
import { useState } from "react";
import SaveAlert from "../components/saveAlert";
type PerfilData = {
  name: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  job: string;
};

export default function Perfil() {
  const [userFormData, setUserFormData] = useState<PerfilData>({
    name: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    job: "",
  });

  const [showAlert, setShowAlert] = useState(false);

  const handleInputChange = (field: keyof PerfilData, value: string) => {
    setUserFormData(prev => ({
      ...prev,
      [field]:value,
    }));
  };





  const handleSave = () => {
    setShowAlert(true);
    console.log(userFormData);
    setTimeout(() => {
      setShowAlert(false);
    }, 3000);
  }

  return(
    <div>
      <div className='flex items-center justify-center'>
        <h1 className="text-3xl font-bold">Edita tus datos personales</h1>
      </div>
      <br></br>
      <div className='flex flex-row gap-6 justify-center'>
         <TextFieldWHolder 
              placeholder="Ingrese su nombre" 
              width="300px" 
              label="Nombre(s)"
              onChange={(e) => handleInputChange("name", e.target.value)}/>
         <TextFieldWHolder 
              placeholder="Ingrese su apellido(s)" 
              width="300px" 
              label="Apellido(s)" 
              onChange={(e) => handleInputChange("lastName", e.target.value)}
              value={userFormData.lastName}
              />
      </div>
      <br></br>
      <div className="flex flex-col gap-5 items-center justify-center">
        <TextFieldWHolder 
            placeholder="mail@example.com" 
            width="600px" 
            label="Correo electrónico" 
            onChange={(e) => handleInputChange("email", e.target.value)}
            value={userFormData.email}
        />
        <TextFieldWHolder 
            label="Confirma tu correo" 
            width="600px" 
            
            />
        <TextFieldWHolder 
            label="Número telefónico" 
            width="600px" 
            placeholder="+55 12 1234 5678" 
            onChange={(e) => handleInputChange("phone", e.target.value)}
            value={userFormData.phone}
            />
        <TextFieldWHolder 
            label="Puesto o cargo en la empresa" 
            width="600px" 
            onChange={(e) => handleInputChange("job", e.target.value)}
            value={userFormData.job}
            />
        <TextFieldWHolder 
            label="Contraseña" 
            width="600px" 
            onChange={(e) => handleInputChange("password", e.target.value)}
            value={userFormData.password}
            />
        <TextFieldWHolder label="Confirma tu contraseña" width="600px" />
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