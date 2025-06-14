/**
 * Campo de entrada para etiquetas dinámicas (tags).
 *
 * Este componente permite al usuario escribir texto y presionar Enter o el botón "+" para agregarlo como una etiqueta.
 * Las etiquetas se pueden eliminar individualmente mediante un botón con ícono de basura.
 * Es ideal para recolectar listas abiertas como palabras clave, tecnologías, intereses, etc.
 *
 * Autor: Iván Alexander Ramos Ramírez  
 * Contribuyentes: —
 */

import React, { FC, useState, KeyboardEvent } from 'react'
import { TrashIcon } from '@heroicons/react/24/outline'

/**
 * Propiedades aceptadas por el componente `TagInput`.
 *
 * @param {string} label - Etiqueta visible que describe el propósito del input.
 * @param {string[]} tags - Lista de etiquetas actuales.
 * @param {React.Dispatch<React.SetStateAction<string[]>>} setTags - Función para actualizar la lista de etiquetas.
 * @param {string} placeholder - Texto opcional que aparece dentro del input cuando está vacío.
 * @param {string} width - Ancho máximo del componente (por defecto "100%").
 */
interface TagInputProps {
  label: string;
  tags: string[];
  setTags: React.Dispatch<React.SetStateAction<string[]>>;
  placeholder?: string;
  width?: string;
}

/**
 * Componente funcional `TagInput`.
 *
 * Permite al usuario agregar y eliminar etiquetas dinámicamente.
 * Internamente controla el valor del campo de texto y responde a la tecla Enter o al clic en el botón "+".
 *
 * @param {TagInputProps} props - Propiedades del componente
 * @return {JSX.Element}
 */
const TagInput: FC<TagInputProps> = ({
  label,
  tags,
  setTags,
  placeholder = '',
  width = '100%'
}) => {
  /**
   * Estado local que guarda el valor actual del input de texto.
   */
  const [inputValue, setInputValue] = useState('')

  /**
   * Agrega una nueva etiqueta a la lista si no está vacía y no se repite.
   *
   * @return {void}
   */
  const addTag = () => {
    const tag = inputValue.trim()
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag])
    }
    setInputValue('')
  }

  /**
   * Elimina una etiqueta específica de la lista.
   *
   * @param {string} tagToRemove - Etiqueta a eliminar
   * @return {void}
   */
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove))
  }

  /**
   * Detecta si el usuario presiona Enter dentro del input y ejecuta la acción de agregar etiqueta.
   *
   * @param {KeyboardEvent<HTMLInputElement>} e - Evento del teclado
   * @return {void}
   */
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  /**
   * Renderiza el componente completo, incluyendo:
   * - Input de texto
   * - Botón para agregar etiquetas
   * - Etiquetas ya agregadas con botón para eliminarlas
   *
   * @return {JSX.Element}
   */
  return (
    <div className="flex flex-col w-full" style={{ maxWidth: width }}>
      <label className="self-start text-md text-gray-700 font-bold mb-1">
        {label}
      </label>
      <div className="flex items-center">
        <input
          type="text"
          className="flex-1 border border-gray-300 rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-green-300"
          placeholder={placeholder}
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          type="button"
          onClick={addTag}
          className="ml-2 w-10 h-10 flex items-center justify-center bg-blue-500 rounded-full text-white hover:bg-blue-600"
        >
          ＋
        </button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {tags.map(tag => (
          <span
            key={tag}
            className="flex items-center bg-blue-100 text-blue-700 rounded-full py-1 px-3"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="ml-2"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </span>
        ))}
      </div>
    </div>
  )
}

export default TagInput
