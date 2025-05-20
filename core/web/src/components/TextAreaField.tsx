import React, { useState } from 'react';

type TextAreaFieldProps = {
  label?: string;
  width?: string;
  maxLength?: number;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  label?: React.ReactNode; // ← loables también
};

export default function TextAreaField({
  label,
  width = '400px',
  maxLength = 500,
  placeholder = 'Escribe tu mensaje...',
  value,
  onChange,
  label,
}: TextAreaFieldProps) {
  const [internalValue, setInternalValue] = useState('');

  const currentValue = value ?? internalValue;

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
<<<<<<< HEAD
    <div className="flex flex-col gap-2" style={{ width }}>
      {label && <label className="text-base font-medium">{label}</label>}
=======
    <div className="flex flex-col gap-1" style={{ width }}>
      {label && <label className="text-md font-semibold">{label}</label>}
>>>>>>> 379a7e0 (Actualizo Pantalla de Editar Producto, ya que estaba sin terminar. Solo decia en texto editar producto.)
      <div className="p-[3px] rounded-[10px] bg-gradient-to-r from-[#00BFB3] to-[#0091D5] inline-block">
        <textarea
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

