/**
 * Componente reutilizable: EnclosedWord
 *
 * Este componente visualiza una palabra encerrada dentro de un contenedor estilizado,
 * con un borde exterior con fondo degradado y un fondo blanco interior que destaca el texto.
 * Es ideal para mostrar etiquetas, términos clave o categorías con estilo llamativo.
 *
 * Autor: Arturo Barrios Mendoza  
 * Contribuyentes: Andres Cabrera Alvarado (documentación)
 */

/**
 * Renderiza una palabra dentro de un cuadro con fondo degradado azul-verde
 * y un interior blanco con bordes redondeados.
 * 
 * @param word - Palabra o texto que se mostrará dentro del recuadro
 * @return JSX que representa una palabra encerrada en un contenedor decorativo
 */
export default function EnclosedWord({ word }: { word: string }) {
  return (
    <div className="flex items-center justify-center">
      <div className="p-[3px] rounded-[10px] bg-gradient-to-r from-[#00BFB3] to-[#0091D5] inline-block">
        <p className="border-none outline-none p-2 px-3 rounded-[6px] bg-white text-base block text-black">
          {word}
        </p>
      </div>
    </div>
  );
}