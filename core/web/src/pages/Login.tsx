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
    console.log("formulario", { email, password: password });

    if (!email) {
      newErrors.email = "El correo es requerido";
      valid = false;
    } else if (!email.includes("@")) {
      newErrors.email = "El correo debe contener @";
      valid = false;
    } else if (!/^[a-zA-Z0-9]+@[a-zA-Z]+\.[a-zA-Z]+(\.[a-zA-Z]+)?$/.test(email)) {
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

  // Maneja el envío del formulario
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setApiError("");

    if (!validateForm()) return;
    setLoading(true);

    try {
      await signIn(email, password);
      navigate("/dashboard");
    } catch(error: any){
      if(error.response?.status === 401){
        setApiError("Email o contraseña incorrectos");
      } else {
        setApiError("Error al iniciar sesión")
      }
    } finally {
      setLoading(false);
    }

  };

  // Página de inicio de sesión con formulario y mensajes de error
  return (
    <LogoBackground>
      <div className="flex flex-1 justify-center items-center p-8">
        <div>
          <h1 className="text-center mb-4 text-[#141652] text-2xl font-semibold">Bienvenid@</h1>
          <h2 className="text-center mb-4 text-[#141652] text-xl">Inicia sesión</h2>

          {apiError && (
            <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
              {apiError}
            </div>
          )}
          <form onSubmit={handleSubmit} className="max-w-[271px]">
            <Container>
              <div className="mb-4">
                <label htmlFor="email-input" className="block mb-2">Correo</label>
                <TextFieldWHolder
                  id="email-input"
                  name="email"
                  placeholder="Ingrese su correo"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  hasError={!!errors.email}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1 break-words">{errors.email}</p>
                )}
              </div>

              <div className="mb-4">
                <label htmlFor="password-input" >Contraseña</label>
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
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
              </div>
            </Container>

            <GenericButton type="submit" text="Iniciar sesión" />
          </form>

          <div className="text-center mt-12 text-sm">
            <p>
              No tienes cuenta?{" "}
              <span
                onClick={() => navigate("/RegistroU")}
                className="text-[#141652] underline cursor-pointer"
              >
                Regístrate
              </span>
            </p>
            <p>
              <span
                onClick={() => navigate("/ChangePassword")}
                className="text-[#141652] underline cursor-pointer"
              >
                Olvidé mi contraseña
              </span>
            </p>
            <p>
              <span
                onClick={() => navigate("/avisoPrivacidad")}
                className="text-[#141652] underline cursor-pointer"
              >
                Aviso de privacidad
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-8 flex flex-col justify-center text-white">
      </div>
    </LogoBackground>
  );
}
