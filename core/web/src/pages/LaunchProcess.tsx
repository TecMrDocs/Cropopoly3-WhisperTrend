import ProgressBar from "../components/ProgressBar";
import GenericButton from "../components/GenericButton";

export default function LaunchProcess() {
  const nombreUsuario: string = "Lucio";

  return(
    <div className="flex flex-col items-center h-screen bg-white">
      <h1 className="text-4xl font-bold mt-10 text-center">¡Hola {nombreUsuario}!</h1>
      <p className="text-xl mt-10 text-center">Te damos la bienvenida a WhisperTrend</p>
      <p className="text-xl mt-10 text-center">¡Ayúdanos a conocerte para comenzar a descubrir las tendencias<br/>que dan futuro a tu industria</p>
      <p className="text-xl mt-10 mb-10 text-center">A continuación te mostramos el proceso</p>
      <ProgressBar activeStep={3} />
      <div className="flex justify-center items-center mt-2 w-50">
        <GenericButton text="Comenzar ahora" />
      </div>
    </div>
  );
}