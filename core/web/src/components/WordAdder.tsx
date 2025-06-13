/**
 * Componente para Agregar Palabras Asociadas a Productos
 * 
 * Este componente proporciona una interfaz para que los usuarios puedan agregar
 * palabras clave relacionadas con sus productos. Incluye un campo de texto y un
 * botón para añadir las palabras, con manejo automático de estado y limpieza de input.
 * 
 * Autor: Arturo Barrios Mendoza
 */

import { useState } from "react";
import ButtonAdd from "./ButtonAdd";
import TextFieldWHolder from "./TextFieldWHolder";

/**
 * Interfaz de propiedades para el componente WordAdder
 * Define el callback que se ejecuta cuando se agrega una nueva palabra
 */
type WordAdderProps = {
  onAdd: (word: string) => void;
};

/**
 * Componente principal para agregar palabras asociadas con productos
 * Combina un campo de texto con un botón de acción para permitir
 * a los usuarios añadir palabras clave de forma intuitiva
 * 
 * @param onAdd Función callback que recibe la palabra agregada
 * @return JSX.Element con la interfaz de adición de palabras
 */
export default function WordAdder({ onAdd }: WordAdderProps) {
  /**
   * Estado local para el control del input de texto
   * Almacena temporalmente la palabra que el usuario está escribiendo
   * antes de ser agregada a la lista principal
   */
  const [inputWord, setInputWord] = useState("");

  /**
   * Manejador para el evento de agregar palabra
   * Ejecuta el callback proporcionado con la palabra actual
   * y limpia el campo de texto para permitir nuevas entradas
   */
  const handleAddClick = () => {
    onAdd(inputWord);
    setInputWord("");
  };

  /**
   * Renderizado de la interfaz de adición de palabras
   * Presenta un layout horizontal con el campo de texto y el botón
   * organizados de forma clara y accesible para el usuario
   */
  return (
    <div className="flex flex-row items-center justify-center gap-6">
      <TextFieldWHolder 
        id="Palabra asociada"
        label="Palabras asociadas"
        placeholder="Agrega una palabra asociada con tu producto" 
        width="400px"
        value={inputWord}
        onChange={(e) => setInputWord(e.target.value)} />
      <ButtonAdd onClick={handleAddClick} />
    </div>
  );
}