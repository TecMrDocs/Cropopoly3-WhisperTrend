import { useState, FormEvent } from "react";
import GenericButton from "../components/GenericButton";
import LogoBackground from "../components/LogoBackground";
import Container from "../components/Container";
import TextFieldWHolder from "../components/TextFieldWHolder";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [errors, setErrors] = useState({
    email: "",
    contrasena: "",
  });
  const [apiError, setApiError] = useState("");
  const navigate = useNavigate();

  const validateForm = () => {
    let valid = true;
    const newErrors = {
      email: "",
      contrasena: "",
    };
    console.log("formulario", { email, contrasena });

    if (!email) {
      newErrors.email = "El correo es requerido";
      valid = false;
    } else if (!email.includes("@")) {
      newErrors.email = "El correo debe contener @";
      valid = false;
    }

    if (!contrasena) {
      newErrors.contrasena = "La contraseña es requerida";
      valid = false;
    }
    // else if (contrasena.length < 8) {
    //   newErrors.contrasena = "La contraseña debe tener mínimo 8 caracteres";
    //   valid = false;
    // }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setApiError("");

    if (!validateForm()) return;

    try {
      const response = await fetch("http://127.0.0.1:8080/api/v1/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, contrasena }),
      });

      if (!response.ok) {
        throw new Error("Email o contraseña incorrectos");
      }

      const data = await response.json();
      localStorage.setItem("token", data.token);
      navigate("/HolaDeNuevo");
    } catch (error: any) {
      console.error("Error al iniciar sesión:", error);
      setApiError(error.message || "Ocurrió un error al iniciar sesión");
    }
  };

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
          <form onSubmit={handleSubmit}>
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
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  hasError={!!errors.contrasena}
                />
                {errors.contrasena && (
                  <p className="text-red-500 text-sm mt-1">{errors.contrasena}</p>
                )}
              </div>
            </Container>

            <GenericButton type="submit" text="Iniciar sesión"/>
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
