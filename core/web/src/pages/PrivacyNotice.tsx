import { useNavigate } from 'react-router-dom';

export default function PrivacyNotice() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden flex flex-col items-center justify-start text-center md:p-10 p-4 box-border">
      <h1 className="md:text-5xl text-3xl font-bold text-blue-900 md:p-8 p-4 w-full max-w-4xl break-words">Aviso de privacidad</h1>

      <div className="w-full max-w-2xl md:text-xl text-base md:p-8 p-4 text-black space-y-4 px-2 break-words">
        <p className="break-words">
          WhisperTrend recopila datos personales como nombre y contacto para brindar servicios y mejorar su experiencia.
          Sus datos están protegidos mediante medidas de seguridad adecuadas.
        </p>
        <p className="break-words">
          Utilizamos cookies para analizar el uso del sitio. La información puede compartirse con proveedores de servicios
          o cuando sea legalmente requerido.
          Usted tiene derecho a acceder, rectificar y eliminar sus datos personales.
          Para más información contacte a: <span className="font-bold break-words">[contacto@empresa.com]</span>
        </p>
        <p className="break-words">
          Última actualización: <span className="font-bold">16/05/2025</span>
        </p>
      </div>

      <button
        onClick={() => navigate("/login")}
        className="bg-gradient-to-r from-blue-500 to-teal-400 text-white font-semibold py-2 px-6 rounded-full hover:scale-105 transition-transform mt-4 max-w-full"
      >
        Regresar
      </button>
    </div>
  );
}
