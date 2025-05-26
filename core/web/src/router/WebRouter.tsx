import {Routes, Route} from "react-router-dom";
import LandingLayout from "../layouts/landingLayout";
import MainLayout from "../layouts/mainLayout";
import LaunchLayout from "../layouts/launchLayout";
import ProfileLayout from "../layouts/profileLayout";
import Protected from "../components/Protected";
import Unprotected from "../components/Unprotected";
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


export default function WebRouter(){
  const loadLayout = (Layout: any, Page: any) => {
    return(
      <Layout>
        <Page />
      </Layout>
    );
  }

  const loadProtectedLayout = (Layout: any, Page: any) => {
    return (
      <Protected>
        <Layout>
          <Page />
        </Layout>
      </Protected>
    );
  }

  const loadUnprotectedLayout = (Layout: any, Page: any) => {
    return (
      <Unprotected>
        <Layout>
          <Page />
        </Layout>
      </Unprotected>
    );
  }

  return(
    <Routes>
      <Route path="/" element={loadLayout(LandingLayout, Home)} />
      <Route path="/nosotros" element={loadLayout(LandingLayout, Us)} />
      <Route path="/avisoPrivacidad" element={loadLayout(MainLayout, PrivacyNotice)} />
      <Route path="/login" element={loadUnprotectedLayout(MainLayout, Login)} />
      <Route path="/RegistroU" element={loadUnprotectedLayout(MainLayout, Registro)} />
      <Route path="/confirmacionCorreo" element={loadUnprotectedLayout(MainLayout, EmailConfirmation)} />
      <Route path="/holaDeNuevo" element={loadUnprotectedLayout(MainLayout, HolaDeNuevo)} />
      <Route path="/dashboard" element={loadProtectedLayout(ProfileLayout, Dashboard)} />
      <Route path="/acercaDe" element={loadProtectedLayout(ProfileLayout, AcercaDe)} />
      <Route path="/actualizarPlan" element={loadProtectedLayout(MainLayout, ActualizarPlan)} />
      <Route path="/editarProducto" element={loadProtectedLayout(ProfileLayout, EditarProducto)} />
      <Route path="/editarDatos" element={loadProtectedLayout(ProfileLayout, EditarDatos)} />
      <Route path="/empresa" element={loadProtectedLayout(ProfileLayout, Empresa)} />
      <Route path="/perfil" element={loadProtectedLayout(ProfileLayout, Perfil)} />
      <Route path="/productos" element={loadProtectedLayout(ProfileLayout, Productos)} />
      <Route path="/changePassword" element={loadProtectedLayout(MainLayout, ChangePassword)} />
      <Route path="/launchConfirmacion" element={loadProtectedLayout(LaunchLayout, LaunchConfirmacion)} />
      <Route path="/launchEmpresa" element={loadProtectedLayout(LaunchLayout, LaunchEmpresa)} />
      <Route path="/launchPeriodo" element={loadProtectedLayout(LaunchLayout, LaunchPeriodo)} />
      <Route path="/launchProcess" element={loadProtectedLayout(LaunchLayout, LaunchProcess)} />
      <Route path="/launchProducto" element={loadProtectedLayout(LaunchLayout, LaunchProducto)} />
      <Route path="/launchRegistroVentas" element={loadProtectedLayout(LaunchLayout, LaunchRegistroVentas)} />
      <Route path="/launchVentas" element={loadProtectedLayout(LaunchLayout, LaunchVentas)} />
      <Route path="/loading" element={loadProtectedLayout(LaunchLayout, Loading)} />
      <Route path="/resumen" element={loadProtectedLayout(MainLayout, Resumen)} />
    </Routes>
  );
}
