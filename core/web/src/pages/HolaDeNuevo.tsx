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
      navigate("/Dashboard");
    }
  };

  return (
    <div className='flex flex-col items-center justify-center'>
      <h1 className="text-2xl font-w700 text-[#141652] font-semibold">¡Hola de nuevo!</h1>
      <h3 className="text-lg font-w100 pt-8 pb-8">Ingresa el código de verificación que llegó a tu correo</h3>
      {/* <TextField label="Código de verificación:" width="500px" /> */}
      <label htmlFor="verify-input">Código de verificación:</label>
      <TextFieldWHolder
        id="verify-input"
        name="verify"
        placeholder="Ingrese su código de verificación"
        value={verify}
        onChange={(e) => setVerify(e.target.value)}
        hasError={!!error}
        width="400px"
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      <br></br>
      <BlueButton text="Continuar" width="200px" onClick={handleContinue} />
      <br></br>
      <p>¿No te llegó el código?</p>
      <WhiteButton text="Enviar un código nuevo" width="250px" />
    </div>
  );
}