// import GenericButton from "../components/GenericButton";
// import LogoBackground from '../components/LogoBackground';
// import Container from '../components/Container';
// import TextFieldWHolder from "../components/TextFieldWHolder";

// export default function Login() {
//   return (
//     <LogoBackground>
//       <div className="flex flex-1 justify-center items-center p-8">
//         <div>
//           <h1 className="text-center mb-4 text-[#141652] text-2xl font-semibold">Bienvenid@</h1>
//           <h2 className="text-center mb-4 text-[#141652] text-xl">Inicia sesión</h2>
          
//           <Container>
//             <div className="mb-4">
//               <label htmlFor="email" className="block mb-2">Correo</label>
//               <TextFieldWHolder placeholder="Ingrese su correo" />
//             </div>
            
//             <div className="mb-4">
//               <label htmlFor="password" className="block mb-2">Contraseña</label>
//               <TextFieldWHolder placeholder="Ingrese su contraseña" />
//             </div>
//           </Container>

//           <GenericButton type="submit" text="Iniciar sesión" />

//           <div className="text-center mt-12 text-sm">
//             <p>No tienes cuenta? <a href="/RegistroU" className="text-[#141652] underline">Regístrate</a></p>
//             <p><a href="/ChangePassword" className="text-[#141652] underline">Olvidé mi contraseña</a></p>
//             <p><a href="/avisoPrivacidad" className="text-[#141652] underline">Aviso de privacidad</a></p>
//           </div>
//         </div>
//       </div>

//       <div className="flex-1 p-8 flex flex-col justify-center text-white max-w-[50%]">
//       </div>
//     </LogoBackground>
//   );
// }


//NUEVOOO

// import { useState } from "react";
// import GenericButton from "../components/GenericButton";
// import LogoBackground from "../components/LogoBackground";
// import Container from "../components/Container";
// import TextFieldWHolder from "../components/TextFieldWHolder";

// export default function Login() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");

//   const handleSubmit = () => {
//     const data = {
//       email,
//       password,
//     };
//     console.log("Login data:", data);
//     //Autenticación 
//   };

//   return (
//     <LogoBackground>
//       <div className="flex flex-1 justify-center items-center p-8">
//         <div>
//           <h1 className="text-center mb-4 text-[#141652] text-2xl font-semibold">Bienvenid@</h1>
//           <h2 className="text-center mb-4 text-[#141652] text-xl">Inicia sesión</h2>

//           <Container>
//             <div className="mb-4">
//               <label htmlFor="email" className="block mb-2">Correo</label>
//               <TextFieldWHolder
//                 name="email"
//                 placeholder="Ingrese su correo"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//               />
//             </div>

//             <div className="mb-4">
//               <label htmlFor="password" className="block mb-2">Contraseña</label>
//               <TextFieldWHolder
//                 name="password"
//                 placeholder="Ingrese su contraseña"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//               />
//             </div>
//           </Container>

//           <GenericButton type="submit" text="Iniciar sesión" onClick={handleSubmit} />

//           <div className="text-center mt-12 text-sm">
//             <p>No tienes cuenta? <a href="/RegistroU" className="text-[#141652] underline">Regístrate</a></p>
//             <p><a href="/ChangePassword" className="text-[#141652] underline">Olvidé mi contraseña</a></p>
//             <p><a href="/avisoPrivacidad" className="text-[#141652] underline">Aviso de privacidad</a></p>
//           </div>
//         </div>
//       </div>

//       <div className="flex-1 p-8 flex flex-col justify-center text-white max-w-[50%]">
//       </div>
//     </LogoBackground>
//   );
// }


// import { useState } from "react";
// import GenericButton from "../components/GenericButton";
// import LogoBackground from "../components/LogoBackground";
// import Container from "../components/Container";
// import TextFieldWHolder from "../components/TextFieldWHolder";

// export default function Login() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     console.log("Login data:", { email, password });
//     // Autenticación
//   };

//   return (
//     <LogoBackground>
//       <div className="flex flex-1 justify-center items-center p-8">
//         <div>
//           <h1 className="text-center mb-4 text-[#141652] text-2xl font-semibold">Bienvenid@</h1>
//           <h2 className="text-center mb-4 text-[#141652] text-xl">Inicia sesión</h2>

//           <form onSubmit={handleSubmit}>
//             <Container>
//               <div className="mb-4">
//                 <label htmlFor="email-input" className="block mb-2">Correo</label>
//                 <TextFieldWHolder
//                   id="email-input"
//                   name="email"
//                   placeholder="Ingrese su correo"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                 />
//               </div>

//               <div className="mb-4">
//                 <label htmlFor="password-input" className="block mb-2">Contraseña</label>
//                 <TextFieldWHolder
//                   id="password-input"
//                   name="password"
//                   placeholder="Ingrese su contraseña"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                 />
//               </div>
//             </Container>

//             <GenericButton type="submit" text="Iniciar sesión" />
//           </form>

//           <div className="text-center mt-12 text-sm">
//             <p>No tienes cuenta? <a href="/RegistroU" className="text-[#141652] underline">Regístrate</a></p>
//             <p><a href="/ChangePassword" className="text-[#141652] underline">Olvidé mi contraseña</a></p>
//             <p><a href="/avisoPrivacidad" className="text-[#141652] underline">Aviso de privacidad</a></p>
//           </div>
//         </div>
//       </div>

//       <div className="flex-1 p-8 flex flex-col justify-center text-white max-w-[50%]">
//       </div>
//     </LogoBackground>
//   );
// }

import { useState, FormEvent } from "react";
import GenericButton from "../components/GenericButton";
import LogoBackground from "../components/LogoBackground";
import Container from "../components/Container";
import TextFieldWHolder from "../components/TextFieldWHolder";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

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
    }
    
    if (!password) {
      newErrors.password = "La contraseña es requerida";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      console.log("Datos válidos:", { email, password });
      // autenticación
    }
  };

  return (
    <LogoBackground>
      <div className="flex flex-1 justify-center items-center p-8">
        <div>
          <h1 className="text-center mb-4 text-[#141652] text-2xl font-semibold">Bienvenid@</h1>
          <h2 className="text-center mb-4 text-[#141652] text-xl">Inicia sesión</h2>

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
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div className="mb-4">
                <label htmlFor="password-input" className="block mb-2">Contraseña</label>
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
            <p>No tienes cuenta? <a href="/RegistroU" className="text-[#141652] underline">Regístrate</a></p>
            <p><a href="/ChangePassword" className="text-[#141652] underline">Olvidé mi contraseña</a></p>
            <p><a href="/avisoPrivacidad" className="text-[#141652] underline">Aviso de privacidad</a></p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-8 flex flex-col justify-center text-white max-w-[50%]">
      </div>
    </LogoBackground>
  );
}