import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function EmailConfirmation() {
  const [code, setCode] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Código ingresado:', code);
    navigate('/changePassword');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start pt-20 px-6 text-center">
      <h1 className="text-5xl font-bold text-blue-900 mb-8">Confirmación de correo</h1>
      <p className="text-3xl mb-8">Ingresa el código de verificación que llegó a tu correo</p>

      <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-6 items-center">
        <label className="w-full text-left text-2xl font-bold text-black">
          Código de verificación:
          <div className="p-[2px] mt-2 rounded-full bg-gradient-to-r from-blue-500 to-teal-400 w-full">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full rounded-full px-4 py-2 bg-white text-black focus:outline-none"
            />
          </div>
        </label>

        <button
          type="submit"
          className="bg-gradient-to-r from-blue-500 to-teal-400 text-white font-semibold py-2 px-6 rounded-full hover:scale-105 transition-transform"
        >
          Continuar
        </button>
      </form>

      <div className="mt-8 text-lg text-black">
        <p>¿No te llegó el código?</p>
        <button
          className="mt-2 border-2 border-blue-500 text-blue-600 font-semibold px-6 py-2 rounded-full hover:bg-blue-50 transition"
          onClick={() => alert('Código nuevo enviado')}
        >
          Enviar un código nuevo
        </button>
      </div>
    </div>
  );
}
