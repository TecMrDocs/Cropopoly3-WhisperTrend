/**
 * Componente: TextFieldWHolder
 * Autor: Arturo Barrios Mendoza
 * Contribuyentes: —
 *
 * Descripción:
 * Componente reutilizable de campo de texto con un estilo visual atractivo.
 * Incluye un fondo degradado que cambia de color si hay error, soporte para etiqueta, placeholder,
 * nombre de campo, control de valor externo e interno, y personalización de ancho.
 */

import React from "react";

/**
 *
 * Props que recibe el componente TextFieldWHolder.
 * Define las propiedades necesarias para configurar el campo de texto.
 *
 * - `placeholder`: Texto que aparece dentro del input cuando está vacío. Por defecto es `''`.
 * - `width`: Ancho del campo de texto, como `'100%'` o `'200px'`. Por defecto es `'100%'`.
 * - `value`: Valor actual del campo de texto. Permite control externo.
 * - `onChange`: Función que se ejecuta al cambiar el valor del campo.
 * - `label`: Texto de la etiqueta que aparece arriba del campo.
 * - `name`: Nombre del campo de texto, usado en formularios.
 * - `id`: Identificador único del campo, usado para accesibilidad y referencias.
 * - `hasError`: Indica si el campo está en estado de error. Cambia el borde a rojo. Por defecto es `false`.
 * - `type`: Tipo de dato del input, como `'text'`, `'email'`, `'password'`, etc. Por defecto es `'text'`.
 *
 */
type TextFieldWHolderProps = {
  placeholder?: string;
  width?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  name?: string;
  id?: string;
  hasError?: boolean;
  type?: string;
};

/**
 *
 * Componente funcional que renderiza un input estilizado con un fondo degradado.
 * Permite configurar múltiples propiedades visuales y de formulario.
 *
 * @param placeholder Texto sugerido dentro del input
 * @param width Ancho del campo de entrada
 * @param value Valor actual del input (controlado externamente)
 * @param onChange Función para manejar el cambio de texto
 * @param label Etiqueta textual opcional
 * @param name Nombre del input en formularios
 * @param id ID único para accesibilidad
 * @param hasError Indica si el input está en estado de error
 * @param type Tipo de dato del input
 *
 * @return JSX.Element que representa un campo de texto estilizado
 *
 */
export default function TextFieldWHolder({ 
  placeholder = '', 
  width = '100%',
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
      
      {label && (
        <label 
          htmlFor={id}
          className="text-sm sm:text-md text-gray-700 font-bold"
        >
          {label}
        </label>
      )}
     
      <div 
        className={`p-[3px] rounded-3xl inline-block ${
          hasError 
            ? "bg-gradient-to-r from-red-500 to-red-400"
            : "bg-gradient-to-r from-[#00BFB3] to-[#0091D5]"
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
