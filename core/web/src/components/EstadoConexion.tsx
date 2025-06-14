/**
 * EstadoConexion Component - Indicador Visual de Estado del Sistema
 * 
 * Este componente proporciona un indicador visual intuitivo que muestra el estado
 * actual del sistema de datos, diferenciando entre datos reales calculados en
 * el backend y datos de demostración. Utiliza señales visuales como colores
 * y animaciones para comunicar de manera efectiva la naturaleza de los datos
 * mostrados al usuario, mejorando la transparencia y confiabilidad de la interfaz.
 * 
 * Autor: Lucio Arturo Reyes Castillo
 */



interface EstadoConexionProps {
  tieneCalculosBackend: boolean;
  descripcionActivo?: string;
  descripcionDemo?: string;
}

export const EstadoConexion: React.FC<EstadoConexionProps> = ({ 
  tieneCalculosBackend,
  descripcionActivo = "Datos calculados en tiempo real",
  descripcionDemo = "Datos de demostración"
}) => {
  return (
    <div className="flex items-center mt-1">
      <div className={`w-2 h-2 ${tieneCalculosBackend ? 'bg-blue-400' : 'bg-orange-400'} rounded-full mr-2 animate-pulse`}></div>
      <p className="text-gray-600 text-sm font-medium">
        {tieneCalculosBackend ? descripcionActivo : descripcionDemo}
      </p>
    </div>
  );
};