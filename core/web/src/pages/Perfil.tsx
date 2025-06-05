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
      [field]: value,
    }));
  };

  const handleSave = () => {
    setShowAlert(true);
    setTimeout(() => {
      setShowAlert(false);
    }, 3000);
  }

  return (
    <div className="px-24">
      <div className='flex items-center justify-center text-center'>
        <h1 className="text-3xl font-bold">Edita tus datos personales</h1>
      </div>
      <div className='grid grid-cols-2 gap-6 justify-center pt-7'>
        <TextFieldWHolder
          id="Nombre"
          placeholder="Ingrese su nombre"
          width="100%"
          label="Nombre(s)"
          onChange={(e) => handleInputChange("name", e.target.value)} />
        <TextFieldWHolder
          id="Apellido"
          placeholder="Ingrese su apellido(s)"
          width="100%"
          label="Apellido(s)"
          onChange={(e) => handleInputChange("lastName", e.target.value)}
          value={userFormData.lastName}
        />
      </div>
      <div className="grid grid-cols-1 gap-5 items-center justify-center">
        <TextFieldWHolder
          id="Correo"
          placeholder="mail@example.com"
          width="100%"
          label="Correo electrónico"
          onChange={(e) => handleInputChange("email", e.target.value)}
          value={userFormData.email}
        />
        <TextFieldWHolder
          id="Confirma correo"
          label="Confirma tu correo"
          width="100%"
        />
        <TextFieldWHolder
          id="Telefono"
          label="Número telefónico"
          width="100%"
          placeholder="+55 12 1234 5678"
          onChange={(e) => handleInputChange("phone", e.target.value)}
          value={userFormData.phone}
        />
        <TextFieldWHolder
          id="Puesto"
          label="Puesto o cargo en la empresa"
          width="100%"
          onChange={(e) => handleInputChange("job", e.target.value)}
          value={userFormData.job}
        />
        <TextFieldWHolder
          id="Contraseña"
          label="Contraseña"
          width="100%"
          onChange={(e) => handleInputChange("password", e.target.value)}
          value={userFormData.password}
        />
        <TextFieldWHolder
          id="Confirma contraseña"
          label="Confirma tu contraseña"
          width="100%"
        />
      </div>
      <div className="grid grid-cols-2 justify-center gap-10 pt-7">
        <WhiteButton text="Cancelar" width="100%" />
        <BlueButton text="Guardar" width="100%" onClick={handleSave} />
      </div>
      {showAlert && <SaveAlert />}
    </div>
  );
}