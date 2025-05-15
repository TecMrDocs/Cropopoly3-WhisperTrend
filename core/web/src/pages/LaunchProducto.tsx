import { useState } from "react";
import ProgressBar from "../components/ProgressBar";
import SelectField from "../components/SelectField";
import TextFieldWHolder from "../components/TextFieldWHolder";
import TextAreaField from "../components/TextAreaField";
import WhiteButton from "../components/WhiteButton";
import BlueButton from "../components/BlueButton";
import WordAdder from "../components/WordAdder";
import EnclosedWord from "../components/EnclosedWord";

export default function LaunchProducto() {
  const prodOrServ: string[] = ["Producto", "Servicio"];

  const [pors, setPors] = useState("");
  const [nombreProducto, setNombreProducto] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const palabrasAsociadas: string[] = ["Palabra 1", "Otra más", "lol", "Palabrotototota", "Lucio"];
  
  const handleSubmit = () => {
    const data = {
      pors,
      nombreProducto,
      descripcion,
    };
    console.log("Formulario:", data);
  };

  return(
    <div className="flex flex-col items-center h-screen bg-white">
      <ProgressBar activeStep={1} />
      <h1 className="text-4xl font-bold mt-2 text-center">Ahora, cuéntanos sobre el producto o servicio<br />que deseas analizar</h1>
      <p className="text-xl mt-10 text-center">¿Ofreces un producto o servicio?</p>
      <div className="mt-3">
        <SelectField options={prodOrServ} width="300px" placeholder="Elige una categoría" value={pors} onChange={(e) => setPors(e.target.value)} />
      </div>
      
      <p className="text-xl mt-10 text-center">¿Cómo se llama tu producto o servicio?</p>
      <div className="mt-3">
        <TextFieldWHolder placeholder="Escribe el nombre de tu producto o servicio" width="600px" value={nombreProducto} onChange={(e) => setNombreProducto(e.target.value)} />
      </div>
      
      <p className="text-xl mt-10 text-center">Explica en qué consiste tu producto o servicio</p>
      <div className="mt-3">
        <TextAreaField placeholder="Explica en qué consiste tu producto o servicio" maxLength={300} width="600px" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
      </div>
      
      <p className="text-xl mt-3 text-center">Indica palabras asociadas con tu producto o servicio</p>
      <div>
        <WordAdder />
      </div>

      {/* Muestra las palabras asociadas en un formato de "enclosed" */}
      {palabrasAsociadas.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {palabrasAsociadas.map((palabra, index) => (
            <EnclosedWord key={index} word={palabra} />
          ))}
        </div>
      )}

      <div className="flex justify-between items-center w-[80%] mt-10 pb-10">
        <WhiteButton text="Regresar" width="200px" />
        <BlueButton text="Continuar" width="200px" onClick={handleSubmit} />
      </div>
    </div>
  );
}