import {Routes, Route} from "react-router-dom";
import LandingLayout from "../layouts/landingLayout";
import MainLayout from "../layouts/mainLayout";
import LaunchLayout from "../layouts/launchLayout";
import ProfileLayout from "../layouts/profileLayout";
import Home from "../pages/Home";
import AcercaDe from "../pages/AcercaDe"
import Dashboard from "../pages/Dashboard"
import EditarProducto from "../pages/EditarProducto";
import EditarDatos from "../pages/EditarDatos";
import Empresa from "../pages/Empresa";
import Perfil from "../pages/Perfil";
import Productos from "../pages/Productos";
import LaunchConfirmacion from "../pages/LaunchConfirmacion";
import LaunchEmpresa from "../pages/LaunchEmpresa";
import LaunchPeriodo from "../pages/LaunchPeriodo";
import LaunchProcess from "../pages/LaunchProcess";
import LaunchProducto from "../pages/LaunchProducto";
import LaunchRegistroVentas from "../pages/LaunchRegistroVentas";
import LaunchVentas from "../pages/LaunchVentas";
import Loading from "../pages/Loading";
import Login from "../pages/Login";
import Resumen from "../pages/Resumen";
import ChangePassword from "../pages/ChangePassword";
import Registro from "../pages/Registro";
import PrivacyNotice from "../pages/PrivacyNotice";
import EmailConfirmation from "../pages/EmailConfirmation";
import ActualizarPlan from "../pages/ActualizarPlan";
import Us from "../pages/Us";
import HolaDeNuevo from "../pages/HolaDeNuevo";
import Protected from "../components/Protected";
import Unprotected from "../components/Unprotected";


export default function WebRouter(){
  const loadLayout = (Layout: any, Page: any) => {
    return(
      <Layout>
        <Page />
      </Layout>
    );
  }

  return(
    <Routes>
      {/* Rutas públicas/no protegidas */}
      <Route path="/" element={<Unprotected>{loadLayout(LandingLayout, Home)}</Unprotected>} />
      <Route path="/nosotros" element={<Unprotected>{loadLayout(LandingLayout, Us)}</Unprotected>} />
      <Route path="/avisoPrivacidad" element={loadLayout(MainLayout, PrivacyNotice)} />
      <Route path="/login" element={<Unprotected>{loadLayout(MainLayout, Login)}</Unprotected>} />
      <Route path="/RegistroU" element={<Unprotected>{loadLayout(MainLayout, Registro)}</Unprotected>} />
      <Route path="/confirmacionCorreo" element={loadLayout(MainLayout, EmailConfirmation)} />
      <Route path="/holaDeNuevo" element={loadLayout(MainLayout, HolaDeNuevo)} />
      <Route path="/changePassword" element={loadLayout(MainLayout, ChangePassword)} />
      <Route path="/actualizarPlan" element={loadLayout(MainLayout, ActualizarPlan)} />
      <Route path="/resumen" element={loadLayout(MainLayout, Resumen)} />
      
      {/* Rutas protegidas - requieren autenticación */}
      <Route path="/dashboard" element={<Protected>{loadLayout(ProfileLayout, Dashboard)}</Protected>} />
      <Route path="/acercaDe" element={<Protected>{loadLayout(ProfileLayout, AcercaDe)}</Protected>} />
      <Route path="/editarProducto" element={<Protected>{loadLayout(ProfileLayout, EditarProducto)}</Protected>} />
      <Route path="/editarDatos" element={<Protected>{loadLayout(ProfileLayout, EditarDatos)}</Protected>} />
      <Route path="/empresa" element={<Protected>{loadLayout(ProfileLayout, Empresa)}</Protected>} />
      <Route path="/perfil" element={<Protected>{loadLayout(ProfileLayout, Perfil)}</Protected>} />
      <Route path="/productos" element={<Protected>{loadLayout(ProfileLayout, Productos)}</Protected>} />
      
      {/* Rutas del proceso de lanzamiento - protegidas */}
      <Route path="/launchConfirmacion" element={<Protected>{loadLayout(LaunchLayout, LaunchConfirmacion)}</Protected>} />
      <Route path="/launchEmpresa" element={<Protected>{loadLayout(LaunchLayout, LaunchEmpresa)}</Protected>} />
      <Route path="/launchPeriodo" element={<Protected>{loadLayout(LaunchLayout, LaunchPeriodo)}</Protected>} />
      <Route path="/launchProcess" element={<Protected>{loadLayout(LaunchLayout, LaunchProcess)}</Protected>} />
      <Route path="/launchProducto" element={<Protected>{loadLayout(LaunchLayout, LaunchProducto)}</Protected>} />
      <Route path="/launchRegistroVentas" element={<Protected>{loadLayout(LaunchLayout, LaunchRegistroVentas)}</Protected>} />
      <Route path="/launchVentas" element={<Protected>{loadLayout(LaunchLayout, LaunchVentas)}</Protected>} />
      <Route path="/loading" element={<Protected>{loadLayout(LaunchLayout, Loading)}</Protected>} />
    </Routes>
  );
}
