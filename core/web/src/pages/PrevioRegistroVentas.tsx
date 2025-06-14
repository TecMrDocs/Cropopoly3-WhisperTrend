/**
 * Página: PrevioRegistroVentas.tsx
 * 
 * Descripción:
 * Este componente muestra una pantalla de decisión que permite al usuario 
 * elegir si desea ingresar la información de ventas de su producto en ese momento.
 * Forma parte del flujo posterior al registro de un producto o servicio.
 * 
 * Autor: Arturo Barrios Mendoza
 * Contribuyentes: Andrés Cabrera, Mariana Balderrábano Aguilar, Sebastian Antonio Almanza
 */

import WhiteButton from "../components/WhiteButton";
import { useNavigate } from 'react-router-dom';

export default function PrevioRegistroVentas() {
  const navigate = useNavigate();

  /**
   * Renderiza una pantalla que pregunta al usuario si desea ingresar
   * los datos de ventas ahora, más tarde o regresar a la pantalla anterior.
   * Ofrece tres opciones de navegación:
   * 
   * - "Regresar": vuelve a la pantalla de creación del recurso.
   * - "Más tarde": salta el ingreso de ventas y continúa con el flujo.
   * - "Sí": redirige al formulario para registrar ventas.
   */
  return(
    <div className="flex flex-col items-center h-screen bg-white">
      {/* Título que invita al usuario a mejorar la precisión del análisis */}
      <h1 className="text-4xl font-bold mt-2 text-center pt-10">
        Para incrementar la precisión de nuestro análisis,<br />
        puedes proporcionar información sobre las ventas de tu producto
      </h1>
      
      {/* Pregunta directa al usuario */}
      <p className="text-3xl text-black pt-20">¿Quieres ingresar la información ahora?</p>

      {/* Botones de decisión */}
      <div className="flex flex-col md:flex-row pt-10 justify-between items-center w-[80%] mt-10 pb-10">
        <WhiteButton 
          text="Regresar" 
          width="200px" 
          onClick={() => navigate('/NewResource')}
        />

        <button
          onClick={() => navigate('/ConfirmaProducto')}
          className="border-4 border-blue-600 text-blue-600 font-semibold px-15 py-3 rounded-full hover:bg-blue-50 transition"
        >
          Más tarde
        </button>

        <button
          onClick={() => navigate('/RegistroVentas')}
          className="border-2 bg-gradient-to-r from-blue-500 to-teal-400 text-white font-semibold px-15 py-3 rounded-full hover:scale-105 transition-transform"
        >
          Sí
        </button>
      </div>
    </div>
  );
}
