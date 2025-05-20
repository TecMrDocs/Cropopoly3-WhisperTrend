import { useState } from "react";
import BlueButton from "../components/BlueButton";
import TextFieldWHolder from "../components/TextFieldWHolder";
import WhiteButton from "../components/WhiteButton";
import SelectField from "../components/SelectField";
import TextAreaField from "../components/TextAreaField";
import { Plus, Trash2 } from "lucide-react"; // asegúrate de tener lucide-react instalado

export default function EditarProducto() {
  const [palabra, setPalabra] = useState("");
  const [palabras, setPalabras] = useState<string[]>([]);
  const [tipo, setTipo] = useState("");


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

  return (
    <div className="p-8">
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
          label="Nombre del producto o servicio:"
          width="700px"
          placeholder="Ej. Bolso Marianne"
        />

        <TextAreaField
          label="Descripción del producto o servicio"
          placeholder="Ej. Bolso de piel sintética para mujer"
          width="700px"
        />

        {/* Campo de entrada con botón */}
        <div className="flex flex-col gap-2" style={{ width: "700px" }}>
          <label className="text-base font-medium">Palabras asociadas</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Ej. Elegancia"
              value={palabra}
              onChange={(e) => setPalabra(e.target.value)}
              className="w-full border-none outline-none p-2 px-4 rounded-[6px] bg-white text-base text-black shadow-md"
            />
            <button
              onClick={handleAgregar}
              className="bg-gradient-to-r from-[#00BFB3] to-[#0091D5] p-2 px-4 rounded-[6px] text-white hover:scale-[1.05] transition"
            >
              <Plus size={20} />
            </button>
          </div>

          {/* Palabras renderizadas */}
          <div className="flex flex-wrap gap-2 mt-2">
            {palabras.map((p, idx) => (
              <span
                key={idx}
                className="flex items-center gap-2 border border-blue-500 text-blue-600 px-3 py-1 rounded-full bg-blue-50"
              >
                {p}
                <button
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
        <WhiteButton text="Regresar" width="300px" />
        <BlueButton text="Continuar" width="300px" />
      </div>
    </div>
  );
}

