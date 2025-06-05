/**
 * Componente: ButtonAdd
 * Authors: Arturo Barrios Mendoza
 * Descripción: Botón para añadir palabras.
 */

type ButtonAddProps = {
  width?: string; // Ancho del botón, por defecto es '40px'
  onClick?: () => void; // Función a ejecutar al hacer clic
};

export default function ButtonAdd({ width = '40px', onClick }: ButtonAddProps) {
  return (
    <button
      onClick={onClick}
      style={{ width, height: width }}
      className="flex items-center justify-center text-white bg-gradient-to-r from-blue-600 to-emerald-400 rounded-full border-transparent text-xl font-bold leading-none cursor-pointer hover:from-blue-600 hover:to-emerald-400"
    >
      <p className="mb-1">+</p>
    </button>
  );
}
