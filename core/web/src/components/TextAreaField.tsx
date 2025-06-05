/**
 * Componente: TextAreaField
 * Authors: Arturo Barrios Mendoza
 * Descripción: Componente de campo de texto personalizado con soporte para longitud máxima y placeholder.
 */

import React, { useState } from 'react';

type TextAreaFieldProps = {
  label?: string; // Etiqueta del campo de texto
  width?: string; // Ancho del campo de texto, por defecto es '400px'
  maxLength?: number; // Longitud máxima del campo de texto, por defecto es 500
  placeholder?: string; // Texto del placeholder, por defecto es 'Escribe tu mensaje...'
  value?: string; // Valor del campo de texto, si no se proporciona se usa el estado interno
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; // Función a ejecutar al cambiar el valor del campo de texto
  id?: string; // Id del campo de texto
};

export default function TextAreaField({
  label,
  width = '400px',
  maxLength = 500,
  placeholder = 'Escribe tu mensaje...',
  value,
  onChange,
  id,
}: TextAreaFieldProps) {
  // Estado interno para manejar el valor del campo de texto si no se proporciona un valor externo
  const [internalValue, setInternalValue] = useState('');

  // Si se proporciona un valor, se usa ese; de lo contrario, se usa el estado interno
  const currentValue = value ?? internalValue;

  // Maneja el cambio en el campo de texto, asegurándose de no exceder la longitud máxima
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length <= maxLength) {
      if (onChange) {
        onChange(e);
      } else {
        setInternalValue(e.target.value);
      }
    }
  };

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

