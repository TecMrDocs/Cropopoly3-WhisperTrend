import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePrompt } from "../contexts/PromptContext";
import { getConfig } from "@/utils/auth";
import { API_URL } from "@/utils/constants";
import '/src/components/Loading.css';

export default function AnalysisLoading() {
  const steps = [
    "Analizando palabras relacionadas",
    "Analizando tendencias",
    "Calculando predicciones",
    "Preparando gráficas",
    "Preparando presentación",
  ];

  const navigate = useNavigate();
  const { idProducto } = usePrompt();

  useEffect(() => {
    const fetchPrompt = async () => {
      try {
        const res = await fetch(`${API_URL}flow/secure/generate-prompt`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...getConfig().headers,
          },
          body: JSON.stringify({ resource_id: idProducto }),
        });

        if (!res.ok) throw new Error("Error al generar prompt");
        const data = await res.json();
        console.log("Respuesta:", data);

        navigate("/dashboard");
      } catch (err) {
        console.error("Error en /loading:", err);
        alert("Ocurrió un error al generar el prompt.");
        navigate("/launchConfirmacion");
      }
    };

    fetchPrompt();
  }, []);

  return (
    <div className=" bg-white flex flex-col items-center justify-center text-center pt-20">
      <h2 className="text-2xl md:text-3xl font-bold text-blue-900 mb-20">
        Ejecutando análisis
      </h2>

      <div className="loader pt-20">
        <div></div>
        <div></div>
        <div></div>
      </div>

      <div className="pt-10 mt-4">
        {steps.map((text, i) => (
          <p
            key={i}
            className="pt-7 font-bold text-blue-900 text-xl opacity-0 animate-fade-in-up"
            style={{
              animationDelay: `${1 + i * 1}s`,
              animationFillMode: 'forwards',
              animationDuration: '20s',
            }}
          >
            {text}
          </p>
        ))}
      </div>
    </div>
  );
}
