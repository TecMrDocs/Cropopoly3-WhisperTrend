import GenericButton from "../components/GenericButton";
import LogoBackground from "../components/LogoBackground";
import Container from "../components/Container";
import TextFieldWHolder from "../components/TextFieldWHolder";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

// Función que maneja el cambio de contraseña del usuario.
export default function ChangePassword() {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  //Redirección al usuario a la página de inicio de sesión
  const handleLoginClick = () => {
    navigate("/Login");
  };

  // Administra el envío del formulario de cambio de contraseña
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      setError("Por favor, complete todos los campos");
      return;
    }

    if (newPassword.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setError("");
    alert("Contraseña cambiada exitosamente");
    navigate("/Login");
  };

  // Renderiza la página de cambio de contraseña
  return (
    <LogoBackground>
      <div className="flex-1 flex justify-center items-center p-8">
        <div>
          <h1 className="text-center mb-4 text-[#141652] text-2xl font-semibold">
            Cambia tu contraseña
          </h1>

          <form onSubmit={handleSubmit} className="max-w-[271px]">
            {error && (
            <div className="mb-4 p-2 text-sm text-red-600 bg-red-100 rounded break-words ">
              {error}
            </div>
          )}
            <Container>
              <div className="mb-4">
                <label htmlFor="newPassword" className="block mb-2">
                  Contraseña nueva:
                </label>
                <TextFieldWHolder
                  id="newPassword"
                  name="newPassword"
                  placeholder="Ingrese su nueva contraseña"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  type="password"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="confirmPassword" className="block mb-2">
                  Confirma tu contraseña:
                </label>
                <TextFieldWHolder
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Confirme su contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  type="password"
                />
              </div>
            </Container>

            <GenericButton type="submit" text="Cambiar contraseña" />
          </form>

          <div className="text-center mt-4 text-sm">
            <p>
              ¿Ya tienes cuenta?{" "}
              <span
                onClick={handleLoginClick}
                className="text-[#141652] underline cursor-pointer"
              >
                Inicia sesión
              </span>
            </p>
          </div>
        </div>
      </div>
      <div className="flex-1 p-8 flex flex-col justify-center text-white max-w-[50%]"></div>
    </LogoBackground>
  );
}
