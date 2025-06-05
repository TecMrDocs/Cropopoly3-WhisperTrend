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
  const [loading, setLoading] = useState(false);

  //Redirección al usuario a la página de inicio de sesión
  const handleLoginClick = () => {
    navigate("/Login");
  };

  // Administra el envío del formulario de cambio de contraseña
  const handleSubmit = async (e: React.FormEvent) => {
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

    setLoading(true);
    try {
      // Aquí iría la lógica de cambio de contraseña
      setError("");
      alert("Contraseña cambiada exitosamente");
      navigate("/Login");
    } catch (error: any) {
      setError(error.message || "Error al cambiar la contraseña");
    } finally {
      setLoading(false);
    }
  };

  // Renderiza la página de cambio de contraseña
  return (
    <LogoBackground>
      <div className="min-h-screen flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-md mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 md:p-8 shadow-2xl border border-white/20">
            <h1 className="text-center mb-4 text-[#141652] text-xl md:text-2xl font-semibold">
              Cambio de Contraseña
            </h1>
            <h2 className="text-center mb-6 text-[#141652] text-lg md:text-xl">
              Ingresa tu nueva contraseña
            </h2>

            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-xl text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Container>
                <div className="mb-4">
                  <label htmlFor="newPassword" className="block mb-2 text-white font-medium">
                    Contraseña nueva
                  </label>
                  <TextFieldWHolder
                    id="newPassword"
                    name="newPassword"
                    placeholder="Ingrese su nueva contraseña"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    type="password"
                    hasError={!!error}
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="confirmPassword" className="block mb-2 text-white font-medium">
                    Confirma tu contraseña
                  </label>
                  <TextFieldWHolder
                    id="confirmPassword"
                    name="confirmPassword"
                    placeholder="Confirme su contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    type="password"
                    hasError={!!error}
                  />
                </div>
              </Container>

              <GenericButton 
                type="submit" 
                text={loading ? "Cargando..." : "Cambiar contraseña"} 
                disabled={loading} 
              />
            </form>

            <div className="text-center mt-8 space-y-2 text-sm">
              <p className="text-gray-700">
                ¿Ya tienes cuenta?{" "}
                <span
                  onClick={handleLoginClick}
                  className="text-[#3aadc4] underline cursor-pointer font-medium hover:text-blue-600 transition-colors"
                >
                  Inicia sesión
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </LogoBackground>
  );
}
