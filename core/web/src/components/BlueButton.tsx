/**
 * Componente: BlueButton
 * Authors: Arturo Barrios Mendoza
 * Descripción: Botón de color azul.
 */


type BlueButtonProps = {
  text?: string; // Texto del botón
  width?: string; // Ancho del botón
  onClick?: () => void; // Función a ejecutar al hacer clic
  type?: "button" | "submit" | "reset"; // Tipo de botón, por defecto es "button"
  disabled?: boolean; // Permite desactivar el botón
};

export default function BlueButton({
  text = '',
  width = '400px',
  onClick,
  type = "button",
  disabled = false
}: BlueButtonProps) {
  return (
    <div>
      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        style={{ width }}
        className={`
          text-white
          bg-gradient-to-r from-blue-600 to-emerald-400
          rounded-3xl border-transparent
          py-2 px-2.5 text-[17px] font-semibold
          cursor-pointer w-[8%] h-[48px]
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:from-blue-600 hover:to-emerald-400'}
        `}
      >
        {text}
      </button>
    </div>
  );
}
