/**
* Componente: LaunchConfirmacion.tsx
* Descripción: Muestra un resumen de la información ingresada por el usuario durante el proceso de configuración.
* Incluye detalles de la empresa y producto, e indica si se ha registrado información de ventas.
* Permite regresar o continuar al análisis.
* @returns {JSX.Element} Página de confirmación con los datos ingresados por el usuario.
* Authors: Andrés Cabrera Alvarado.
* Contribuyentes: Arturo Barrios Mendoza, Mariana Balderrábano Aguilar 
*/

import ProgressBar from "../components/ProgressBar";
import WhiteButton from "../components/WhiteButton";
import { useNavigate } from 'react-router-dom';
import { usePrompt } from "../contexts/PromptContext";

export default function LaunchConfirmacion() {
  const navigate = useNavigate();
  const { empresa, producto, hasSalesData } = usePrompt(); // Contexto para obtener los datos de la empresa y el producto
  const { business_name, industry, company_size, scope, locations, num_branches } = empresa || {}; // Desestructuración de los datos de la empresa
  const { r_type, name, description, related_words } = producto || {}; // Desestructuración de los datos del producto

  // Se dirige a la página de carga
  const handleSubmit = () => {
    navigate('/loading');
  };

  return(
    <div className="flex flex-col items-center h-screen bg-white">
      <ProgressBar activeStep={3} />
      <h1 className="text-4xl font-bold mt-2 text-center pt-10">Confirmación de tu información</h1>
      <p className="max-w-3xl text-lg text-black justify-center mt-5">
        <span className="font-bold">{business_name}</span> es una <span className="font-bold">{company_size}</span> que se dedica a la industria de <span className="font-bold">{industry}</span>,
        con un alcance geográfico <span className="font-bold">{scope}</span>, con operaciones en <span className="font-bold">{locations}</span> y <span className="font-bold">{num_branches}</span> sucursales. Además ofrece
        el <span className="font-bold">{r_type}</span>: <span className="font-bold">{name}</span>, que consiste en: <span className="font-bold">{description}</span> y que se relaciona con: <span className="font-bold">{related_words}</span>.
      </p>
      
      <p className="text-lg text-black">Para este <span className="font-bold">{r_type ? r_type : ""} {hasSalesData ? "registraste " : "no registraste "} </span> información de ventas</p>
      
      <p className="text-4xl font-bold mt-2 text-center pt-10">¡Ya podemos explorar las tendencias de tu mercado!</p>

      <div className="flex flex-col md:flex-row gap-6 mt-4 pt-10 items-center">
        <WhiteButton text="Regresar" width="200px" onClick={()=> navigate ('/launchVentas')} />
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