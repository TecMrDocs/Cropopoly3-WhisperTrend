import { useState, FormEvent } from "react";
import GenericButton from "../components/GenericButton";
import LogoBackground from "../components/LogoBackground";
import Container from "../components/Container";
import TextFieldWHolder from "../components/TextFieldWHolder";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

// Maneja el inicio de sesión del usuario
export default function Login() {
  // Define estados para el formulario
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });
  const [apiError, setApiError] = useState("");
  // const [token, setToken] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  // Valida el formulario antes de enviarlo	
  const validateForm = () => {
    let valid = true;
    const newErrors = {
      email: "",
      password: "",
    };

    if (!email) {
      newErrors.email = "El correo es requerido";
      valid = false;
    } else if (!email.includes("@")) {
      newErrors.email = "El correo debe contener @";
      valid = false;
    } else if (!/^[a-zA-Z0-9_]+@[a-zA-Z]+\.[a-zA-Z]+(\.[a-zA-Z]+)?$/.test(email)) {
      newErrors.email = "El correo no tiene un formato válido";
      valid = false;
    }

    if (!password) {
      newErrors.password = "La contraseña es requerida";
      valid = false;
    }
    else if (password.length < 8) {
      newErrors.password = "La contraseña debe tener mínimo 8 caracteres";
      valid = false;
    }


    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setErrors({ email: "", password: "" });
    setApiError("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await signIn(email, password);
    } catch (error: any) {
      // const status = error.response?.status;
      const message = typeof error.response?.data === "string"
        ? error.response.data
        : error.response?.data?.message || "Error al iniciar sesión";
      setApiError(message);
    }
    setLoading(false);
  };

  // Página de inicio de sesión con formulario y mensajes de error
  return (
    <LogoBackground>
      <div className="min-h-screen flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-md mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 md:p-8 shadow-2xl border border-white/20">
            <h1 className="text-center mb-4 text-[#141652] text-2xl md:text-3xl font-semibold">
              Bienvenid@
            </h1>
            <h2 className="text-center mb-6 text-[#141652] text-lg md:text-xl">
              Inicia sesión
            </h2>

            {apiError && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-xl text-sm">
                {apiError}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <Container>
                <div className="mb-4">
                  <label htmlFor="email-input" className="block mb-2 text-white font-medium">
                    Correo
                  </label>
                  <TextFieldWHolder
                    id="email-input"
                    name="email"
                    placeholder="Ingrese su correo"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    hasError={!!errors.email}
                  />
                  {errors.email && (
                    <p className="text-red-200 text-sm mt-1 break-words">{errors.email}</p>
                  )}
                </div>

                <div className="mb-4">
                  <label htmlFor="password-input" className="block mb-2 text-white font-medium">
                    Contraseña
                  </label>
                  <TextFieldWHolder
                    id="password-input"
                    name="password"
                    type="password"
                    placeholder="Ingrese su contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    hasError={!!errors.password}
                  />
                  {errors.password && (
                    <p className="text-red-200 text-sm mt-1">{errors.password}</p>
                  )}
                </div>
              </Container>

              <GenericButton 
                type="submit" 
                text={loading ? "Cargando..." : "Iniciar sesión"} 
                disabled={loading} 
              />
            </form>

            <div className="text-center mt-8 space-y-2 text-sm">
              <p className="text-gray-700">
                No tienes cuenta?{" "}
                <span
                  onClick={() => navigate("/RegistroU")}
                  className="text-[#3aadc4] underline cursor-pointer font-medium hover:text-blue-600 transition-colors"
                >
                  Regístrate
                </span>
              </p>
              <p>
                <span
                  onClick={() => navigate("/ChangePassword")}
                  className="text-[#3aadc4] underline cursor-pointer font-medium hover:text-blue-600 transition-colors"
                >
                  Olvidé mi contraseña
                </span>
              </p>
              <p>
                <span
                  onClick={() => navigate("/avisoPrivacidad")}
                  className="text-[#3aadc4] underline cursor-pointer font-medium hover:text-blue-600 transition-colors"
                >
                  Aviso de privacidad
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </LogoBackground>
  );
}