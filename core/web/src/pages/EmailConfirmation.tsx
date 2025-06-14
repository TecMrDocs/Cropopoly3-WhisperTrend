/**
 * Componente: EmailConfirmation
 * Descripción: Vista que guía al usuario para verificar su correo electrónico.
 * Muestra un mensaje explicativo, un botón para iniciar sesión y (opcionalmente)
 * un botón para reenviar el código de verificación.
 *
 * Autor: Andrés Cabrera Alvarado
 * Contribuyentes: 
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BlueButton from '../components/BlueButton';
import WhiteButton from '../components/WhiteButton';

/**
 * Renderiza la vista de confirmación de correo electrónico.
 *
 * @return Vista con instrucciones para verificar el correo electrónico y redirección a login.
 */
export default function EmailConfirmation() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const handleLoginClick = () => {
    navigate('/Login');
  };

  /**
   * Maneja el envío del formulario.
   * Verifica que el código no esté vacío y lo transforma en JSON
   *
   * @param e Evento del formulario
   */
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-start pt-20 px-6 text-center">
      <h1 className="text-5xl font-bold text-blue-900 mb-8">Confirmación de correo</h1>
      
      <p className="text-3xl mb-8">
        Verifica tu correo electrónico e ingresa al link que te hemos <br/> 
        enviado para verificar tu cuenta, posteriormente inicia sesión
      </p>

      <WhiteButton
        text="Login"
        width="200px"
        type="button"
        onClick={handleLoginClick}
      />
    </div>
  );
}
