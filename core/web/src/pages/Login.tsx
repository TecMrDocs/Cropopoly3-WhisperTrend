import GenericButton from "../components/GenericButton";
import LogoBackground from '../components/LogoBackground';
import Container from '../components/Container';
import TextFieldWHolder from "../components/TextFieldWHolder";

export default function Login() {
  return (
    <LogoBackground>
      <div className="flex flex-1 justify-center items-center p-8">
        <div>
          <h1 className="text-center mb-4 text-[#141652] text-2xl font-semibold">Bienvenid@</h1>
          <h2 className="text-center mb-4 text-[#141652] text-xl">Inicia sesión</h2>
          
          <Container>
            <div className="mb-4">
              <label htmlFor="email" className="block mb-2">Correo</label>
              <TextFieldWHolder placeholder="Ingrese su correo" />
            </div>
            
            <div className="mb-4">
              <label htmlFor="password" className="block mb-2">Contraseña</label>
              <TextFieldWHolder placeholder="Ingrese su contraseña" />
            </div>
          </Container>

          <GenericButton type="submit" text="Iniciar sesión" />

          <div className="text-center mt-12 text-sm">
            <p>No tienes cuenta? <a href="#" className="text-[#141652] underline">Regístrate</a></p>
            <p><a href="#" className="text-[#141652] underline">Olvidé mi contraseña</a></p>
            <p><a href="#" className="text-[#141652] underline">Aviso de privacidad</a></p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-8 flex flex-col justify-center text-white max-w-[50%]">
      </div>
    </LogoBackground>
  );
}
