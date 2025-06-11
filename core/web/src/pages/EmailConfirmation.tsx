import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BlueButton from '../components/BlueButton';
import WhiteButton from '../components/WhiteButton';


export default function EmailConfirmation() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const handleLoginClick = () => {
    navigate('/Login');
  };

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
      
      <p className="text-3xl mb-8">Verifica tu correo electrónico e ingresa al link que te hemos <br/> enviado para verificar tu cuenta, posteriormente inicia sesión </p>

      <WhiteButton
                  text="Login"
                  width="200px"
                  type="button"
                  onClick={handleLoginClick}
      
                />
      {/* <div className="mt-8 text-lg text-black">
        <p>¿No te llegó el código?</p>
        <WhiteButton text="Enviar un código nuevo" width="250px" onClick={handleResendCode}/>
      </div> */}
    </div>
  );
}