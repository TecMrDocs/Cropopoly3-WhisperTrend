/**
 * BotonVolver Component - Componente de Navegación de Retorno
 * 
 * Este componente proporciona un botón de navegación reutilizable que permite
 * a los usuarios regresar a vistas anteriores o resetear el estado de visualización
 * en el dashboard. Implementa un diseño consistente con transiciones suaves y
 * texto configurable para adaptarse a diferentes contextos de uso.
 * 
 * Autor: Lucio Arturo Reyes Castillo
 */


interface BotonVolverProps {
  onClick: () => void;
  texto?: string;
}

export const BotonVolver: React.FC<BotonVolverProps> = ({ 
  onClick, 
  texto = "Volver a Gráfica de Líneas" 
}) => {
  return (
    <button 
      onClick={onClick} 
      className="mb-4 px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition"
    >
      {texto}
    </button>
  );
};