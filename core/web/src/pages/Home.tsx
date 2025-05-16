import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col justify-start items-center">
      <img src="/src/assets/Wtw2.png" alt="WhisperTrend Logo" className="w-100 mb-8" />

      <Link
        to="/login"
        className="bg-white text-black font-medium px-6 py-3 rounded-full flex items-center gap-2 hover:scale-105 transition-transform"
      > 
        Ingresar
        <span className="text-xl">→</span>
      </Link>

      <div className="bg-white text-black text-center p-8 mt-11 max-w-4xl rounded shadow-md">
        <p>
          Whispertrend es tu plataforma de inteligencia de mercado. Nosotros sabemos que las tendencias y
          noticias en redes sociales pueden impulsar o afectar tu negocio en minutos. WhisperTrend te
          permite monitorearlas, medir su impacto, y detectar oportunidades o amenazas antes que nadie.
          WhisperTrend te ayuda a tomar decisiones estratégicas con información precisa y a mantenerte
          siempre un paso adelante.
        </p>
      </div>
    </div>
  );
}
