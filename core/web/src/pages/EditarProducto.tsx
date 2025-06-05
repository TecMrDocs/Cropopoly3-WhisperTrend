import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import BlueButton from "../components/BlueButton";
import TextFieldWHolder from "../components/TextFieldWHolder";
import WhiteButton from "../components/WhiteButton";
import SelectField from "../components/SelectField";
import TextAreaField from "../components/TextAreaField";
import { Plus, Trash2 } from "lucide-react";

// Interfaz para el estado recibido
interface ProductoState {
  id: number;
  name: string;
  description: string;
  r_type: string;
  related_words: string;
}

export default function EditarProducto() {
  const [palabra, setPalabra] = useState("");
  const [palabras, setPalabras] = useState<string[]>([]);
  const [tipo, setTipo] = useState("");
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  const token = localStorage.getItem("token");

  // Cargar los datos del producto
  useEffect(() => {
    const state = location.state as ProductoState;
    if (state) {
      const { name, description, r_type, related_words } = state;
      setNombre(name || "");
      setDescripcion(description || "");
      setTipo(r_type || "");
      setPalabras(related_words ? related_words.split(",").map(p => p.trim()) : []);
    }
  }, [location.state]);

  // Obtener el user_id
  const getUserId = async (): Promise<number | null> => {
    try {
      const res = await fetch("http://127.0.0.1:8080/api/v1/auth/check", {
        headers: {
          token: token,
        },
      });

      if (!res.ok) throw new Error("Error al verificar usuario");

      const data = await res.json();
      return data.id;
    } catch (err) {
      console.error("Error obteniendo user_id:", err);
      return null;
    }
  };

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

    const state = location.state as ProductoState;
    const productId = state?.id;
    if (!productId) {
      alert("No se encontró el ID del producto.");
      return;
    }

    const userId = await getUserId();
    if (!userId) {
      alert("No se pudo obtener el usuario.");
      return;
    }

    const payload = {
      r_type: tipo,
      name: nombre,
      description: descripcion,
      related_words: palabras.join(", "),
    };

    try {
      const response = await fetch(
        `http://127.0.0.1:8080/api/v1/resource/${userId}/${productId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            token: token,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const msg = await response.text();
        console.error("Error al actualizar el recurso:", msg);
        alert("No se pudo actualizar el recurso.");
        return;
      }

      const actualizado = await response.json();
      console.log("Recurso actualizado:", actualizado);
      navigate("/launchVentas");
    } catch (err) {
      console.error("Error de red:", err);
      alert("Error de red o del servidor.");
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
          <label className="text-base font-medium" htmlFor="Palabras asociadas">Palabras asociadas</label>
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
        <WhiteButton text="Regresar" width="300px" onClick={() => navigate(-1)} />
        <BlueButton text="Continuar" width="300px" onClick={handleSubmit} />
      </div>
    </div>
  );
}