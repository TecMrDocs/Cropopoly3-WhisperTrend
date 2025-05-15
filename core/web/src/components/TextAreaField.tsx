import React, { useState } from 'react';

type TextAreaFieldProps = {
  width?: string;
  maxLength?: number;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
};

export default function TextAreaField({
  width = '400px',
  maxLength = 500,
  placeholder = 'Escribe tu mensaje...',
  value,
  onChange,
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
    <div className="flex flex-col gap-2" style={{ width }}>
      <div className="p-[3px] rounded-[10px] bg-gradient-to-r from-[#00BFB3] to-[#0091D5] inline-block">
        <textarea
          placeholder={placeholder}
          value={currentValue}
          onChange={handleChange}
          rows={4}
          className="w-full border-none outline-none p-3 rounded-[6px] bg-white text-base text-black resize-none"
        />
      </div>

      {/* contador de caracteres */}
      <div className="text-sm text-gray-500 text-right">
        {maxLength - currentValue.length} caracteres restantes
      </div>
    </div>
  );
}
