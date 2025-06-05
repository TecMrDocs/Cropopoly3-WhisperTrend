/**
 * Componente: WhiteButton
 * Authors: Arturo Barrios Mendoza
 * Descripción: Botón de color blanco.
 */

type WhiteButtonProps = {
  text?: string; // Texto del botón
  width?: string; // Ancho del botón, por defecto es '400px'
  onClick?: () => void; // Función a ejecutar al hacer clic
  type?: 'button' | 'submit' | 'reset'; // Tipo de botón, por defecto es 'button'
};

export default function WhiteButton({text = '', width = '400px', onClick, type='button'} : WhiteButtonProps) {
  return(
    <button type={type} onClick={onClick} style={{ width }} className="back-button text-[#276de1] !bg-white rounded-3xl w-[8%] border-4 border-[#276de1] text-[17px] font-semibold cursor-pointer py-2 px-2.5">
      {text}
    </button>    
  );
}
