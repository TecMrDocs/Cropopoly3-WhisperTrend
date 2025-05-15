import ButtonAdd from "./ButtonAdd";
import TextFieldWHolder from "./TextFieldWHolder";

export default function WordAdder() {
  return (
    <div className="flex flex-col items-center justify-center">
      <TextFieldWHolder placeholder="Agrega una palabra asociada con tu producto" width="400px" />
      <ButtonAdd />
    </div>
  );
}
