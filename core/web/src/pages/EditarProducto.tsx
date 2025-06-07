import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { API_URL } from "@/utils/constants";
import { getConfig } from "@/utils/auth";
import BlueButton from "../components/BlueButton";
import TextFieldWHolder from "../components/TextFieldWHolder";
import WhiteButton from "../components/WhiteButton";
import SelectField from "../components/SelectField";
import TextAreaField from "../components/TextAreaField";
import { Plus, Trash2 } from "lucide-react";
import { usePrompt } from "../contexts/PromptContext";
import user from "@/utils/api/user";

export default function EditarProducto() {
  const [palabra, setPalabra] = useState("");
  const [palabras, setPalabras] = useState<string[]>([]);
  const [tipo, setTipo] = useState("");
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [isSuccess, setIsSuccess] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  const { producto, productId, userId, setUserId } = usePrompt();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (producto) {
      setNombre(producto.name || "");
      setDescripcion(producto.description || "");
      setTipo(producto.r_type || "");
      setPalabras(
        producto.related_words
          ? producto.related_words.split(",").map((p) => p.trim())
          : []
      );
    }
  }, [producto]);

  useEffect(() => {
    const cargarUserId = async () => {
      if (!userId) {
        try {
          const res = await fetch(`${API_URL}auth/check`, getConfig());
          if (!res.ok) throw new Error("Error al verificar usuario");
          const data = await res.json();
          setUserId(data.id);
        } catch (err) {
          console.error("Error obteniendo user_id:", err);
        }
      }
    };
    cargarUserId();
  }, []);

  const validar = () => {
    if (!tipo.trim() || !nombre.trim() || !descripcion.trim()) {
      alert("Todos los campos son obligatorios.");
      return false;
    }
    return true;
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

  const handleSubmit = async () => {
    if (!validar()) return;
    if (!productId || !userId) {
      alert("Faltan datos del producto o usuario.");
      return;
    }

    const payload = {
      user_id: userId,
      r_type: tipo,
      name: nombre,
      description: descripcion,
      related_words: palabras.join(", "),
    };

    try {
      const response = await fetch(`${API_URL}resource/${productId}`, {
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

      //const actualizado = await response.json();
      //console.log("Recurso actualizado:", actualizado);
      //navigate("/productos");
      setIsSuccess(true);
      setShowModal(true);
    } catch (err) {
      console.error("Error de red:", err);
      //alert("Error de red o del servidor.");
      setIsSuccess(false);
      setShowModal(true);
    }
  };

  return (
    <div className="p-8">
      {/* Tabs */}
      <div className="flex justify-center mb-6">
        <div className="flex border rounded-md overflow-hidden">
          <button
            className={`px-6 py-2 font-semibold ${
              location.pathname === "/editarProducto"
                ? "bg-gradient-to-r from-[#00BFB3] to-[#0091D5] text-white"
                : "bg-white text-black"
            }`}
            onClick={() => navigate("/editarProducto")}
          >
            Editar información del producto
          </button>
          <button
            className={`px-6 py-2 font-semibold ${
              location.pathname === "/editarDatos"
                ? "bg-gradient-to-r from-[#00BFB3] to-[#0091D5] text-white"
                : "bg-white text-black"
            }`}
            onClick={() => navigate("/editarDatos")}
          >
            Editar datos de ventas
          </button>
        </div>
      </div>

      <div className="flex items-center justify-center mb-6">
        <h1 className="text-2xl font-w700">Edita tu producto o servicio</h1>
      </div>

      <div className="flex flex-col items-center gap-6">
        <SelectField
          label="Producto o servicio"
          width="700px"
          options={["Producto", "Servicio"]}
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
        />

        <TextFieldWHolder
          id="Nombre producto"
          label="Nombre del producto o servicio:"
          width="700px"
          placeholder="Ej. Bolso Marianne"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />

        <TextAreaField
          id="Descripcion"
          label="Descripción del producto o servicio"
          placeholder="Ej. Bolso de piel sintética para mujer"
          width="700px"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
        />

        <div className="flex flex-col gap-2" style={{ width: "700px" }}>
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
          </div>
        </div>
      </div>

      <div className="flex flex-row justify-center gap-10 mt-10">
        <WhiteButton text="Cancelar" width="300px" onClick={() => navigate(-1)} />
        <BlueButton text="Guardar" width="300px" onClick={handleSubmit} />
      </div>
      
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-8 text-center space-y-6 w-[90%] max-w-md shadow-lg">
            <h3 className="text-xl font-bold text-[#141652]">
              {isSuccess ? "Cambios realizados con éxito" : "Ocurrió un error"}
            </h3>
            <p className="text-sm text-gray-700">
              {isSuccess
                ? "La información del producto fue actualizada correctamente."
                : "No se pudieron guardar los cambios. Por favor, intenta de nuevo más tarde."}
            </p>
            <button
              onClick={() => navigate("/productos")}
              className="mt-4 px-6 py-2 bg-gradient-to-r from-[#00BFB3] to-[#0091D5] text-white rounded-full hover:scale-105 transition"
            >
              Aceptar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
