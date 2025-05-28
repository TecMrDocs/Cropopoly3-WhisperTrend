import ProgressBar from "../components/ProgressBar";
import WhiteButton from "../components/WhiteButton";
import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { usePrompt } from "../contexts/PromptContext";
import { API_URL } from "@/utils/constants";

export default function LaunchConfirmacion() {
  const navigate = useNavigate();
  const { prompt, empresa, producto, } = usePrompt();
  const { business_name, industry, company_size, scope, locations, num_branches } = empresa || {};
  const { r_type, name, description, related_words } = producto || {};

  const [sentencia, setSentencia] = useState("");
  const [hashtag1, setHashtag1] = useState("");
  const [hashtag2, setHashtag2] = useState("");
  const [hashtag3, setHashtag3] = useState("");

  console.log("Prompt:", prompt);

  const handleSubmit = async () => {
    if (!prompt) {
      alert("No hay prompt para enviar");
      return;
    }
  
    try {
      const response = await fetch(`${API_URL}chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "deepseek-r1-distill-llama-70b",
          message: prompt,
        }),
      });
  
      if (!response.ok) throw new Error("Error al enviar el prompt");
  
      const data = await response.json();
  
      // Extraer solo el texto después de </think>
      const splitByThink = data.split("</think>");
      const afterThink = splitByThink.length > 1 ? splitByThink[1].trim() : data.trim();
  
      // Separar por @
      const [sentenciaText, hashtagsText] = afterThink.split("@").map((s: string) => s.trim());
  
      // Extraer hashtags (pueden estar separados por espacio o salto de línea)
      const hashtags = hashtagsText.split(/[\s\n]+/).filter((tag: string) => tag.startsWith("#"));
  
      // Guardar en estados
      setSentencia(sentenciaText || "");
      setHashtag1(hashtags[0] || "");
      setHashtag2(hashtags[1] || "");
      setHashtag3(hashtags[2] || "");
  
      console.log("Sentencia:", sentenciaText);
      console.log("Hashtags:", hashtags);
  
      navigate('/loading');
    } catch (error) {
      console.error("Error con el chat:", error);
      alert("Error con el chat.");
    }
  };

  return(
    <div className="flex flex-col items-center h-screen bg-white">
      <ProgressBar activeStep={3} />
      <h1 className="text-4xl font-bold mt-2 text-center pt-10">Confirmación de tu información</h1>
      <p className="max-w-3xl text-lg text-black justify-center">
        <span className="font-bold">{business_name}</span> es una <span className="font-bold">{company_size}</span> que se dedica a la industria de <span className="font-bold">{industry}</span>,
        con un alcance geográfico <span className="font-bold">{scope}</span>, con operaciones en <span className="font-bold">{locations}</span> y <span className="font-bold">{num_branches}</span> sucursales. Además ofrece
        el <span className="font-bold">{r_type}</span>: <span className="font-bold">{name}</span>, que consiste en: <span className="font-bold">{description}</span> y que se relaciona con: <span className="font-bold">{related_words}</span>.
      </p>
      <p className="text-lg text-black">Para este producto registraste información de ventas.</p>
      <p className="text-4xl font-bold mt-2 text-center pt-10">¡Ya podemos explorar las tendencias de tu mercado!</p>

      <div className="flex flex-col md:flex-row gap-6 mt-4 pt-10 items-center">
        <WhiteButton text="Regresar" width="200px" />
        <button
          onClick={handleSubmit}
          className="border-2 bg-gradient-to-r from-blue-500 to-teal-400 text-white font-semibold px-15 py-3 rounded-full hover:scale-105 transition-transform"
        >
          Ver resultados
        </button>
      </div>
    </div>
  );
}