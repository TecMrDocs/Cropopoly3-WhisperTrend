import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BlueButton from '../components/BlueButton';
import WhiteButton from '../components/WhiteButton';

export default function EmailConfirmation() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code.trim()) {
      setError('El código de verificación es requerido');
      return;
    }
    
    setError('');
    const jsonData = JSON.stringify({ verificationCode: code });
    console.log('JSON generado:', jsonData);
    navigate('/LaunchProcess');
  };

  const handleResendCode = () => {
    alert('Código nuevo enviado');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start pt-20 px-6 text-center">
      <h1 className="text-5xl font-bold text-blue-900 mb-8">Confirmación de correo</h1>
      <p className="text-3xl mb-8">Ingresa el código de verificación que llegó a tu correo</p>

      <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-6 items-center">
        <label className="w-full text-center text-2xl font-bold text-black">
          Código de verificación:
          <div className={`p-[2px] mt-2 rounded-full ${error ? 'bg-red-500' : 'bg-gradient-to-r from-blue-500 to-teal-400'} w-full`}>
            <input
              type="text"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                if (error) setError('');
              }}
              className="w-full rounded-full px-4 py-2 bg-white text-black focus:outline-none"
            />
          </div>
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </label>

        <BlueButton text="Continuar" width="200px" type="submit" />
        <br></br>
      </form>

      <div className="mt-8 text-lg text-black">
        <p>¿No te llegó el código?</p>
        <WhiteButton text="Enviar un código nuevo" width="250px" onClick={handleResendCode}/>
      </div>
    </div>
  );
}