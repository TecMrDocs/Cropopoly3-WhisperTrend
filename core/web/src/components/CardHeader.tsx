
/**
 * CardHeader Component - Componente de Encabezado para Tarjetas del Dashboard
 * 
 * Este componente proporciona un encabezado estandarizado y visualmente atractivo
 * para las diferentes secciones del dashboard. Incluye iconografía personalizable,
 * títulos con gradientes, indicadores de estado de conexión y efectos visuales
 * avanzados como blur y sombras. Diseñado para mantener consistencia visual
 * en toda la aplicación mientras permite personalización específica por sección.
 * 
 * Autor: Lucio Arturo Reyes Castillo
 */
import { EstadoConexion } from './EstadoConexion';

interface CardHeaderProps {
  icono: React.ReactNode;
  titulo: string;
  tieneCalculosBackend?: boolean;
  gradientFrom?: string;
  gradientTo?: string;
  descripcionActivo?: string;
  descripcionDemo?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ 
  icono, 
  titulo, 
  tieneCalculosBackend = false,
  gradientFrom = "from-gray-600",
  gradientTo = "to-blue-700",
  descripcionActivo,
  descripcionDemo
}) => {
  return (
    <div className="flex items-center mb-3">
      <div className="relative">
        <div className={`absolute inset-0 bg-gradient-to-br ${gradientFrom} ${gradientTo} rounded-2xl blur-md opacity-75`}></div>
        <div className={`relative bg-gradient-to-br ${gradientFrom} ${gradientTo} rounded-2xl p-3 shadow-lg`}>
          {icono}
        </div>
      </div>
      <div className="ml-4">
        <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-700 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
          {titulo}
        </h3>
        <EstadoConexion 
          tieneCalculosBackend={tieneCalculosBackend}
          descripcionActivo={descripcionActivo}
          descripcionDemo={descripcionDemo}
        />
      </div>
    </div>
  );
};

// Iconos comunes reutilizables
export const IconoGraficas = () => (
  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

export const IconoPanel = () => (
  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

export const IconoInterpretacion = () => (
  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
);