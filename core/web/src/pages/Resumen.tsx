import ProgressBar from "../components/ProgressBar";
// import AcceptButton from "../components/AcceptButton";
import BackButton from "../components/BackButton";

export default function LaunchProcess() {
  return(
    <div>
      <ProgressBar activeStep={3} />
      <h1 style={{ textAlign: "center", marginBottom: "1rem", color: "#141652", fontSize: "1.6rem"}}>Confirmación de tu información</h1>
      <p style={{ textAlign: "center", marginBottom: "1rem", marginLeft: "10%", marginRight: "10%"}}>[Nombre de empresa] es una empresa que se dedica a la industria [industria], en donde trabajan [x] personas, con un alcance geográfico [], con operaciones en [] y [x] número de sucursales o establecimientos. Además cuenta con el producto/servicio [] que consiste en [] con palabras relacionadas como [ , , ]Para este producto registraste información de ventas</p>
      <h1 style={{ textAlign: "center", marginBottom: "1rem", color: "#141652", fontSize: "1.6rem"}}>¡Ya podemos explorar las tendencias de tu mercado!</h1>
      <div style={{justifyContent: 'center',display: "flex", flexDirection: "column", alignItems: "center"}}>
        {/* <AcceptButton text="Ver resultados" /> */}
        <BackButton text="Ver resultados" />     
        <BackButton text="Regresar" />     
      </div>
      {/* <AcceptButton text="Ver resultados" />
      <BackButton text="Regresar" /> */}
    </div>
  );
}