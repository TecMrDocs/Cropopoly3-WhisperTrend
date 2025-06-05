/**
 * Componente: Loading
 * Authors: Andrés Cabrera Alvarado y Arturo Barrios Mendoza
 * Descripción: Página de carga que muestra mensajes de espera y realiza una petición para activar la búsqueda.
 */

import { useEffect, useRef } from 'react';
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

  const hasFetched = useRef(false); // Evita múltiples peticiones al servidor
  const navigate = useNavigate();
  const { productId } = usePrompt(); // Obtenemos el ID del producto del contexto

  // Efecto para realizar la petición al servidor una sola vez
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    // Función para realizar la petición al servidor y generar el prompt
    const fetchPrompt = async () => {
      try {
        const res = await fetch(`${API_URL}flow/secure/generate-prompt`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...getConfig().headers,
          },
          body: JSON.stringify({ resource_id: productId }),
        });

        // Verifica si la respuesta es exitosa
        if (!res.ok) throw new Error("Error al generar prompt");
        const data = await res.json();
        console.log("Respuesta:", data);

        // Si la respuesta es exitosa, redirige al usuario al dashboard
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
