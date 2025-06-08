/**
 * Componente: WhiteButton
 * Authors: Arturo Barrios Mendoza
 * Descripción: Botón de color blanco.
 */

type WhiteButtonProps = {
  text?: string;                         
  width?: string;                       
  onClick?: () => void;                  
  type?: 'button' | 'submit' | 'reset';  // Tipo de botón
  disabled?: boolean;                   
};

export default function WhiteButton({
  text = '',
  width = '400px',
  onClick,
  type = 'button',
  disabled = false,
}: WhiteButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{ width }}
      className={`
        back-button
        text-[#276de1]
        !bg-white
        rounded-3xl
        w-[8%]
        border-4 border-[#276de1]
        text-[17px] font-semibold
        cursor-pointer py-2 px-2.5
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      {text}
    </button>
  );
}