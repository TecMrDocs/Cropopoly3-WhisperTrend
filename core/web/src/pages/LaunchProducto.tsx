/**
 * Componente: LaunchProducto
 * Authors: Arturo Barrios Mendoza
 * Descripción: Página para registrar el producto o servicio del usuario
 */

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
import { Plus, Trash2 } from "lucide-react";

export default function LaunchProducto() {
  const { producto, setProducto, productId, setProductId } = usePrompt(); // Obtenemos los datos del producto del contexto

  // Opciones para registrar producto o servicio
  const prodOrServ: string[] = ["Producto", "Servicio"];

  // Estados para los campos del formulario
  const [pors, setPors] = useState(producto?.r_type || ""); // Tipo de recurso (producto o servicio)
  const [nombreProducto, setNombreProducto] = useState(producto?.name || ""); // Nombre del producto o servicio
  const [descripcion, setDescripcion] = useState(producto?.description || ""); // Descripción del producto o servicio
  // Palabras asociadas al producto o servicio
  const [palabrasAsociadas, setPalabrasAsociadas] = useState<string[]>(
    producto?.related_words?.split(", ").filter(Boolean) || []
  );
  const navigate = useNavigate();

  const [errors, setErrors] = useState<{ [key: string]: string }>({}); // Objeto para almacenar errores de validación

  const [palabra, setPalabra] = useState("");
  const [palabras, setPalabras] = useState<string[]>([]);

  // Validación del formulario
  const validarFormulario = () => {
    const nuevosErrores: { [key: string]: string } = {};
  
    if (!pors.trim()) nuevosErrores.pors = "Este campo es obligatorio";
    if (!nombreProducto.trim()) nuevosErrores.nombreProducto = "Este campo es obligatorio";
    if (!descripcion.trim()) nuevosErrores.descripcion = "Este campo es obligatorio";
    //if (palabrasAsociadas.length === 0) nuevosErrores.palabrasAsociadas = "Añadir al menos una palabra asociada";
    if (palabras.length === 0) nuevosErrores.palabras = "Añadir al menos una palabra asociada";
  
    setErrors(nuevosErrores);
  
    return Object.keys(nuevosErrores).length === 0;
  };  

  // Redirecciona al usuario a la página de registro de empresa
  const handleReturn = () => {
    navigate("/launchEmpresa");
  };
  
  // Maneja la adición de una nueva palabra asociada
  {/*
  const handleAddPalabra = (nuevaPalabra: string) => {
    if (nuevaPalabra.trim() !== "" && palabrasAsociadas.length < 10) {
      setPalabrasAsociadas((prev: string[]) => [...prev, nuevaPalabra]);
    }
  };
  */}

  // Obtiene el ID del usuario autenticado
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

  const handleAgregar = () => {
    const nueva = palabra.trim();
    if (nueva && !palabras.includes(nueva) && palabras.length < 10) {
      setPalabras([...palabras, nueva]);
      setPalabra("");
    }
  };

  const eliminarPalabra = (palabraAEliminar: string) => {
    setPalabras(palabras.filter((p) => p !== palabraAEliminar));
  };

  /**
   * Autor: Arturo Barrios Mendoza
   * Descripción: Envía los datos de la empresa al backend y redirige al usuario.
   */
  const handleSubmit = async () => {
    if (!validarFormulario()) return;
  
    const userId = await getUserId();
    if (!userId) {
      alert("No se pudo obtener el usuario.");
      return;
    }
  
    const palabrasJoin = palabras.join(", ");
  
    const payload = {
      id: productId,
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
    };
  
    try {
      let response;
      if (productId) {
        response = await fetch(`${API_URL}resource/${productId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Accept": "*/*",
            ...getConfig().headers,
          },
          body: JSON.stringify(payload),
        });
  
        if (!response.ok) {
          const msg = await response.text();
          console.error("Error al actualizar el recurso:", msg);
          alert("No se pudo actualizar el recurso.");
          return;
        }
  
        // No se espera respuesta JSON
        setProducto(payload2);
        navigate("/launchVentas");
      } else {
        response = await fetch(`${API_URL}resource`, {
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
  
        const recursoGuardado = await response.json();
        setProductId(recursoGuardado.id);
        setProducto(payload2);
        navigate("/launchVentas");
      }
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
        <TextFieldWHolder 
          id="nombreProducto"
          label="Nombre del producto o servicio"
          placeholder="Escribe el nombre de tu producto o servicio" 
          width="600px" 
          value={nombreProducto} 
          onChange={(e) => setNombreProducto(e.target.value)} 
        />
        {errors.nombreProducto && (
          <p className="text-red-500 text-sm mt-1">{errors.nombreProducto}</p>
        )}
      </div>
      
      <p className="text-xl mt-10 text-center">Explica en qué consiste tu producto o servicio</p>
      <div className="mt-3">
        <TextAreaField 
          id="descripcion"
          label="Descripción"
          placeholder="Explica en qué consiste tu producto o servicio" 
          maxLength={300} 
          width="600px" 
          value={descripcion} 
          onChange={(e) => setDescripcion(e.target.value)} />
        {errors.descripcion && (
          <p className="text-red-500 text-sm mt-1">{errors.descripcion}</p>
        )}
      </div>

      <div className="flex flex-col gap-2 mt-10" style={{ width: "700px" }}>
          <label className="text-base font-medium" htmlFor="Palabras asociadas">
            Palabras asociadas
          </label>
          <div className="flex gap-2">
            <input
              id="Palabras asociadas"
              type="text"
              placeholder="Ej. Elegancia"
              value={palabra}
              onChange={(e) => setPalabra(e.target.value)}
              className="w-full border-none outline-none p-2 px-4 rounded-[6px] bg-white text-base text-black shadow-md"
            />
            <button
              aria-label="Agregar palabra"
              onClick={handleAgregar}
              className="bg-gradient-to-r from-[#00BFB3] to-[#0091D5] p-2 px-4 rounded-[6px] text-white hover:scale-[1.05] transition"
            >
              <Plus size={20} />
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mt-2">
            {palabras.map((p: string, idx: number) => (
              <span
                key={idx}
                className="flex items-center gap-2 border border-blue-500 text-blue-600 px-3 py-1 rounded-full bg-blue-50"
              >
                {p}
                <button
                  aria-label="Eliminar palabra"
                  onClick={() => eliminarPalabra(p)}
                  className="hover:text-red-600"
                >
                  <Trash2 size={16} />
                </button>
              </span>
            ))}
            {errors.palabras && (
              <p className="text-red-500 text-sm mt-1">{errors.palabras}</p>
            )}
          </div>
        </div>
      
      {/*
      <p className="text-xl mt-3 text-center">Indica palabras asociadas con tu producto o servicio (máximo 10)</p>
      <div className="mt-3">
        <WordAdder onAdd={handleAddPalabra} />
        {errors.palabrasAsociadas && (
          <p className="text-red-500 text-sm mt-1">{errors.palabrasAsociadas}</p>
        )}
      </div>
      */}

      {/*palabrasAsociadas.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3 w-xl">
          {palabrasAsociadas.map((palabra, index) => (
            <EnclosedWord key={index} word={palabra} />
          ))}
        </div>
      )*/}

      <div className="flex justify-between items-center w-[80%] mt-10 pb-10">
        <WhiteButton text="Regresar" width="200px" onClick={handleReturn} />
        <BlueButton text="Continuar" width="200px" onClick={handleSubmit} />
      </div>
    </div>
  );
}