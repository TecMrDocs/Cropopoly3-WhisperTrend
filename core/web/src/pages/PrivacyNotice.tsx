import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function PrivacyNotice() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-start text-center pt-20">
      <h1 className="text-5xl font-bold text-blue-900 mb-30">Aviso de privacidad</h1>

      <div className="max-w-3xl text-lg text-black space-y-4 mb-8">
        <p>
          WhisperTrend recopila datos personales como nombre y contacto para brindar servicios y mejorar su experiencia.
          Sus datos están protegidos mediante medidas de seguridad adecuadas.
        </p>
        <p>
          Utilizamos cookies para analizar el uso del sitio. La información puede compartirse con proveedores de servicios
          o cuando sea legalmente requerido.
          Usted tiene derecho a acceder, rectificar y eliminar sus datos personales.
          Para más información contacte a: <span className="font-bold">[contacto@empresa.com]</span>
        </p>
        <p>
          Última actualización: <span className="font-bold">16/05/2025</span>
        </p>
      </div>

      <button
        onClick={() => navigate("/login")}
        className="bg-gradient-to-r from-blue-500 to-teal-400 text-white font-semibold py-2 px-6 rounded-full hover:scale-105 transition-transform"
      >
        Regresar
      </button>
    </div>
  );
}
