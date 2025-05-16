import GenericButton from "../components/GenericButton";
import LogoBackground from "../components/LogoBackground";
import Container from "../components/Container";
import TextFieldWHolder from "../components/TextFieldWHolder";

export default function ChangePassword() {
  return (
    <LogoBackground>
      <div className="flex-1 flex justify-center items-center p-8">
        <div>
          <h1 className="text-center mb-4 text-[#141652] text-2xl font-semibold">
            Cambia tu contraseña
          </h1>

          <Container>
            <div className="mb-4">
              <label htmlFor="newPassword" className="block mb-2">
                Contraseña nueva
              </label>
              <TextFieldWHolder placeholder="Ingrese su nueva contraseña" />
            </div>

            <div className="mb-4">
              <label htmlFor="confirmNewPassword" className="block mb-2">
                Confirma tu contraseña
              </label>
              <TextFieldWHolder placeholder="Confirme su contraseña" />
            </div>
          </Container>

          <GenericButton type="submit" text="Cambiar contraseña" />

          <div className="text-center mt-35 text-sm">
            <p>
              ¿Ya tienes cuenta?{" "}
              <a href="/Login" className="text-[#141652] underline">
                Inicia sesión
              </a>
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-8 flex flex-col justify-center text-white max-w-[50%]"></div>
    </LogoBackground>
  );
}
