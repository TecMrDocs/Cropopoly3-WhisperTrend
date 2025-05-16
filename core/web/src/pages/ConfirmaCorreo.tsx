import WhiteButton from "../components/WhiteButton";
import BlueButton from "../components/BlueButton";
import TextField from "../components/TextField";

export default function confirmaCorreo() {
  return (
    <div className='flex flex-col items-center justify-center'>
      <h1 className="text-2xl font-w700 text-[#141652] font-semibold">Confirmación de correo</h1>
      <h3 className="text-lg font-w100 pt-8 pb-8">Ingresa el código de verificación que llegó a tu correo</h3>
      <TextField label="Código de verificación:" width="500px" />
      <br></br>
      <BlueButton text="Continuar" width="200px"/>
      <br></br>
      <p>¿No te llegó el código?</p>
      <WhiteButton text="Enviar un código nuevo" width="250px" />
    </div>
  );
}