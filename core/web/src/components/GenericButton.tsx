/**
 * Componente reutilizable: GenericButton
 *
 * Botón genérico con fondo degradado azul-verde, bordes redondeados y sombra.
 * Su propósito es ofrecer un botón visualmente atractivo y flexible
 * para ser usado en diversas partes de la interfaz.
 *
 * Autor: Mariana Balderrabano Aguilar
 * Contribuyentes: Sebastián Antonio Almanza (front design), Andrés Cabrera Alvarado (documentación)
 */


/**
 * Renderiza un botón estilizado con texto dinámico y comportamiento configurable.
 * 
 * @param text - Texto que se mostrará dentro del botón
 * @param type - Tipo de botón: "button", "submit" o "reset" (por defecto: "button")
 * @param onClick - Función que se ejecuta al hacer clic
 * @return JSX que representa el botón genérico con estilo personalizado
 */
export default function GenericButton(props: any) {
  return (
    <button 
      type={props.type || "button"}
      onClick={props.onClick}
      className="w-full bg-gradient-to-r from-[#2d86d1] to-[#34d399] py-3 my-4 text-white border-none rounded-full cursor-pointer shadow-xl">
      {props.text}
    </button>
  );
}