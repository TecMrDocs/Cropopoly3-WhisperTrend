/**
 * Componente: Registro
 * 
 * Descripción:
 * Este componente maneja el formulario de registro de un nuevo usuario,
 * validando los datos ingresados como nombre, correo, teléfono, puesto y contraseña.
 * También verifica los criterios de seguridad de la contraseña antes de enviar
 * los datos a la API para su registro.
 * 
 * Autor: Mariana Balderrábano Aguilar
 * Contribuyentes: Sebastián Antonio Almanza, Carlos Alberto Zamudio Velázquez
 *
 */

import { useState, FormEvent } from "react";
import WhiteButton from "../components/WhiteButton";
import BlueButton from "../components/BlueButton";
import TextFieldWHolder from "../components/TextFieldWHolder";
import { useNavigate } from "react-router-dom";
import user, { User } from "../utils/api/user";

export default function Registro() {
  const navigate = useNavigate();

  /**
   * Estado para almacenar los valores del formulario.
   */
  const [formData, setFormData] = useState({
    name: "",
    last_name: "",
    email: "",
    phone: "",
    position: "",
    password: "",
    confirmPassword: "",
    plan: "tracker",
    business_name: "test",
    industry: "test",
    company_size: "1234",
    scope: "internacional",
    locations: "test",
    num_branches: "1234"
  });

  /**
   * Estado para almacenar errores de validación del formulario.
   */
  const [errors, setErrors] = useState({
    name: "",
    last_name: "",
    email: "",
    phone: "",
    position: "",
    password: "",
    confirmPassword: ""
  });

  /**
   * Estado para controlar si se cumple cada criterio de contraseña segura.
   */
  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false,
  });

  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  /**
   * Valida los datos del formulario.
   * @returns {boolean} true si es válido, false si hay errores.
   */
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

    if (!formData.name.trim()) {
      newErrors.name = "El nombre es requerido";
      valid = false;
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(formData.name)) {
      newErrors.name = "El nombre solo puede contener letras y espacios";
      valid = false;
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = "El apellido es requerido";
      valid = false;
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(formData.last_name)) {
      newErrors.last_name = "El apellido solo puede contener letras y espacios";
      valid = false;
    }

    if (!formData.email) {
      newErrors.email = "El correo es requerido";
      valid = false;
    } else if (!formData.email.includes("@")) {
      newErrors.email = "El correo debe contener @";
      valid = false;
    } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+(\.[a-zA-Z]{2,})+$/.test(formData.email)) {
      newErrors.email = "El correo no tiene un formato válido";
      valid = false;
    }

    if (!formData.phone) {
      newErrors.phone = "El número telefónico es requerido";
      valid = false;
    } else if (!/^\d+$/.test(formData.phone)) {
      newErrors.phone = "El número telefónico debe contener solo dígitos";
      valid = false;
    }

    if (!formData.position.trim()) {
      newErrors.position = "El puesto o cargo es requerido";
      valid = false;
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(formData.position)) {
      newErrors.position = "El puesto o cargo solo puede contener letras y espacios";
      valid = false;
    }

    if (!formData.password) {
      newErrors.password = "La contraseña es requerida";
      valid = false;
    } else if (!(passwordCriteria.length && passwordCriteria.uppercase && passwordCriteria.lowercase && passwordCriteria.number && passwordCriteria.specialChar)) {
      newErrors.password = "Debe cumplir con todos los requisitos";
      valid = false;
    }

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

  /**
   * Maneja el cambio del campo contraseña y evalúa los criterios de seguridad.
   * @param e Evento de cambio del input
   */
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, password: value }));
    setPasswordCriteria({
      length: value.length >= 8,
      uppercase: /[A-Z]/.test(value),
      lowercase: /[a-z]/.test(value),
      number: /\d/.test(value),
      specialChar: /[@$!%*?&]/.test(value),
    });
  };

  /**
   * Maneja el cambio general de los campos del formulario.
   * @param e Evento de cambio del input
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  /**
   * Envía el formulario si es válido y maneja la respuesta de la API.
   * @param e Evento del envío del formulario
   */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setApiError("");

    if (validateForm()) {
      setLoading(true);
      const dataToSend: User = {
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

      try {
        await user.user.register(dataToSend);
        navigate("/confirmacionCorreo");
      } catch (error: any) {
        console.error("Error al registrar el usuario:", error);
        if (error.response) {
          const { status, data } = error.response;
          if (status === 400) {
            setApiError(data.message || "Datos de registro inválidos");
          } else if (status === 409) {
            setApiError(data.message || "El usuario ya existe");
          } else {
            setApiError(data.message || "Error al registrar el usuario");
          }
        } else if (error.message?.includes("Failed to fetch")) {
          setApiError("No se puede conectar con el servidor");
        } else {
          setApiError("Error inesperado");
        }
      } finally {
        setLoading(false);
      }
    }
  };

  /**
   * Cancela el registro y redirige al login.
   */
  const handleCancel = () => {
    navigate("/Login");
  };

  /**
   * Renderiza el formulario de registro de usuario con todos sus campos y validaciones.
   * @return {JSX.Element} Contenido visual del formulario con validación y envío.
   */
  return (
    <div className="p-7">
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
            <label htmlFor="name-field" className="block text-md text-gray-700 font-bold mb-1">
              Nombre(s):
            </label>
            <TextFieldWHolder
              id="name-field"

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
            <label htmlFor="name-field" className="block text-md text-gray-700 font-bold mb-1">
              Apellido(s):
            </label>
            <TextFieldWHolder
              id="last-name-field"

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

        <div className="flex flex-col gap-5 items-center justify-center max-w-3xl mx-auto w-full">
          <div className="w-full">
            <label htmlFor="name-field" className="block text-md text-gray-700 font-bold mb-1">
              Correo electrónico:
            </label>
            <TextFieldWHolder
              id="email-field"

              width="100%"
              name="email"
              value={formData.email}
              onChange={handleChange}
              hasError={!!errors.email}
              placeholder="Ingrese su correo electrónico ej. test@gmail.com"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div className="w-full">
            <label htmlFor="name-field" className="block text-md text-gray-700 font-bold mb-1">
              Número telefónico:
            </label>
            <TextFieldWHolder
              id="phone-field"

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
            <label htmlFor="name-field" className="block text-md text-gray-700 font-bold mb-1">
              Puesto o cargo en la empresa:
            </label>
            <TextFieldWHolder
              id="position-field"

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
            <label htmlFor="name-field" className="block text-md text-gray-700 font-bold mb-1">
              Contraseña:
            </label>
            <TextFieldWHolder
              id="password-field"

              width="100%"
              type="password"
              name="password"
              value={formData.password}
              onChange={handlePasswordChange}
              hasError={!!errors.password}
              placeholder="Ingrese su contraseña"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
            <div className="text-sm text-gray-600 mt-2">
              <p className={passwordCriteria.length ? "text-green-500" : "text-red-500"}>✓ Mínimo 8 caracteres</p>
              <p className={passwordCriteria.uppercase ? "text-green-500" : "text-red-500"}>✓ Al menos una mayúscula</p>
              <p className={passwordCriteria.lowercase ? "text-green-500" : "text-red-500"}>✓ Al menos una minúscula</p>
              <p className={passwordCriteria.number ? "text-green-500" : "text-red-500"}>✓ Al menos un número</p>
              <p className={passwordCriteria.specialChar ? "text-green-500" : "text-red-500"}>✓ Al menos un carácter especial (@$!%*?&)</p>
            </div>

          </div>

          <div className="w-full">
            <label htmlFor="name-field" className="block text-md text-gray-700 font-bold mb-1">
              Confirma tu contraseña:
            </label>
            <TextFieldWHolder
              id="confirm-password-field"

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

        <div className="max-w-3xl mx-auto w-full pt-7">
          <div className="grid grid-cols-2justify-center gap-5 w-full">
            <WhiteButton
              text="Cancelar"
              width="100%"
              onClick={handleCancel}
            />
            <BlueButton
              text={loading ? "Registrando..." : "Crear cuenta"}
              width="100%"
              type="submit"
            />
          </div>
        </div>
      </form>
    </div>
  );
}