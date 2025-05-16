import WhiteButton from "../components/WhiteButton";
import BlueButton from "../components/BlueButton";
import TextFieldWHolder from "../components/TextFieldWHolder";

export default function Perfil() {
  return(
    <div>
      <div className='flex items-center justify-center'>
        <h1 className="text-2xl font-w700">Edita tus datos personales</h1>
      </div>
      <br></br>
      <div className='flex flex-row gap-6 justify-center'>
         <TextFieldWHolder placeholder="Ingrese su nombre" width="300px" label="Nombre(s)"/>
         <TextFieldWHolder placeholder="Ingrese su apellido(s)" width="300px" label="Apellido(s)" />
      </div>
      <br></br>
      <div className="flex flex-col gap-5 items-center justify-center">
        <TextFieldWHolder placeholder="mail@example.com" width="600px" label="Correo electrónico" />
        <TextFieldWHolder label="Confirma tu correo" width="600px" />
        <TextFieldWHolder label="Número telefónico" width="600px" placeholder="+55 12 1234 5678" />
        <TextFieldWHolder label="Puesto o cargo en la empresa" width="600px" />
        <TextFieldWHolder label="Contraseña" width="600px" />
        <TextFieldWHolder label="Confirma tu contraseña" width="600px" />
      </div>
      <br></br>

      <div className="flex flex-row justify-center gap-10">
        <WhiteButton text="Cancelar" width="300px" />
        <BlueButton text="Guardar" width="300px" />

      </div>
      
    </div>
  );
}