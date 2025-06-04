import { useState, FormEvent } from "react";
import WhiteButton from "../components/WhiteButton";
import BlueButton from "../components/BlueButton";
import TextFieldWHolder from "../components/TextFieldWHolder";
import { useNavigate } from "react-router-dom";

export default function Registro() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    last_name: "",
    email: "",
    phone: "",
    position: "",
    password: "",
    confirmPassword: "",
    // Valores por defecto para campos de empresa y plan
    plan: "tracker",
    business_name: "test",
    industry: "test",
    company_size: "1234",
    scope: "internacional",
    locations: "test",
    num_branches: "1234"
  });

  const [errors, setErrors] = useState({
    name: "",
    last_name: "",
    email: "",
    phone: "",
    position: "",
    password: "",
    confirmPassword: ""
  });

  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const validateForm = () => {
    let valid = true;
    const newErrors = {
      name: "",
      last_name: "",
      email: "",
      phone: "",
      position: "",
      password: "",
      confirmPassword: ""
    };

    // Validate firstName
    if (!formData.name.trim()) {
      newErrors.name = "El nombre es requerido";
      valid = false;
    }

    // Validate lastName
    if (!formData.last_name.trim()) {
      newErrors.last_name = "El apellido es requerido";
      valid = false;
    }

    // Validate email
    if (!formData.email) {
      newErrors.email = "El correo es requerido";
      valid = false;
    } else if (!formData.email.includes("@")) {
      newErrors.email = "El correo debe contener @";
      valid = false;
    }

    // Validate phone
    if (!formData.phone) {
      newErrors.phone = "El número telefónico es requerido";
      valid = false;
    } else if (!/^\d+$/.test(formData.phone)) {
      newErrors.phone = "El número telefónico debe contener solo dígitos";
      valid = false;
    }

    // Validate position
    if (!formData.position.trim()) {
      newErrors.position = "El puesto o cargo es requerido";
      valid = false;
    }

    // Validate password
    if (!formData.password) {
      newErrors.password = "La contraseña es requerida";
      valid = false;
    } else if (formData.password.length < 8) {
      newErrors.password = "La contraseña debe tener al menos 8 caracteres";
      valid = false;
    }

    // Validate confirmPassword
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Por favor confirma tu contraseña";
      valid = false;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setApiError("");

    if (validateForm()) {
      const dataToSend = {
        email: formData.email,
        name: formData.name,
        last_name: formData.last_name,
        phone: formData.phone,
        position: formData.position,
        password: formData.password,
        plan: formData.plan,
        business_name: formData.business_name,
        industry: formData.industry,
        company_size: formData.company_size,
        scope: formData.scope,
        locations: formData.locations,
        num_branches: formData.num_branches
      };

      console.log("Datos válidos:", JSON.stringify(dataToSend, null, 2));
      console.log("Enviando datos a la API...");
      try {
        

        const response = await fetch("http://localhost:8080/api/v1/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(dataToSend)
        });

        console.log("Respuesta de la API:", response);
        // Primero intentamos leer la respuesta como texto
        const responseText = await response.text();

        let data;
        try {
          // Luego intentamos parsear a JSON
          data = responseText ? JSON.parse(responseText) : {};
        } catch (parseError) {
          console.warn("La respuesta no es JSON válido:", responseText);
          // Si el status es OK pero no es JSON válido, consideramos éxito
          if (response.ok) {
            console.log("Registro exitoso (respuesta no JSON)");
            return navigate("/confirmacionCorreo");
          }
          throw new Error("Respuesta del servidor no válida");
        }

        // Manejo de respuestas exitosas
        if (response.ok) {
          console.log("Registro exitoso:", data);
          return navigate("/confirmacionCorreo");
        }

        // Manejo de errores específicos
        if (response.status === 400) {
          setApiError(data.message || "Datos de registro inválidos");
        } else if (response.status === 409) {
          setApiError(data.message || "El usuario ya existe");
        } else {
          setApiError(data.message || `Error en el registro (${response.status})`);
        }

      } catch (error: any) {
        console.error("Error en el registro:", error);
        // Si hay error de red pero el registro pudo haberse completado
        if (error.message.includes("Failed to fetch")) {
          setApiError("No se pudo verificar la respuesta del servidor. El registro pudo haberse completado.");
        } else {
          setApiError("Ocurrió un error inesperado. Verifique si el registro se completó.");
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCancel = () => {
    navigate("/Login");
  }

  return (
    <div>
      <div className='flex items-center justify-center'>
        <h1 className="text-center mb-4 text-[#141652] text-2xl font-semibold">Registro de usuario</h1>
      </div>

      {apiError && (
        <div className="flex justify-center mb-4">
          <p className="text-red-500 text-sm">{apiError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className='flex flex-row gap-6 justify-center max-w-3xl mx-auto w-full'>
          <div className="w-full">
            <TextFieldWHolder
              label="Nombre(s)"
              width="100%"
              name="name"
              value={formData.name}
              onChange={handleChange}
              hasError={!!errors.name}
              placeholder="Ingrese su nombre"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>
          <div className="w-full">
            <TextFieldWHolder
              label="Apellido(s)"
              width="100%"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              hasError={!!errors.last_name}
              placeholder="Ingrese su apellido"
            />
            {errors.last_name && (
              <p className="text-red-500 text-sm mt-1">{errors.last_name}</p>
            )}
          </div>
        </div>

        <br />

        <div className="flex flex-col gap-5 items-center justify-center max-w-2xl mx-auto w-full">
          <div className="w-full">
            <TextFieldWHolder
              label="Correo electrónico"
              width="100%"
              name="email"
              value={formData.email}
              onChange={handleChange}
              hasError={!!errors.email}
              placeholder="Ingrese su correo electrónico"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div className="w-full">
            <TextFieldWHolder
              label="Número telefónico"
              width="100%"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              hasError={!!errors.phone}
              placeholder="Ingrese su número telefónico"
            />
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
            )}
          </div>

          <div className="w-full">
            <TextFieldWHolder
              label="Puesto o cargo en la empresa"
              width="100%"
              name="position"
              value={formData.position}
              onChange={handleChange}
              hasError={!!errors.position}
              placeholder="Ingrese su puesto o cargo"
            />
            {errors.position && (
              <p className="text-red-500 text-sm mt-1">{errors.position}</p>
            )}
          </div>

          <div className="w-full">
            <TextFieldWHolder
              label="Contraseña"
              width="100%"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              hasError={!!errors.password}
              placeholder="Ingrese su contraseña"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          <div className="w-full">
            <TextFieldWHolder
              label="Confirma tu contraseña"
              width="100%"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              hasError={!!errors.confirmPassword}
              placeholder="Confirme su contraseña"
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1 break-words">{errors.confirmPassword}</p>
            )}
          </div>
        </div>

        <br />

        <div className="flex flex-row justify-center gap-10">
          <WhiteButton
            text="Cancelar"
            width="300px"
            onClick={handleCancel}
          />
          <BlueButton
            text={loading ? "Registrando..." : "Crear cuenta"}
            width="300px"
            type="submit"
          />
        </div>
      </form>
    </div>
  );
}