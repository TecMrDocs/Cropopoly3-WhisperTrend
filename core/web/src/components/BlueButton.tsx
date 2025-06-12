/**
 * Componente reutilizable: BlueButton
 *
 * Este componente representa un botón estilizado con un gradiente azul a verde esmeralda.
 * Es completamente configurable a través de props que permiten definir su texto, ancho,
 * función al hacer clic, tipo de botón (`button`, `submit`, `reset`) y estado de desactivado.
 *
 * Se utiliza principalmente para acciones destacadas dentro del sistema,
 * con un estilo visual llamativo que refuerza la interacción.
 *
 * Autor: Arturo Barrios Mendoza
 * Contribuyentes: Andrés Cabrera Alvarado (front design, documentación), Sebastián Antonio Almanza (front design)
 */

type BlueButtonProps = {
  text?: string;
  width?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
};

/**
 * Renderiza un botón con gradiente azul personalizable.
 * 
 * @param text - Texto que se mostrará dentro del botón
 * @param width - Ancho del botón (por defecto "400px")
 * @param onClick - Función que se ejecuta al hacer clic
 * @param type - Tipo de botón: "button", "submit", "reset"
 * @param disabled - Si se encuentra deshabilitado (evita clic y cambia estilo)
 * @return JSX que representa el botón estilizado con funcionalidad
 */
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
