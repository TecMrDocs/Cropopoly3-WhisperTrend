// import WhiteButton from "../components/WhiteButton";
// import BlueButton from "../components/BlueButton";
// import TextField from "../components/TextField";

// export default function Registro() {
//   return(
//     <div>
//       <div className='flex items-center justify-center'>
//         <h1 className="text-center mb-4 text-[#141652] text-2xl font-semibold">Registro de usuario</h1>
//       </div>
//       <br></br>
//       <div className='flex flex-row gap-6 justify-center'>
//          <TextField label="Nombre(s)" width="300px" /> 
//          <TextField label="Apellido(s)" width="300px" />
//       </div>
//       <br></br>
//       <div className="flex flex-col gap-5 items-center justify-center">
//         <TextField label="Correo electrónico" width="600px" />
//         <TextField label="Número telefónico" width="600px" />
//         <TextField label="Puesto o cargo en la empresa" width="600px" />
//         <TextField label="Contraseña" width="600px" />
//         <TextField label="Confirma tu contraseña" width="600px" />
//       </div>

//       <div className="flex flex-row justify-center gap-10">
//         <WhiteButton text="Cancelar" width="300px" />
//         <BlueButton text="Crear cuenta" width="300px" />
//       </div>
      
//     </div>
//   );
// }


//NO

// import { useState, FormEvent } from "react";
// import WhiteButton from "../components/WhiteButton";
// import BlueButton from "../components/BlueButton";
// import TextField from "../components/TextField";

// export default function Registro() {
//   const [formData, setFormData] = useState({
//     firstName: "",
//     lastName: "",
//     email: "",
//     phone: "",
//     position: "",
//     password: "",
//     confirmPassword: ""
//   });

//   const [errors, setErrors] = useState({
//     firstName: "",
//     lastName: "",
//     email: "",
//     phone: "",
//     position: "",
//     password: "",
//     confirmPassword: ""
//   });

//   const validateForm = () => {
//     let valid = true;
//     const newErrors = {
//       firstName: "",
//       lastName: "",
//       email: "",
//       phone: "",
//       position: "",
//       password: "",
//       confirmPassword: ""
//     };

//     // Validate firstName
//     if (!formData.firstName.trim()) {
//       newErrors.firstName = "El nombre es requerido";
//       valid = false;
//     }

//     // Validate lastName
//     if (!formData.lastName.trim()) {
//       newErrors.lastName = "El apellido es requerido";
//       valid = false;
//     }

//     // Validate email
//     if (!formData.email) {
//       newErrors.email = "El correo es requerido";
//       valid = false;
//     } else if (!formData.email.includes("@")) {
//       newErrors.email = "El correo debe contener @";
//       valid = false;
//     }

//     // Validate phone
//     if (!formData.phone) {
//       newErrors.phone = "El número telefónico es requerido";
//       valid = false;
//     } else if (!/^\d+$/.test(formData.phone)) {
//       newErrors.phone = "El número telefónico debe contener solo dígitos";
//       valid = false;
//     }

//     // Validate position
//     if (!formData.position.trim()) {
//       newErrors.position = "El puesto o cargo es requerido";
//       valid = false;
//     }

//     // Validate password
//     if (!formData.password) {
//       newErrors.password = "La contraseña es requerida";
//       valid = false;
//     } else if (formData.password.length < 8) {
//       newErrors.password = "La contraseña debe tener al menos 8 caracteres";
//       valid = false;
//     }

//     // Validate confirmPassword
//     if (!formData.confirmPassword) {
//       newErrors.confirmPassword = "Por favor confirma tu contraseña";
//       valid = false;
//     } else if (formData.password !== formData.confirmPassword) {
//       newErrors.confirmPassword = "Las contraseñas no coinciden";
//       valid = false;
//     }

