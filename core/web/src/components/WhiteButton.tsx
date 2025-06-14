/**
 * Componente de Botón Blanco Reutilizable
 * 
 * Este componente implementa un botón estilizado con fondo blanco y borde azul,
 * diseñado para ser usado como botón secundario o de acción alternativa en la interfaz.
 * Incluye soporte para diferentes tipos de botón, estados deshabilitados y personalización de ancho.
 * 
 * @author Arturo Barrios Mendoza
 * @contributors Sebastián Antonio Almanza  
 */

/**
 * Interfaz de propiedades para el componente WhiteButton
 * Define todos los parámetros configurables del botón incluyendo
 * contenido, dimensiones, interactividad y comportamiento
 */
type WhiteButtonProps = {
  text?: string;                         
  width?: string;                       
  onClick?: () => void;                  
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;                   
};

/**
 * Componente de botón blanco con estilos personalizados y funcionalidad completa
 * Renderiza un botón con diseño consistente que puede ser usado en diferentes
 * contextos de la aplicación manteniendo la coherencia visual del sistema
 * 
 * @param text Texto que se mostrará dentro del botón
 * @param width Ancho personalizado del botón en unidades CSS válidas
 * @param onClick Función callback que se ejecuta al hacer clic en el botón
 * @param type Tipo HTML del botón que determina su comportamiento en formularios
 * @param disabled Estado que indica si el botón debe estar deshabilitado
 * @return JSX.Element con el botón renderizado y estilos aplicados
 */
export default function WhiteButton({
  text = '',
  width = '400px',
  onClick,
  type = 'button',
  disabled = false,
}: WhiteButtonProps) {
  /**
   * Renderizado del elemento botón con estilos condicionales
   * Aplica clases CSS dinámicas basadas en el estado disabled
   * y combina estilos fijos con propiedades personalizables
   */
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