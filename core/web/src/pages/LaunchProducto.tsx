import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "@/utils/constants";
import { getConfig } from "@/utils/auth";
import { usePrompt } from "../contexts/PromptContext";
import ProgressBar from "../components/ProgressBar";
import SelectField from "../components/SelectField";
import TextFieldWHolder from "../components/TextFieldWHolder";
import TextAreaField from "../components/TextAreaField";
import WhiteButton from "../components/WhiteButton";
import BlueButton from "../components/BlueButton";
import WordAdder from "../components/WordAdder";
import EnclosedWord from "../components/EnclosedWord";

export default function LaunchProducto() {
  const { producto, setProducto, setProductId } = usePrompt();

  const prodOrServ: string[] = ["Producto", "Servicio"];

  const [pors, setPors] = useState(producto?.r_type || "");
  const [nombreProducto, setNombreProducto] = useState(producto?.name || "");
  const [descripcion, setDescripcion] = useState(producto?.description || "");
  const [palabrasAsociadas, setPalabrasAsociadas] = useState<string[]>(
    producto?.related_words?.split(", ").filter(Boolean) || []
  );
  const navigate = useNavigate();

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validarFormulario = () => {
    const nuevosErrores: { [key: string]: string } = {};
  
    if (!pors.trim()) nuevosErrores.pors = "Este campo es obligatorio";
    if (!nombreProducto.trim()) nuevosErrores.nombreProducto = "Este campo es obligatorio";
    if (!descripcion.trim()) nuevosErrores.descripcion = "Este campo es obligatorio";
    if (palabrasAsociadas.length === 0) nuevosErrores.palabrasAsociadas = "Añadir al menos una palabra asociada";
  
    setErrors(nuevosErrores);
  
    return Object.keys(nuevosErrores).length === 0;
  };  

  const handleReturn = () => {
    navigate("/launchEmpresa");
  };
  
  const handleAddPalabra = (nuevaPalabra: string) => {
    if (nuevaPalabra.trim() !== "" && palabrasAsociadas.length < 10) {
      setPalabrasAsociadas((prev: string[]) => [...prev, nuevaPalabra]);
    }
  };

  const getUserId = async (): Promise<number | null> => {
    try {
      const res = await fetch(`${API_URL}auth/check`, getConfig());
  
      if (!res.ok) throw new Error("Error al verificar usuario");
  
      const data = await res.json();
      return data.id;
    } catch (err) {
      console.error("Error obteniendo user_id:", err);
      return null;
    }
  };  

  const handleSubmit = async () => {
    if (!validarFormulario()) return;
  
    const userId = await getUserId();
    if (!userId) {
      alert("No se pudo obtener el usuario.");
      return;
    }
  
    const palabrasJoin = palabrasAsociadas.join(", ");
  
    const payload = {
      user_id: userId,
      r_type: pors,
      name: nombreProducto,
      description: descripcion,
      related_words: palabrasJoin,
    };

    const payload2 = {
      r_type: pors,
      name: nombreProducto,
      description: descripcion,
      related_words: palabrasJoin,
    }
  
    try {
      const response = await fetch(`${API_URL}resource`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getConfig().headers,
        },
        body: JSON.stringify(payload),
      });      
  
      if (!response.ok) {
        const msg = await response.text();
        console.error("Error al crear el recurso:", msg);
        alert("No se pudo crear el recurso.");
        return;
      }
  
      const nuevoRecurso = await response.json();
      console.log("Recurso creado:", nuevoRecurso);

      setProductId(nuevoRecurso.id);

      setProducto(payload2);

      navigate("/launchVentas");
    } catch (err) {
      console.error("Error de red:", err);
      alert("Error de red o del servidor.");
    }
  };  

  return(
    <div className="flex flex-col items-center min-h-screen bg-white">
      <ProgressBar activeStep={1} />
      <h1 className="text-4xl font-bold mt-2 text-center">Ahora, cuéntanos sobre el producto o servicio<br />que deseas analizar</h1>
      <p className="text-xl mt-10 text-center">¿Ofreces un producto o servicio?</p>
      <div className="mt-3">
        <SelectField options={prodOrServ} width="300px" placeholder="Elige una categoría" value={pors} onChange={(e) => setPors(e.target.value)} />
        {errors.pors && (
          <p className="text-red-500 text-sm mt-1">{errors.pors}</p>
        )}
      </div>
      
      <p className="text-xl mt-10 text-center">¿Cómo se llama tu producto o servicio?</p>
      <div className="mt-3">
        <TextFieldWHolder placeholder="Escribe el nombre de tu producto o servicio" width="600px" value={nombreProducto} onChange={(e) => setNombreProducto(e.target.value)} />
        {errors.nombreProducto && (
          <p className="text-red-500 text-sm mt-1">{errors.nombreProducto}</p>
        )}
      </div>
      
      <p className="text-xl mt-10 text-center">Explica en qué consiste tu producto o servicio</p>
      <div className="mt-3">
        <TextAreaField placeholder="Explica en qué consiste tu producto o servicio" maxLength={300} width="600px" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
        {errors.descripcion && (
          <p className="text-red-500 text-sm mt-1">{errors.descripcion}</p>
        )}
      </div>
      
      <p className="text-xl mt-3 text-center">Indica palabras asociadas con tu producto o servicio (máximo 10)</p>
      <div className="mt-3">
        <WordAdder onAdd={handleAddPalabra} />
        {errors.palabrasAsociadas && (
          <p className="text-red-500 text-sm mt-1">{errors.palabrasAsociadas}</p>
        )}
      </div>

      {palabrasAsociadas.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3 w-xl">
          {palabrasAsociadas.map((palabra, index) => (
            <EnclosedWord key={index} word={palabra} />
          ))}
        </div>
      )}

      <div className="flex justify-between items-center w-[80%] mt-10 pb-10">
        <WhiteButton text="Regresar" width="200px" onClick={handleReturn} />
        <BlueButton text="Continuar" width="200px" onClick={handleSubmit} />
      </div>
    </div>
  );
}