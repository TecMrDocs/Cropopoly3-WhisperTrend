import ProgressBar from "../components/ProgressBar";
// import AcceptButton from "../components/AcceptButton";
import BackButton from "../components/BackButton";
import BlueButton from "../components/BlueButton";
import WhiteButton from "../components/WhiteButton";
export default function Resumen() {
  return(
    <div>
      <ProgressBar activeStep={3} />
      <div className="gap-5 flex flex-col items-center justify-center w-[80%] mx-auto">
        <h1 className="text-2xl font-w700 text-[#141652] font-semibold">Confirmación de tu información</h1>
        <h3 className="text-lg font-w100 pt-4 text-center">[Nombre de empresa] es una empresa que se dedica a la industria [industria], en donde trabajan [x] personas, con un alcance geográfico [], con operaciones en [] y [x] número de sucursales o establecimientos. Además cuenta con el producto/servicio [] que consiste en [] con palabras relacionadas como [ , , ]Para este producto registraste información de ventas</h3>
        <h1 className="text-2xl font-w700 text-[#141652] font-semibold">¡Ya podemos explorar las tendencias de tu mercado!</h1>
        <BlueButton text="Ver resultados" width="300px" />     
        <WhiteButton text="Regresar" width="20%" />     
      </div>
    </div>
  );
}