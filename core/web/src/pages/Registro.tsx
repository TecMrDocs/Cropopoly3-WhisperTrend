import { useState, FormEvent } from "react";
import WhiteButton from "../components/WhiteButton";
import BlueButton from "../components/BlueButton";
import TextFieldWHolder from "../components/TextFieldWHolder";
import { useNavigate } from "react-router-dom";

export default function Registro() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    position: "",
    password: "",
    confirmPassword: ""
  });

  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    position: "",
    password: "",
    confirmPassword: ""
  });

  const validateForm = () => {
    let valid = true;
    const newErrors = {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      position: "",
      password: "",
      confirmPassword: ""
    };

    // Validate firstName
    if (!formData.firstName.trim()) {
      newErrors.firstName = "El nombre es requerido";
      valid = false;
    }

    // Validate lastName
    if (!formData.lastName.trim()) {
      newErrors.lastName = "El apellido es requerido";
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

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      console.log("Datos válidos:", JSON.stringify(formData, null, 2));
      navigate("/confirmacionCorreo")
      // Aquí iría la lógica para enviar los datos al servidor
    }
  };

  const handleCancel = () => {
    navigate("/Login");
  }

  return(
    <div>
      <div className='flex items-center justify-center'>
        <h1 className="text-center mb-4 text-[#141652] text-2xl font-semibold">Registro de usuario</h1>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className='flex flex-row gap-6 justify-center'>
          <div>
            <TextFieldWHolder 
              label="Nombre(s)" 
              width="300px"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              hasError={!!errors.firstName}
              placeholder="Ingrese su nombre"
            />
            {errors.firstName && (
              <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
            )}
          </div>
          <div>
            <TextFieldWHolder 
              label="Apellido(s)" 
              width="300px"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              hasError={!!errors.lastName}
              placeholder="Ingrese su apellido"
            />
            {errors.lastName && (
              <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
            )}
          </div>
        </div>
        
        <br />
        
        <div className="flex flex-col gap-5 items-center justify-center">
          <div className="w-[600px]">
            <TextFieldWHolder 
              label="Correo electrónico" 
              width="600px"
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
          
          <div className="w-[600px]">
            <TextFieldWHolder 
              label="Número telefónico" 
              width="600px"
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
          
          <div className="w-[600px]">
            <TextFieldWHolder 
              label="Puesto o cargo en la empresa" 
              width="600px"
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
          
          <div className="w-[600px]">
            <TextFieldWHolder 
              label="Contraseña" 
              width="600px"
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
          
          <div className="w-[600px]">
            <TextFieldWHolder 
              label="Confirma tu contraseña" 
              width="600px"
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
          <WhiteButton text="Cancelar" width="300px" onClick={handleCancel}/>
          <BlueButton text="Crear cuenta" width="300px" type="submit" />
        </div>
      </form>
    </div>
  );
}
