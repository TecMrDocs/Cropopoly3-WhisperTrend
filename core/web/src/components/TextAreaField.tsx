/**
 * Campo de área de texto estilizado con borde degradado.
 *
 * Este componente permite capturar texto multilinea con una longitud máxima definida.
 * Acepta un valor externo controlado mediante `props.value` o usa un estado interno si no se proporciona.
 * Visualmente, presenta un borde degradado en azul y turquesa, y muestra los caracteres restantes.
 *
 * Autor: Arturo Barrios Mendoza  
 * Contribuyentes: —
 */

import React, { useState } from 'react';

/**
 * Propiedades aceptadas por el componente `TextAreaField`.
 *
 * @param {string} label - Etiqueta opcional que se muestra sobre el campo.
 * @param {string} width - Ancho del campo (por defecto '400px').
 * @param {number} maxLength - Longitud máxima permitida (por defecto 500 caracteres).
 * @param {string} placeholder - Texto de ayuda dentro del campo (por defecto 'Escribe tu mensaje...').
 * @param {string} value - Valor del campo (si se controla desde fuera).
 * @param {(e: React.ChangeEvent<HTMLTextAreaElement>) => void} onChange - Función que se ejecuta al modificar el texto.
 * @param {string} id - Identificador único para el campo de texto.
 */
type TextAreaFieldProps = {
  label?: string;
  width?: string;
  maxLength?: number;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  id?: string;
};

/**
 * Componente funcional `TextAreaField`.
 *
 * Renderiza un campo de texto multilinea estilizado, que puede ser controlado internamente
 * o externamente mediante props. Muestra cuántos caracteres quedan antes de alcanzar el límite.
 *
 * @param {TextAreaFieldProps} props - Propiedades del componente
 * @return {JSX.Element}
 */
export default function TextAreaField({
  label,
  width = '400px',
  maxLength = 500,
  placeholder = 'Escribe tu mensaje...',
  value,
  onChange,
  id,
}: TextAreaFieldProps) {
  /**
   * Estado interno para manejar el texto ingresado si no se proporciona un valor externo.
   */
  const [internalValue, setInternalValue] = useState('');

  /**
   * Determina el valor actual a mostrar: externo si se proporciona, interno si no.
   */
  const currentValue = value ?? internalValue;

  /**
   * Maneja los cambios en el campo de texto.
   * Si el texto no excede el `maxLength`, se actualiza el valor actual o se llama al `onChange`.
   *
   * @param {React.ChangeEvent<HTMLTextAreaElement>} e - Evento del textarea
   */
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length <= maxLength) {
      if (onChange) {
        onChange(e);
      } else {
        setInternalValue(e.target.value);
      }
    }
  };

  /**
   * Renderiza el campo de área de texto, junto con su etiqueta (si se proporciona)
   * y un contador de caracteres restantes.
   *
   * @return {JSX.Element}
   */
  return (
    <div className="flex flex-col gap-1" style={{ width }}>
      {label && (
        <label 
          htmlFor={id}
          className="text-md font-semibold"
        >
          {label}
        </label>
      )}
      <div className="p-[3px] rounded-[10px] bg-gradient-to-r from-[#00BFB3] to-[#0091D5] inline-block">
        <textarea
          id={id}
          placeholder={placeholder}
          value={currentValue}
          onChange={handleChange}
          rows={4}
          className="w-full border-none outline-none p-3 rounded-[6px] bg-white text-base text-black resize-none"
        />
      </div>
      <div className="text-sm text-gray-500 text-right">
        {maxLength - currentValue.length} caracteres restantes
      </div>
    </div>
  );
}
