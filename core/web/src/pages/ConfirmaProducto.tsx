/**
 * Página de confirmación del producto registrado.
 *
 * Este componente muestra un resumen de la información ingresada por el usuario
 * sobre su producto o servicio, incluyendo el tipo, nombre, descripción y palabras clave.
 * También informa si se registraron datos de ventas y permite continuar hacia los resultados
 * o regresar a modificar los datos de ventas.
 *
 * Autor: -
 * Contribuyentes: Mariana Balderrábano Aguilar, Arturo Barrios Mendoza
 */

import WhiteButton from "../components/WhiteButton";
import { useNavigate } from 'react-router-dom';
import { usePrompt } from "../contexts/PromptContext";

/**
 * Componente que muestra al usuario un resumen de los datos registrados
 * y ofrece las opciones de regresar o avanzar hacia la exploración de tendencias.
 *
 * @return {JSX.Element}
 */
export default function LaunchConfirmacion() {
  const navigate = useNavigate();

  /**
   * Obtiene del contexto del prompt los datos del producto y si tiene información de ventas.
   */
  const { producto, hasSalesData } = usePrompt();
  const { r_type, name, description, related_words } = producto || {};

  /**
   * Redirige a la pantalla de carga y análisis de resultados.
   *
   * @return {void}
   */
  const handleSubmit = () => {
    navigate('/loading');
  };

  /**
   * Renderiza la sección de confirmación, mostrando la información ingresada
   * por el usuario y los botones de navegación.
   *
   * @return {JSX.Element}
   */
  return (
    <div className="flex flex-col items-center h-screen bg-white">
      <h1 className="text-4xl font-bold mt-2 text-center pt-10">Confirmación de tu producto registrado</h1>
      
      <p className="max-w-3xl text-lg text-black justify-center mt-5">
        Usted ofrece el <span className="font-bold">{r_type}</span>: 
        <span className="font-bold"> {name}</span>, que consiste en: 
        <span className="font-bold"> {description}</span> y que se relaciona con: 
        <span className="font-bold"> {related_words}</span>.
      </p>
      
      <p className="text-lg text-black">
        Para este <span className="font-bold">{r_type ? r_type : ""} {hasSalesData ? "registraste " : "no registraste "} </span>
        información de ventas
      </p>
      
      <p className="text-4xl font-bold mt-2 text-center pt-10">¡Ya podemos explorar las tendencias de tu mercado!</p>

      <div className="flex flex-col md:flex-row gap-6 mt-4 pt-10 items-center">
        <WhiteButton 
          text="Regresar" 
          width="200px" 
          onClick={() => navigate('/PrevioRegistroVentas')} 
        />
        
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
