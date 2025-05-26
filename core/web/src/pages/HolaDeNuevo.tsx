import WhiteButton from "../components/WhiteButton";
import BlueButton from "../components/BlueButton";
import TextFieldWHolder from "../components/TextFieldWHolder";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function HolaDeNuevo() {
  const [verify, setVerify] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleContinue = () => {
    if (!verify.trim()) {
      setError("El código de verificación es requerido");
    } else {
      setError("");
      // console.log("Código ingresado:", {verify});
      const jsonData = JSON.stringify({ verify });
      console.log("JSON generado:", jsonData);
      navigate("/productos");
    }
  };
  const handleReturn = () => {
    // navigate("/launchProcess");
    alert('Código nuevo enviado');
  };

  return (
    <div className='flex flex-col items-center justify-center w-full px-4'>
      <div className="w-full max-w-md">
        <h1 className="text-5xl font-bold text-blue-900 text-center">¡Hola de nuevo!</h1>
        <p className="text-3xl mb-8 pt-8 pb-8 text-center ">Ingresa el código de verificación que llegó a tu correo</p>
        
        <div className="w-full"> 
          <label htmlFor="verify-input" className="w-full text-center text-2xl font-bold text-black block mb-2">Código de verificación:</label>
          <TextFieldWHolder
            id="verify-input"
            name="verify"
            placeholder="Ingrese su código de verificación"
            value={verify}
            onChange={(e) => setVerify(e.target.value)}
            hasError={!!error}
            width="100%"
          />
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>

        <div className="mt-6 w-full flex flex-col items-center">
          <BlueButton text="Continuar" width="300px" onClick={handleContinue} />
          <p className="mt-4">¿No te llegó el código?</p>
          <WhiteButton 
            text="Enviar un código nuevo" 
            width="300px" 
            onClick={handleReturn}
          />
        </div>
      </div>
    </div>
  );

}