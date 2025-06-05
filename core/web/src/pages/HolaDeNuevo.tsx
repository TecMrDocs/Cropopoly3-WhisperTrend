// HolaDeNuevo.tsx
import WhiteButton from "../components/WhiteButton";
import BlueButton from "../components/BlueButton";
import TextFieldWHolder from "../components/TextFieldWHolder";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function HolaDeNuevo() {
  const [verify, setVerify] = useState("");
  const [error, setError] = useState("");
  const [apiError, setApiError] = useState("");
  const { verifyCode } = useAuth();

  const handleContinue = async () => {
    if (!verify.trim()) {
      setError("El código de verificación es requerido");
      return;
    }
    setError("");
    setApiError("");

    try {
      // Llamamos al context.verifyCode; si sale bien, el provider hará isAuthenticated=true
      await verifyCode(verify.trim());
      // Nota: el propio verifyCode, al terminar, redirige a /productos
    } catch (err: any) {
      // Si la verificación falla, mostramos un mensaje
      setApiError("Código inválido. Inténtalo de nuevo.");
    }
  };

  const handleReturn = () => {
    // Aquí podrías llamar a un endpoint que reenvíe un nuevo código por email
    alert("Se ha enviado un nuevo código a tu correo.");
  };

  return (
    <div className='flex flex-col items-center justify-center w-full px-4'>
      <div className="w-full max-w-md">
        <h1 className="md:text-5xl text-3xl font-bold text-blue-900 text-center">
          ¡Hola de nuevo!
        </h1>
        <p className="md:text-3xl text-xl mb-8 pt-8 pb-8 text-center">
          Ingresa el código de verificación que llegó a tu correo
        </p>

        <div className="w-full">
          <label
            htmlFor="verify-input"
            className="w-full text-center md:text-2xl text-xl font-bold text-black block mb-2"
          >
            Código de verificación:
          </label>
          <TextFieldWHolder
            id="verify-input"
            name="verify"
            placeholder="Ingrese su código de verificación"
            value={verify}
            onChange={(e) => setVerify(e.target.value)}
            hasError={!!error || !!apiError}
            width="100%"
          />
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          {apiError && <p className="text-red-500 text-sm mt-1">{apiError}</p>}
        </div>

        <div className="mt-6 w-full flex flex-col items-center">
          <BlueButton text="Continuar" width="300px" onClick={handleContinue} />
          <p className="mt-4 md:text-lg text-md md:p-2 p-4">¿No te llegó el código?</p>
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
