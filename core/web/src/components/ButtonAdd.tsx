/**
 * Componente reutilizable: ButtonAdd
 *
 * Este componente representa un botón redondo con un signo "+" en su interior,
 * diseñado para ejecutar acciones de tipo "añadir" o "crear".
 * Su tamaño es configurable mediante props, y su estilo incluye un gradiente azul-verde.
 *
 * Ideal para formularios, secciones de etiquetas o listas dinámicas.
 *
 * Autor: Arturo Barrios Mendoza  
 * Contribuyentes: Andres Cabrera Alvarado (front design, documentación)
 */

type ButtonAddProps = {
  width?: string;
  onClick?: () => void;
};

/**
 * Renderiza un botón circular con signo "+".
 * Permite definir su tamaño y una acción personalizada al hacer clic.
 * 
 * @param width - Ancho y alto del botón (por defecto '40px')
 * @param onClick - Función que se ejecuta al hacer clic en el botón
 * @return JSX que representa un botón de añadir con estilo llamativo
 */
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
