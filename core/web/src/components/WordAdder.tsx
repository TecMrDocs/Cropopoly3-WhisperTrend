import { useState } from "react";
import ButtonAdd from "./ButtonAdd";
import TextFieldWHolder from "./TextFieldWHolder";

type WordAdderProps = {
  onAdd: (word: string) => void;
};

export default function WordAdder({ onAdd }: WordAdderProps) {
  const [inputWord, setInputWord] = useState("");

  const handleAddClick = () => {
    onAdd(inputWord);
    setInputWord("");
  };

  return (
    <div className="flex flex-row items-center justify-center gap-6">
      <TextFieldWHolder 
        placeholder="Agrega una palabra asociada con tu producto" 
        width="400px"
        value={inputWord}
        onChange={(e) => setInputWord(e.target.value)} />
      <ButtonAdd onClick={handleAddClick} />
    </div>
  );
}
