import {Routes, Route} from "react-router-dom";
import LandingLayout from "../layouts/landingLayout";
import MainLayout from "../layouts/mainLayout";
import LaunchLayout from "../layouts/launchLayout";
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
import ProfileLayout from "../layouts/profileLayout";
import ChangePassword from "../pages/ChangePassword";
import confirmaCorreo from "../pages/ConfirmaCorreo";
import Registro from "../pages/Registro";
import PrivacyNotice from "../pages/PrivacyNotice";
import EmailConfirmation from "../pages/EmailConfirmation";
import ActualizarPlan from "../pages/ActualizarPlan";


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
      <Route path="/" element={loadLayout(LandingLayout, Home)} />
      <Route path="/acercaDe" element={loadLayout(ProfileLayout, AcercaDe)} />
      <Route path="/actualizarPlan" element={loadLayout(MainLayout, ActualizarPlan)} />
      <Route path="/dashboard" element={loadLayout(ProfileLayout, Dashboard)} />
      <Route path="/avisoPrivacidad" element={loadLayout(MainLayout, PrivacyNotice)} />
      <Route path="/confirmacionCorreo" element={loadLayout(MainLayout, EmailConfirmation)} />
      <Route path="/editarProducto" element={loadLayout(ProfileLayout, EditarProducto)} />
      <Route path="/editarDatos" element={loadLayout(ProfileLayout, EditarDatos)} />
      <Route path="/empresa" element={loadLayout(ProfileLayout, Empresa)} />
      <Route path="/perfil" element={loadLayout(ProfileLayout, Perfil)} />
      <Route path="/productos" element={loadLayout(ProfileLayout, Productos)} />
      <Route path="/launchConfirmacion" element={loadLayout(LaunchLayout, LaunchConfirmacion)} />
      <Route path="/launchEmpresa" element={loadLayout(LaunchLayout, LaunchEmpresa)} />
      <Route path="/launchPeriodo" element={loadLayout(LaunchLayout, LaunchPeriodo)} />
      <Route path="/launchProcess" element={loadLayout(LaunchLayout, LaunchProcess)} />
      <Route path="/launchProducto" element={loadLayout(LaunchLayout, LaunchProducto)} />
      <Route path="/launchRegistroVentas" element={loadLayout(LaunchLayout, LaunchRegistroVentas)} />
      <Route path="/launchVentas" element={loadLayout(LaunchLayout, LaunchVentas)} />
      <Route path="/loading" element={loadLayout(LaunchLayout, Loading)} />
      <Route path="/login" element={loadLayout(MainLayout, Login)} />
      <Route path="/resumen" element={loadLayout(MainLayout, Resumen)} />
      <Route path="/changePassword" element={loadLayout(MainLayout, ChangePassword)} />
      <Route path="/confirmaCorreo" element={loadLayout(MainLayout, confirmaCorreo)} />
      <Route path="/RegistroU" element={loadLayout(MainLayout, Registro)}></Route>
    </Routes>
  );
}
