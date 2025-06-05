/**
 * Componente: LaunchProcess
 * Authors: Arturo Barrios Mendoza
 * Descripción: Página inicial del proceso de lanzamiento de la aplicación.
 */

import { API_URL } from "@/utils/constants";
import { getConfig } from "@/utils/auth";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProgressBar from "../components/ProgressBar";
import BlueButton from "../components/BlueButton";

export default function LaunchProcess() {
  const [nombreUsuario, setNombreUsuario] = useState<string | null>(null);
  const navigate = useNavigate();

  // Función para obtener el ID del usuario
  useEffect(() => {
    const getUserData = async () => {
      try {
        const res = await fetch(`${API_URL}auth/check`, getConfig());
        if (!res.ok) throw new Error("Token inválido");

        const data = await res.json();
        setNombreUsuario(data.name);
      } catch (err) {
        console.error("Error obteniendo datos del usuario:", err);
        setNombreUsuario("usuario"); 
      }
    };

    getUserData();
  }, []);

  // Redirecciona al usuario a la página de registro de empresa
  const handleClick = () => {
    navigate("/launchEmpresa");
  };

  // Verifica si el usuario está autenticado al cargar la página
  useEffect(() => {
    const checkUser = async () => {
      try {
        const response = await fetch(`${API_URL}auth/check`, getConfig());
        if (!response.ok) {
          throw new Error("Token inválido");
        }
        const data = await response.json();
        setNombreUsuario(data.name);
      } catch (error) {
        console.error("Error al verificar el usuario:", error);
        navigate("/login");
      }
    };
    checkUser();
  }, []);

  return(
    <div className="flex flex-col items-center h-screen bg-white">
      <h1 className="text-4xl font-bold mt-10 text-center">
        ¡Hola {nombreUsuario ? nombreUsuario : "..." }!
      </h1>
      <p className="text-xl mt-10 text-center">Te damos la bienvenida a WhisperTrend</p>
      <p className="text-xl mt-10 text-center">¡Ayúdanos a conocerte para comenzar a descubrir las tendencias<br/>que dan futuro a tu industria</p>
      <p className="text-xl mt-10 mb-10 text-center">A continuación te mostramos el proceso</p>
      <ProgressBar activeStep={3} />
      <div className="flex justify-center items-center mt-6 w-50">
        <BlueButton text="Comenzar ahora" width="200px" onClick={handleClick} />
      </div>
    </div>
  );
}
