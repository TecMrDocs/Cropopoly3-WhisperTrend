/**
 * Campo de selección estilizado con borde degradado.
 *
 * Este componente permite al usuario seleccionar una opción de una lista desplegable.
 * Visualmente presenta un borde con gradiente y un diseño limpio.
 * Soporta etiquetas, valor controlado, placeholder y ancho personalizado.
 *
 * Autor: Arturo Barrios Mendoza  
 * Contribuyentes: —
 */

/**
 * Propiedades aceptadas por el componente `SelectField`.
 *
 * @param {string} label - Etiqueta opcional que se muestra sobre el campo.
 * @param {string[]} options - Arreglo de opciones que se mostrarán en el menú desplegable.
 * @param {string} width - Ancho del componente (por defecto `'200px'`).
 * @param {string} placeholder - Texto visible cuando no se ha seleccionado ninguna opción (por defecto `'Selecciona una opción'`).
 * @param {string} value - Valor seleccionado actualmente.
 * @param {(e: React.ChangeEvent<HTMLSelectElement>) => void} onChange - Función que se ejecuta al cambiar el valor seleccionado.
 */
type SelectFieldProps = {
  label?: string;
  options: string[];
  width?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
};

/**
 * Componente funcional `SelectField`.
 *
 * Renderiza un menú desplegable con un conjunto de opciones. Si se proporciona un `value`,
 * se usa como valor controlado. Se aplica un estilo degradado en el contenedor y se incluye un
 * `placeholder` cuando no hay una opción seleccionada.
 *
 * @param {SelectFieldProps} props - Propiedades del componente
 * @return {JSX.Element}
 */
export default function SelectField({
  label,
  options,
  width = '200px',
  placeholder = 'Selecciona una opción',
  value,
  onChange,
}: SelectFieldProps) {
  return (
    <div className="flex flex-col gap-1" style={{ width }}>
      {label && <label className="text-md font-semibold">{label}</label>}
      <div className="p-[3px] rounded-[10px] bg-gradient-to-r from-[#00BFB3] to-[#0091D5] inline-block">
        <select
          value={value !== undefined ? value : undefined}
          onChange={onChange}
          className="border-none outline-none p-2 px-3 rounded-[6px] bg-white text-base block text-black w-full"
        >
          <option value="" disabled hidden>
            {placeholder}
          </option>
          {options.map((opt, idx) => (
            <option key={idx} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
