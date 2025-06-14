/**
 * LoadingSpinner Component - Componente de Estado de Carga
 * 
 * Este componente proporciona una interfaz de carga elegante y informativa
 * que se muestra durante procesos asincrónicos como carga de datos de API,
 * cálculos de backend o cualquier operación que requiera tiempo de espera.
 * Utiliza un diseño centrado con iconografía clara y mensajes personalizables
 * para mantener al usuario informado sobre el progreso del sistema.
 * 
 * Autor: Lucio Arturo Reyes Castillo
 */

interface LoadingSpinnerProps {
  titulo?: string;
  descripcion?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  titulo = "Cargando análisis...", 
  descripcion = "Procesando datos de la API" 
}) => {
  return (
    <div className="p-6 flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">⏳</div>
        <h2 className="text-2xl font-bold text-blue-900 mb-2">{titulo}</h2>
        <p className="text-gray-600">{descripcion}</p>
      </div>
    </div>
  );
};