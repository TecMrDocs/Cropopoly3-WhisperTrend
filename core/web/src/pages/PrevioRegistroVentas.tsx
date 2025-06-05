// import ProgressBar from "../components/ProgressBar";
import WhiteButton from "../components/WhiteButton";
import { useNavigate } from 'react-router-dom';

export default function PrevioRegistroVentas() {
  const navigate = useNavigate();
  return(
    <div className="flex flex-col items-center h-screen bg-white">
      {/* <ProgressBar activeStep={2} /> */}
      <h1 className="text-4xl font-bold mt-2 text-center pt-10">Para incrementar la precisión de nuestro análisis,puedes <br />proporcionar información sobre las ventas de tu producto</h1>
      
      <p className="text-3xl text-black pt-20">¿Quieres ingresar la información ahora?</p>

      <div className="flex flex-col md:flex-row pt-10 justify-between items-center w-[80%] mt-10 pb-10">
        <WhiteButton text="Regresar" width="200px" onClick={() => navigate('/NewResource')}/>

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