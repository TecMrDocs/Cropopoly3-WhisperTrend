/**
 * Página: NewResource.tsx
 *
 * Descripción:
 * Esta vista permite al usuario registrar un nuevo recurso, ya sea un producto o servicio.
 * Recoge información como el tipo, nombre, descripción y palabras clave relacionadas.
 * Valida los datos antes de enviarlos al backend, y luego redirige al flujo de registro de ventas.
 *
 * Autor: Arturo Barrios Mendoza
 * Contribuyentes: Sebastian Antonio Almanza
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "@/utils/constants";
import { getConfig } from "@/utils/auth";
import { usePrompt } from "../contexts/PromptContext";
import SelectField from "../components/SelectField";
import TextFieldWHolder from "../components/TextFieldWHolder";
import TextAreaField from "../components/TextAreaField";
import WhiteButton from "../components/WhiteButton";
import BlueButton from "../components/BlueButton";
import { Plus, Trash2 } from "lucide-react";

export default function NewResource() {
  const { producto, setProducto, setProductId } = usePrompt();

  /**
   * Estados para los datos del formulario.
   * Se inicializan con los valores actuales del contexto si existen.
   */
  const prodOrServ: string[] = ["Producto", "Servicio"];
  const [pors, setPors] = useState(producto?.r_type || "");
  const [nombreProducto, setNombreProducto] = useState(producto?.name || "");
  const [descripcion, setDescripcion] = useState(producto?.description || "");
  const [palabra, setPalabra] = useState("");
  const [palabras, setPalabras] = useState<string[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const navigate = useNavigate();

  /**
   * Valida los campos del formulario antes de enviarlo.
   * Verifica que todos los campos estén llenos y que haya al menos una palabra asociada.
   * 
   * @return {boolean} true si todos los campos son válidos, false en caso contrario.
   */
  const validarFormulario = () => {
    const nuevosErrores: { [key: string]: string } = {};

    if (!pors.trim()) nuevosErrores.pors = "Este campo es obligatorio";
    if (!nombreProducto.trim()) nuevosErrores.nombreProducto = "Este campo es obligatorio";
    if (!descripcion.trim()) nuevosErrores.descripcion = "Este campo es obligatorio";
    if (palabras.length === 0) nuevosErrores.palabras = "Añadir al menos una palabra asociada";

    setErrors(nuevosErrores);

    return Object.keys(nuevosErrores).length === 0;
  };

  /**
   * Redirige al usuario de regreso a la pantalla de productos.
   */
  const handleReturn = () => {
    navigate("/productos");
  };

  /**
   * Agrega una palabra al array de palabras asociadas si no está repetida y no excede el límite.
   */
  const handleAgregar = () => {
    const nueva = palabra.trim();
    if (nueva && !palabras.includes(nueva) && palabras.length < 10) {
      setPalabras([...palabras, nueva]);
      setPalabra("");
    }
  };

  /**
   * Elimina una palabra del array de palabras asociadas.
   * 
   * @param {string} palabraAEliminar - Palabra que se desea eliminar.
   */
  const eliminarPalabra = (palabraAEliminar: string) => {
    setPalabras(palabras.filter((p) => p !== palabraAEliminar));
  };

  /**
   * Obtiene el ID del usuario autenticado haciendo una petición a auth/check.
   * 
   * @return {Promise<number | null>} ID del usuario o null si falla la petición.
   */
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

  /**
   * Maneja el envío del formulario. Valida los datos y crea el recurso en el backend.
   * Si la operación es exitosa, guarda el recurso en el contexto y redirige al paso siguiente.
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
      setProductId(nuevoRecurso.id);
      setProducto(payload2);
      navigate("/PrevioRegistroVentas");
    } catch (err) {
      console.error("Error de red:", err);
      alert("Error de red o del servidor.");
    }
  };

  /**
   * Renderiza el formulario principal para registrar un nuevo recurso.
   * Incluye campos para tipo, nombre, descripción y palabras clave, con sus validaciones.
   */
  return (
    <div className="flex flex-col items-center min-h-screen bg-white">
      <h1 className="text-4xl font-bold mt-2 text-center">
        Añade el producto o servicio que deseas analizar
      </h1>

      {/* Selector del tipo de recurso */}
      <p className="text-xl mt-10 text-center">¿Ofreces un producto o servicio?</p>
      <div className="mt-3">
        <SelectField
          options={prodOrServ}
          width="300px"
          placeholder="Elige una categoría"
          value={pors}
          onChange={(e) => setPors(e.target.value)}
        />
        {errors.pors && <p className="text-red-500 text-sm mt-1">{errors.pors}</p>}
      </div>

      {/* Campo de nombre */}
      <p className="text-xl mt-10 text-center">¿Cómo se llama tu producto o servicio?</p>
      <div className="mt-3">
        <TextFieldWHolder
          id="Nombre producto"
          label="Nombre de tu producto o servicio"
          placeholder="Escribe el nombre de tu producto o servicio"
          width="600px"
          value={nombreProducto}
          onChange={(e) => setNombreProducto(e.target.value)}
        />
        {errors.nombreProducto && <p className="text-red-500 text-sm mt-1">{errors.nombreProducto}</p>}
      </div>

      {/* Campo de descripción */}
      <p className="text-xl mt-10 text-center">Explica en qué consiste tu producto o servicio</p>
      <div className="mt-3">
        <TextAreaField
          id="Descripcion"
          label="Descripción"
          placeholder="Explica en qué consiste tu producto o servicio"
          maxLength={300}
          width="600px"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
        />
        {errors.descripcion && <p className="text-red-500 text-sm mt-1">{errors.descripcion}</p>}
      </div>

      {/* Sección de palabras asociadas */}
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
          {errors.palabras && <p className="text-red-500 text-sm mt-1">{errors.palabras}</p>}
        </div>
      </div>

      {/* Botones finales */}
      <div className="flex justify-between items-center w-[80%] mt-10 pb-10">
        <WhiteButton text="Regresar" width="200px" onClick={handleReturn} />
        <BlueButton text="Continuar" width="200px" onClick={handleSubmit} />
      </div>
    </div>
  );
}
