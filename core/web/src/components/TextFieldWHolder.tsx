/**
 * Componente: TextFieldWHolder
 * Authors: Arturo Barrios Mendoza
 * Descripción: Componente de campo de texto con un fondo degradado y placeholder.
 */

type TextFieldWHolderProps = {
  placeholder?: string; // Texto del placeholder, por defecto es ''
  width?: string; // Ancho del campo de texto, por defecto es '200px'
  value?: string; // Valor del campo de texto, si no se proporciona se usa el estado interno
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void; // Función a ejecutar al cambiar el valor del campo de texto
  label?: string; // Etiqueta del campo de texto
  name?: string; // Nombre del campo de texto, usado en formularios
  id?: string; // ID del campo de texto, usado para accesibilidad y referencia
  hasError?: boolean; // Indica si el campo tiene un error, por defecto es false
  type?: string; // Tipo del campo de texto, por defecto es 'text'
};

export default function TextFieldWHolder({ 
  placeholder = '', 
  width = '200px',
  value,
  onChange,
  label,
  name,
  id,
  hasError = false,
  type = 'text',
}: TextFieldWHolderProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-md text-gray-700 font-bold ">{label}</label>}
      {/* <div className="p-[3px] rounded-3xl bg-gradient-to-r from-[#00BFB3] to-[#0091D5] inline-block"> */}
      <div 
        className={`p-[3px] rounded-3xl inline-block ${
          hasError 
            ? "bg-gradient-to-r from-red-500 to-red-400" // Gradiente rojo en error
            : "bg-gradient-to-r from-[#00BFB3] to-[#0091D5]" // Gradiente normal
        }`}
      >
        <input
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          style={{ width }}
          className="border-none outline-none p-2 px-3 rounded-3xl bg-white text-base block text-black"
          name={name}
          id={id}
          autoComplete="off"
          type={type}
        />
      </div>
    </div>
  );
}
