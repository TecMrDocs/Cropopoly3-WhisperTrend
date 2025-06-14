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