/**
 * Componente Perfil para la edición de datos personales del usuario.
 * Permite consultar, mostrar y actualizar la información básica como nombre,
 * apellido, teléfono y puesto o cargo dentro de la empresa.
 * Incluye validación mínima y muestra alertas modales según el resultado de la operación.
 * 
 * Autor: Sebastián Antonio Almanza
 * Contribuyentes: Mariana Balderrabano Aguilar (Front design)
 */

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

/**
 *
 * Función que genera un componente de perfil para la edición de datos personales del usuario.
 * 
 * @return {JSX.Element} Elemento JSX que representa el componente de perfil.
 */
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

  /**
   * Función para obtener el ID del usuario autenticado mediante un fetch a la API.
   * 
   * @async
   * @returns {Promise<number | null>} El ID del usuario o null en caso de error.
   */
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

  /**
   * Función para actualizar el estado del formulario cuando cambian los campos.
   * 
   * @param {keyof PerfilData} field - Campo que fue modificado.
   * @param {string} value - Nuevo valor del campo.
   */
  const handleInputChange = (field: keyof PerfilData, value: string) => {
    setUserFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  /**
   * Función para guardar los datos del perfil del usuario en el backend.
   * Realiza una petición POST con los datos actualizados.
   * 
   * Muestra un modal indicando éxito o fracaso.
   */
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

  /**
   * Hook useEffect para cargar los datos del usuario al montar el componente.
   * Realiza una llamada fetch para obtener los datos actuales y poblar el formulario.
   */
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