//     setErrors(newErrors);
//     return valid;
//   };

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   const handleSubmit = (e: FormEvent) => {
//     e.preventDefault();
//     if (validateForm()) {
//       console.log("Datos válidos:", JSON.stringify(formData, null, 2));
//       // Aquí iría la lógica para enviar los datos al servidor
//     }
//   };

//   return(
//     <div>
//       <div className='flex items-center justify-center'>
//         <h1 className="text-center mb-4 text-[#141652] text-2xl font-semibold">Registro de usuario</h1>
//       </div>
      
//       <form onSubmit={handleSubmit}>
//         <div className='flex flex-row gap-6 justify-center'>
//           <div>
//             <TextField 
//               label="Nombre(s)" 
//               width="300px"
//               name="firstName"
//               value={formData.firstName}
//               onChange={handleChange}
//               hasError={!!errors.firstName}
//             />
//             {errors.firstName && (
//               <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
//             )}
//           </div>
//           <div>
//             <TextField 
//               label="Apellido(s)" 
//               width="300px"
//               name="lastName"
//               value={formData.lastName}
//               onChange={handleChange}
//               hasError={!!errors.lastName}
//             />
//             {errors.lastName && (
//               <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
//             )}
//           </div>
//         </div>
        
//         <br />
        
//         <div className="flex flex-col gap-5 items-center justify-center">
//           <div className="w-[600px]">
//             <TextField 
//               label="Correo electrónico" 
//               width="600px"
//               name="email"
//               value={formData.email}
//               onChange={handleChange}
//               hasError={!!errors.email}
//             />
//             {errors.email && (
//               <p className="text-red-500 text-sm mt-1">{errors.email}</p>
//             )}
//           </div>
          
//           <div className="w-[600px]">
//             <TextField 
//               label="Número telefónico" 
//               width="600px"
//               name="phone"
//               value={formData.phone}
//               onChange={handleChange}
//               hasError={!!errors.phone}
//             />
//             {errors.phone && (
//               <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
//             )}
//           </div>
          
//           <div className="w-[600px]">
//             <TextField 
//               label="Puesto o cargo en la empresa" 
//               width="600px"
//               name="position"
//               value={formData.position}
//               onChange={handleChange}
//               hasError={!!errors.position}
//             />
//             {errors.position && (
//               <p className="text-red-500 text-sm mt-1">{errors.position}</p>
//             )}
//           </div>
          
//           <div className="w-[600px]">
//             <TextField 
//               label="Contraseña" 
//               width="600px"
//               type="password"
//               name="password"
//               value={formData.password}
//               onChange={handleChange}
//               hasError={!!errors.password}
//             />
//             {errors.password && (
//               <p className="text-red-500 text-sm mt-1">{errors.password}</p>
//             )}
//           </div>
          
//           <div className="w-[600px]">
//             <TextField 
//               label="Confirma tu contraseña" 
//               width="600px"
//               type="password"
//               name="confirmPassword"
//               value={formData.confirmPassword}
//               onChange={handleChange}
//               hasError={!!errors.confirmPassword}
//             />
//             {errors.confirmPassword && (
//               <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
//             )}
//           </div>
//         </div>

//         <br />

//         <div className="flex flex-row justify-center gap-10">
//           <WhiteButton type="button" text="Cancelar" width="300px" />
//           <BlueButton type="submit" text="Crear cuenta" width="300px" />
//         </div>
//       </form>
//     </div>
//   );
// }

// import { useState, FormEvent } from "react";
// import WhiteButton from "../components/WhiteButton";
// import BlueButton from "../components/BlueButton";
// import TextFieldWHolder from "../components/TextFieldWHolder";

// export default function Registro() {
//   const [formData, setFormData] = useState({
//     firstName: "",
//     lastName: "",
//     email: "",
//     phone: "",
//     position: "",
//     password: "",
//     confirmPassword: ""
//   });

//   const [errors, setErrors] = useState({
//     firstName: "",
//     lastName: "",
//     email: "",
//     phone: "",
//     position: "",
//     password: "",
//     confirmPassword: ""
//   });

//   const validateForm = () => {
//     let valid = true;
//     const newErrors = {
//       firstName: "",
//       lastName: "",
//       email: "",
//       phone: "",
//       position: "",
//       password: "",
//       confirmPassword: ""
//     };

//     // Validate firstName
//     if (!formData.firstName.trim()) {
//       newErrors.firstName = "El nombre es requerido";
//       valid = false;
//     }

//     // Validate lastName
//     if (!formData.lastName.trim()) {
//       newErrors.lastName = "El apellido es requerido";
//       valid = false;
//     }

//     // Validate email
//     if (!formData.email) {
//       newErrors.email = "El correo es requerido";
//       valid = false;
//     } else if (!formData.email.includes("@")) {
//       newErrors.email = "El correo debe contener @";
//       valid = false;
//     }

//     // Validate phone
//     if (!formData.phone) {
//       newErrors.phone = "El número telefónico es requerido";
//       valid = false;
//     } else if (!/^\d+$/.test(formData.phone)) {
//       newErrors.phone = "El número telefónico debe contener solo dígitos";
//       valid = false;
//     }

//     // Validate position
//     if (!formData.position.trim()) {
//       newErrors.position = "El puesto o cargo es requerido";
//       valid = false;
//     }

//     // Validate password
//     if (!formData.password) {
//       newErrors.password = "La contraseña es requerida";
//       valid = false;
//     } else if (formData.password.length < 8) {
//       newErrors.password = "La contraseña debe tener al menos 8 caracteres";
//       valid = false;
//     }

//     // Validate confirmPassword
//     if (!formData.confirmPassword) {
//       newErrors.confirmPassword = "Por favor confirma tu contraseña";
//       valid = false;
//     } else if (formData.password !== formData.confirmPassword) {
//       newErrors.confirmPassword = "Las contraseñas no coinciden";
//       valid = false;
//     }

//     setErrors(newErrors);
//     return valid;
//   };

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   const handleSubmit = (e: FormEvent) => {
//     e.preventDefault();
//     if (validateForm()) {
//       console.log("Datos válidos:", JSON.stringify(formData, null, 2));
//       // Aquí iría la lógica para enviar los datos al servidor
//     }
//   };

//   return(
//     <div>
//       <div className='flex items-center justify-center'>
//         <h1 className="text-center mb-4 text-[#141652] text-2xl font-semibold">Registro de usuario</h1>
//       </div>
      
//       <form onSubmit={handleSubmit}>
//         <div className='flex flex-row gap-6 justify-center'>
//           <div>
//             <TextFieldWHolder 
//               label="Nombre(s)" 
//               width="300px"
//               name="firstName"
//               value={formData.firstName}
//               onChange={handleChange}
//               hasError={!!errors.firstName}
//               placeholder="Ingrese su nombre"
//             />
//             {errors.firstName && (
//               <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
//             )}
//           </div>
//           <div>
//             <TextFieldWHolder 
//               label="Apellido(s)" 
//               width="300px"
//               name="lastName"
//               value={formData.lastName}
//               onChange={handleChange}
//               hasError={!!errors.lastName}
//               placeholder="Ingrese su apellido"
//             />
//             {errors.lastName && (
//               <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
//             )}
//           </div>
//         </div>
        
//         <br />
        
//         <div className="flex flex-col gap-5 items-center justify-center">
//           <div className="w-[600px]">
//             <TextFieldWHolder 
//               label="Correo electrónico" 
//               width="600px"
//               name="email"
//               value={formData.email}
//               onChange={handleChange}
//               hasError={!!errors.email}
//               placeholder="Ingrese su correo electrónico"
//             />
//             {errors.email && (
//               <p className="text-red-500 text-sm mt-1">{errors.email}</p>
//             )}
//           </div>
          
//           <div className="w-[600px]">
//             <TextFieldWHolder 
//               label="Número telefónico" 
//               width="600px"
//               name="phone"
//               value={formData.phone}
//               onChange={handleChange}
//               hasError={!!errors.phone}
//               placeholder="Ingrese su número telefónico"
//             />
//             {errors.phone && (
//               <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
//             )}
//           </div>
          
//           <div className="w-[600px]">
//             <TextFieldWHolder 
//               label="Puesto o cargo en la empresa" 
//               width="600px"
//               name="position"
//               value={formData.position}
//               onChange={handleChange}
//               hasError={!!errors.position}
//               placeholder="Ingrese su puesto o cargo"
//             />
//             {errors.position && (
//               <p className="text-red-500 text-sm mt-1">{errors.position}</p>
//             )}
//           </div>
          
//           <div className="w-[600px]">
//             <TextFieldWHolder 
//               label="Contraseña" 
//               width="600px"
//               type="password"
//               name="password"
//               value={formData.password}
//               onChange={handleChange}
//               hasError={!!errors.password}
//               placeholder="Ingrese su contraseña"
//             />
//             {errors.password && (
//               <p className="text-red-500 text-sm mt-1">{errors.password}</p>
//             )}
//           </div>
          
//           <div className="w-[600px]">
//             <TextFieldWHolder 
//               label="Confirma tu contraseña" 
//               width="600px"
//               type="password"
//               name="confirmPassword"
//               value={formData.confirmPassword}
//               onChange={handleChange}
//               hasError={!!errors.confirmPassword}
//               placeholder="Confirme su contraseña"
//             />
//             {errors.confirmPassword && (
//               <p className="text-red-500 text-sm mt-1 break-words">{errors.confirmPassword}</p>
//             )}
//           </div>
//         </div>

//         <br />

//         <div className="flex flex-row justify-center gap-10">
//           <WhiteButton text="Cancelar" width="300px" />
//           <BlueButton text="Crear cuenta" width="300px" />
//         </div>
//       </form>
//     </div>
//   );
// }
import { useState, FormEvent } from "react";
import WhiteButton from "../components/WhiteButton";
import TextFieldWHolder from "../components/TextFieldWHolder";
import { useNavigate } from "react-router-dom";
// import GenericButton from "../components/GenericButton";
import BlueButton from "../components/BlueButton";

// Definir constantes para configuración
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8080";

// Definir interfaces para el tipado
interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  password: string;
  confirmPassword: string;
}

export default function Registro() {
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    position: "",
    password: "",
    confirmPassword: ""
  });

  const [errors, setErrors] = useState<FormErrors>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    position: "",
    password: "",
    confirmPassword: ""
  });

  const [apiError, setApiError] = useState("");
  const navigate = useNavigate();

  const validateForm = (): boolean => {
    let valid = true;
    const newErrors: FormErrors = {
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

    // Validate email - Mejora de la validación de email
    if (!formData.email) {
      newErrors.email = "El correo es requerido";
      valid = false;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = "Ingrese un correo electrónico válido";
        valid = false;
      }
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

  const handleCancel = () => {
    navigate("/Login");
  };

  // const handleCreateAccount = () => {
  //   navigate("/confirmaCorreo")
  // };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setApiError("");

    if (!validateForm()) return;

    try {
      const requestBody = {
        email: formData.email,
        nombres: formData.firstName,
        apellidos: formData.lastName,
        telefono: formData.phone,
        puesto: formData.position,
        contrasena: formData.password,
        plan: null,
        razon_social: null,
        sector: null,
        tamano_empresa: null,
        alcance: null,
        localidades: null,
        num_sucursales: null
      };

      const response = await fetch(`${API_URL}/api/v1/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error("Error en el registro. Por favor, inténtelo de nuevo más tarde.");
      }

      console.log("Registro exitoso", response);
      console.log("json", requestBody);
      navigate("/confirmaCorreo");

      const data = await response.json();
      // Usar sessionStorage en lugar de localStorage para mayor seguridad
      sessionStorage.setItem("token", data.token);
      navigate("/HolaDeNuevo");
    } catch (error: unknown) {
      console.error("Error en el registro:", error);
      setApiError(error instanceof Error ? error.message : "Ocurrió un error durante el registro");
    }
  };

  return(
    <div>
      <div className='flex items-center justify-center'>
        <h1 className="text-center mb-4 text-[#141652] text-2xl font-semibold">Registro de usuario</h1>
      </div>
      
      {apiError && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded text-center">
          {apiError}
        </div>
      )}

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
          <WhiteButton 
            text="Cancelar" 
            width="300px" 
            onClick={handleCancel}
          />
          {/* <GenericButton
            text="Crear cuenta" 
            width="50px" 
            type="submit"
          /> */}
          <BlueButton
            text="Crear cuenta" 
            width="300px" 
            type="submit"
          />
        </div>
      </form>
    </div>
  );
}
