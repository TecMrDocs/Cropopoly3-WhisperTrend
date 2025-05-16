import ProgressBar from "../components/ProgressBar";
import WhiteButton from "../components/WhiteButton";
import { useNavigate } from 'react-router-dom';

export default function LaunchConfirmacion() {
  const navigate = useNavigate();
  return(
    <div className="flex flex-col items-center h-screen bg-white">
      <ProgressBar activeStep={3} />
      <h1 className="text-4xl font-bold mt-2 text-center pt-10">Confirmación de tu información</h1>
      <p className="max-w-3xl text-lg text-black justify-center">
        <span className="font-bold">[Nombre de empresa]</span> es una empresa que se dedica a la industria <span className="font-bold">[industria]</span>, en donde trabajan <span className="font-bold">[x]</span> personas,
        con un alcance geográfico <span className="font-bold">[]</span>, con operaciones en <span className="font-bold">[]</span> y <span className="font-bold">[x]</span> número de sucursales o establecimientos. Además cuenta
        con el producto/servicio <span className="font-bold">[]</span> que consiste en <span className="font-bold">[]</span> con palabras relacionadas como <span className="font-bold">[ , , ]</span>.
      </p>
      <p className="text-lg text-black">Para este producto registraste información de ventas.</p>
      <p className="text-4xl font-bold mt-2 text-center pt-10">¡Ya podemos explorar las tendencias de tu mercado!</p>

      <div className="flex flex-col md:flex-row gap-6 mt-4 pt-10 items-center">
        <WhiteButton text="Regresar" width="200px" />
        <button
          onClick={() => navigate('/loading')}
          className="border-2 bg-gradient-to-r from-blue-500 to-teal-400 text-white font-semibold px-15 py-3 rounded-full hover:scale-105 transition-transform"
        >
          Ver resultados
        </button>
      </div>
    </div>
  );
}