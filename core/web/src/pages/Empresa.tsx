import TextField from "../components/TextField";


export default function Empresa() {
  return(
    <div>
      <div className="flex items-center justify-center">
        <h1 className="text-2xl font-w700">Edita la información de tu empresa</h1>
      </div>
      <br></br>
      <div className="flex flex-col gap-6 justify-center items-center">
        <TextField label="Nombre de la empresa" width="600px" />
        <TextField label="Industria" width="500px" />
        <TextField label="Número de trabajadores" width="500px" />
        <TextField label="Alcance geográfico" width="500px" />
        <TextField label="País y ciudades donde desarrollas tus operaciones" width="700px" />
        <TextField label="Número de sucursales" width="500px" />
      </div>
    </div>
  );
}