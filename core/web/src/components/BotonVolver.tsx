// components/dashboard/BotonVolver.tsx
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