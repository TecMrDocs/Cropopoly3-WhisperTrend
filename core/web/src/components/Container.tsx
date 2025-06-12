/**
 * Componente reutilizable: Container
 *
 * Este componente actúa como un contenedor visual con bordes redondeados,
 * sombra, relleno responsivo y un fondo con gradiente azul-verde.
 * Está diseñado para encapsular contenido en secciones destacadas del sistema,
 * como tarjetas o paneles de información.
 *
 * Autor: Mariana Balderrabano Aguilar
 * Contribuyentes: Andres Cabrera Alvarado (documentación), Sebastián Antonio Almanza (front design)
 */

export default function Container(props: any) {
  /**
   * Renderiza un contenedor con estilos personalizados y contenido interno dinámico
   * proporcionado mediante la propiedad `children`.
   * 
   * @param props - Objeto que contiene los elementos hijos a renderizar dentro del contenedor
   * @return JSX que representa el contenedor estilizado con contenido inyectado
   */
  return (
    <div className="bg-gradient-to-r from-[#2d86d1] to-[#34d399] md:p-8 p-6 rounded-3xl w-full max-w-md shadow-xl">
      {props.children}
    </div>
  );
}
