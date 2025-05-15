import WhiteButton from "../components/WhiteButton";
import BlueButton from "../components/BlueButton";
import TextField from "../components/TextField";

export default function Perfil() {
  return(
    <div>
      <div className='flex items-center justify-center'>
        <h1 className="text-2xl font-w700">Edita tus datos personales</h1>
      </div>
      <br></br>
      <div className='flex flex-row gap-6 justify-center'>
         <TextField label="Nombre(s)" width="300px" /> 
         <TextField label="Apellido(s)" width="300px" />
      </div>
      <br></br>
      <div className="flex flex-col gap-5 items-center justify-center">
        <TextField label="Correo electrónico" width="600px" />
        <TextField label="Confirma tu correo" width="600px" />
        <TextField label="Número telefónico" width="600px" />
        <TextField label="Puesto o cargo en la empresa" width="600px" />
        <TextField label="Contraseña" width="600px" />
        <TextField label="Confirma tu contraseña" width="600px" />
      </div>
      <br></br>

      <div className="flex flex-row justify-center gap-10">
        <WhiteButton text="Cancelar" width="300px" />
        <BlueButton text="Guardar" width="300px" />

      </div>
      
    </div>
  );
}