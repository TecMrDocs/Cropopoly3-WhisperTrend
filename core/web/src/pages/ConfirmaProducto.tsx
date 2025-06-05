import WhiteButton from "../components/WhiteButton";
//import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { usePrompt } from "../contexts/PromptContext";
//import { getConfig } from "@/utils/auth";
//import { API_URL } from "@/utils/constants";

export default function LaunchConfirmacion() {
  const navigate = useNavigate();
  const { empresa, producto, hasSalesData } = usePrompt();
  const { business_name, industry, company_size, scope, locations, num_branches } = empresa || {};
  const { r_type, name, description, related_words } = producto || {};

  const handleSubmit = () => {
    navigate('/loading');
  };

  /*
  const handleSubmit = async () => {
    if (!idProducto) {
      alert("No se pudo obtener el ID del producto.");
      return;
    }
  
    try {
      const response = await fetch(`${API_URL}flow/secure/generate-prompt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getConfig().headers,
        },
        body: JSON.stringify({
          resource_id: idProducto,
        }),
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error del servidor: ${errorText}`);
      }
  
      const data = await response.json();
      console.log("Resultado del prompt generado:", data);
  
      navigate('/loading');
    } catch (error) {
      console.error("Error en la generación del prompt:", error);
      alert("Ocurrió un error al generar el prompt.");
    }
  };
  */

  return(
    <div className="flex flex-col items-center h-screen bg-white">
      <h1 className="text-4xl font-bold mt-2 text-center pt-10">Confirmación de tu producto registrado</h1>
      <p className="max-w-3xl text-lg text-black justify-center mt-5"> Usted ofrece
        el <span className="font-bold">{r_type}</span>: <span className="font-bold">{name}</span>, que consiste en: <span className="font-bold">{description}</span> y que se relaciona con: <span className="font-bold">{related_words}</span>.
      </p>
      
      <p className="text-lg text-black">Para este <span className="font-bold">{r_type ? r_type : ""} {hasSalesData ? "registraste " : "no registraste "} </span> información de ventas</p>
      
      <p className="text-4xl font-bold mt-2 text-center pt-10">¡Ya podemos explorar las tendencias de tu mercado!</p>

      <div className="flex flex-col md:flex-row gap-6 mt-4 pt-10 items-center">
        <WhiteButton text="Regresar" width="200px" onClick={()=> navigate ('/PrevioRegistroVentas')} />
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