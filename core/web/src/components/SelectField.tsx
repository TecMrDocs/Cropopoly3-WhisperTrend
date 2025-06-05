/**
 * Componente: SelectField
 * Authors: Arturo Barrios Mendoza
 * Descripción: Componente de campo de selección personalizado.
 */

type SelectFieldProps = {
  label?: string; // Etiqueta del campo de selección
  options: string[]; // Opciones del campo de selección
  width?: string; // Ancho del campo de selección, por defecto es '200px'
  placeholder?: string; // Texto del placeholder, por defecto es 'Selecciona una opción'
  value?: string; // Valor seleccionado del campo de selección
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void; // Función a ejecutar al cambiar el valor del campo de selección
};

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
