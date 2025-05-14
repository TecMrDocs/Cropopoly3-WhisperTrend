import GenericButton from "../components/GenericButton";
import TextField from '../components/TextField';
import LogoBackground from '../components/LogoBackground';
import Container from '../components/Container';

export default function Login() {


  return (
    <LogoBackground>
    
      <div style={{flex: 1,display: "flex", justifyContent: "center", alignItems: "center", padding: "2rem" }}>
        <div >
          <h1 style={{ textAlign: "center", marginBottom: "1rem", color: "#141652", fontSize: "1.6rem" }}>Bienvenid@</h1>
          <h2 style={{ textAlign: "center", marginBottom: "1rem", color: "#141652", fontSize: "1.2rem" }}>Inicia sesión</h2>
          
          <Container>
            <div style={{ marginBottom: "1rem" }}>
              <label htmlFor="email" style={{ display: "block", marginBottom: "0.5rem" }}>Correo</label>
              <TextField></TextField>
            </div>
            
            <div style={{ marginBottom: "1rem" }}>
              <label htmlFor="password" style={{ display: "block", marginBottom: "0.5rem" }}>Contraseña</label>
              <TextField></TextField>
            </div>
            
          </Container>
          <GenericButton type="submit" text="Iniciar sesión" />
          <div style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.9rem" }}>
            <p>No tienes cuenta? <a href="#" style={{ color: "#141652" ,textDecoration: "underline"}}>Regístrate</a></p>
            <p><a href="#" style={{ color: "#141652" , textDecoration: "underline"}}>Olvidé mi contraseña</a></p>
            <p><a href="#" style={{ color: "#141652" , textDecoration: "underline"}}>Aviso de privacidad</a></p>
          </div>
        </div>
      </div>
      <div style={{flex: 1,padding: "2rem",display: "flex", flexDirection: "column" as const, justifyContent: "center", color: "white",maxWidth: "50%"}}>
      </div>
    </LogoBackground>
    
  );
}