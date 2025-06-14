/**
 * Campo de texto estilizado con borde de gradiente.
 *
 * Este componente representa un campo de entrada de texto personalizado.
 * Puede recibir una etiqueta opcional (`label`) y un ancho configurable.
 * Se utiliza para entradas básicas en formularios con estilo visual atractivo.
 *
 * Autor: Sebastian Antonio Almanza
 */

/**
 * Componente `TextField`
 *
 * Renderiza un campo de texto con un borde degradado entre tonos azul y turquesa.
 * Si se proporciona una etiqueta (`label`), esta se muestra encima del input.
 *
 * @param {string} label - Etiqueta opcional que se muestra arriba del campo de texto
 * @param {string} width - Ancho del componente, por defecto es "300px"
 * @return {JSX.Element}
 */
export default function TextField({
  label,
  width = "300px"
}: {
  label?: string;
  width?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm text-gray-700">{label}</label>}
      <div
        className="p-[3px] rounded-3xl bg-gradient-to-r from-[#00BFB3] to-[#0091D5] inline-block"
        style={{ width }}
      >
        <input className="border-none outline-none p-2 px-3 rounded-3xl bg-white w-full text-base block text-black" />
      </div>
    </div>
  );
}
