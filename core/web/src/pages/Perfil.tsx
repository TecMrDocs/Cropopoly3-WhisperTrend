import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "@/utils/constants";
import { getConfig } from "@/utils/auth";
import WhiteButton from "../components/WhiteButton";
import BlueButton from "../components/BlueButton";
import TextFieldWHolder from "../components/TextFieldWHolder";
import SaveAlert from "../components/saveAlert";

type PerfilData = {
  name: string;
  lastName: string;
  phone: string;
  job: string;
};

export default function Perfil() {
  const [userFormData, setUserFormData] = useState<PerfilData>({
    name: "",
    lastName: "",
    phone: "",
    job: "",
  });

  const [showModal, setShowModal] = useState(false);
  const [isSuccess, setIsSuccess] = useState(true);

  const [showAlert, setShowAlert] = useState(false);

  const navigate = useNavigate();

  const getUserId = async (): Promise<number | null> => {
    try {
      const res = await fetch(`${API_URL}auth/check`, getConfig());
  
      if (!res.ok) throw new Error("Error al verificar usuario");
  
      const data = await res.json();
      return data.id;
    } catch (err) {
      console.error("Error obteniendo user_id:", err);
      return null;
    }
  };

  const handleInputChange = (field: keyof PerfilData, value: string) => {
    setUserFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    const id = await getUserId();
    if (!id) return;
  
    try {
      const res = await fetch(`${API_URL}user/update/profile/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getConfig().headers,
        },
        body: JSON.stringify({
          name: userFormData.name,
          last_name: userFormData.lastName,
          phone: userFormData.phone,
          position: userFormData.job,
        }),
      });
  
      setIsSuccess(res.ok);
    } catch (err) {
      console.error("Error al guardar:", err);
      setIsSuccess(false);
    } finally {
      setShowModal(true);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const id = await getUserId();
      if (!id) return;
  
      try {
        const res = await fetch(`${API_URL}user/${id}`);
        if (!res.ok) throw new Error("No se pudo obtener el usuario");
  
        const data = await res.json();
        setUserFormData({
          name: data.name,
          lastName: data.last_name,
          phone: data.phone,
          job: data.position,
        });
      } catch (error) {
        console.error("Error obteniendo datos del usuario:", error);
      }
    };
  
    fetchUserData();
  }, []);

  return (
    <div className="px-24">
      <div className='flex items-center justify-center text-center'>
        <h1 className="text-3xl font-bold">Edita tus datos personales</h1>
      </div>
      <div className='grid grid-cols-2 gap-6 justify-center pt-7 mb-5'>
        <TextFieldWHolder
          id="Nombre"
          placeholder="Ingrese su nombre"
          width="100%"
          label="Nombre(s)"
          onChange={(e) => handleInputChange("name", e.target.value)}
          value={userFormData.name} />
        <TextFieldWHolder
          id="Apellido"
          placeholder="Ingrese su apellido(s)"
          width="100%"
          label="Apellido(s)"
          onChange={(e) => handleInputChange("lastName", e.target.value)}
          value={userFormData.lastName}
        />
      </div>
      <div className="grid grid-cols-1 gap-5 items-center justify-center mb-5">
      {/*
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
      */}
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
        {/*
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
        */}
      </div>
      <div className="grid grid-cols-2 justify-center gap-10 pt-7">
        <WhiteButton text="Cancelar" width="100%" onClick={() => navigate("/productos")} />
        <BlueButton text="Guardar" width="100%" onClick={handleSave} />
      </div>
      {showAlert && <SaveAlert />}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-8 text-center space-y-6 w-[90%] max-w-md shadow-lg">
            <h3 className="text-xl font-bold text-[#141652]">
              {isSuccess ? "Cambios realizados con éxito" : "Ocurrió un error"}
            </h3>
            <p className="text-sm text-gray-700">
              {isSuccess
                ? "La información del usuario fue actualizada correctamente."
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