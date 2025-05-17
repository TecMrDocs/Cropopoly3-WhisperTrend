import BlueButton from "../components/BlueButton";
import TextFieldWHolder from "../components/TextFieldWHolder";
import WhiteButton from "../components/WhiteButton";


export default function Empresa() {
  return(
    <div>
      <div className="flex items-center justify-center">
        <h1 className="text-3xl font-bold">Edita la información de tu empresa</h1>
      </div>
      <br></br>
      <div className="flex flex-col gap-6 justify-center items-center">
        <TextFieldWHolder label="Nombre de la empresa" width="600px" placeholder="Artículos de piel..." />
        <TextFieldWHolder label="Industria" width="500px" placeholder="Textile, etc." />
        <TextFieldWHolder label="Número de trabajadores" width="500px" placeholder="100" />
        <TextFieldWHolder label="Alcance geográfico" width="500px" placeholder="México, EEUU, etc." />
        <TextFieldWHolder label="País y ciudades donde desarrollas tus operaciones" width="700px" placeholder="México, Ciudad de México, Guadalajara, etc." />
        <TextFieldWHolder label="Número de sucursales" width="500px" placeholder="10" />
      </div>
      <br></br>

      <div className="flex flex-row justify-center gap-10">
        <WhiteButton text="Cancelar" width="300px" />
        <BlueButton text="Guardar" width="300px" />
          
      </div>
    </div>
  );
}