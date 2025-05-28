import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { API_URL } from "@/utils/constants";
import { getConfig } from "@/utils/auth";
import ProgressBar from "../components/ProgressBar";
import BlueButton from "../components/BlueButton";

export default function LaunchProcess() {
  const [nombreUsuario, setNombreUsuario] = useState("");

  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/launchEmpresa");
  };

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
      <h1 className="text-4xl font-bold mt-10 text-center">¡Hola {nombreUsuario}!</h1>
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