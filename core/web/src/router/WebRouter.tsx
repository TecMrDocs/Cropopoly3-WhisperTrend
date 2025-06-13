/**
 * Enrutador Principal de la Aplicación Web
 * 
 * Este archivo define la estructura completa de navegación de la aplicación,
 * organizando las rutas en diferentes categorías: públicas, protegidas y de proceso de lanzamiento.
 * Implementa un sistema de layouts dinámicos y controles de autenticación para cada sección.
 * 
 * @author Todo el equipo de desarrollo de WhisperTrend
 * @contributors Todo el equipo de desarrollo de WhisperTrend
 */

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
import NewResource from "../pages/NewResource";
import RegistroVentas from "../pages/RegistroVentas";
import PrevioRegistroVentas from "../pages/PrevioRegistroVentas";
import ConfirmaProducto from "../pages/ConfirmaProducto";
import Protected from "../components/Protected";
import Unprotected from "../components/Unprotected";
import AuthLayout from "@/layouts/authLayout";

/**
 * Componente principal de enrutamiento de la aplicación
 * Maneja toda la navegación entre páginas, implementa protección de rutas
 * y asigna layouts específicos según el contexto de cada sección
 * 
 * @return JSX.Element con la estructura completa de rutas de la aplicación
 */
export default function WebRouter(){
  /**
   * Función utilitaria para combinar layouts con páginas de forma dinámica
   * Encapsula una página dentro de su layout correspondiente para mantener
   * consistencia visual y funcional en cada sección de la aplicación
   * 
   * @param Layout Componente de layout que provee la estructura visual
   * @param Page Componente de página que contiene el contenido específico
   * @return JSX.Element con la página envuelta en su layout
   */
  const loadLayout = (Layout: any, Page: any) => {
    return(
      <Layout>
        <Page />
      </Layout>
    );
  }

  /**
   * Configuración principal de rutas de la aplicación
   * Organiza todas las rutas en categorías lógicas con sus respectivos
   * controles de acceso y layouts para una navegación estructurada
   */
  return(
    <Routes>
      {/**
       * Sección de rutas públicas y no protegidas
       * Estas rutas son accesibles sin autenticación y están destinadas
       * a usuarios visitantes, registro inicial y procesos de autenticación
       */}
      <Route path="/" element={<Unprotected>{loadLayout(LandingLayout, Home)}</Unprotected>} />
      <Route path="/nosotros" element={<Unprotected>{loadLayout(LandingLayout, Us)}</Unprotected>} />
      <Route path="/avisoPrivacidad" element={loadLayout(MainLayout, PrivacyNotice)} />
      <Route path="/login" element={<Unprotected>{loadLayout(AuthLayout, Login)}</Unprotected>} />
      <Route path="/RegistroU" element={<Unprotected>{loadLayout(MainLayout, Registro)}</Unprotected>} />
      <Route path="/confirmacionCorreo" element={loadLayout(MainLayout, EmailConfirmation)} />
      <Route path="/holaDeNuevo" element={loadLayout(MainLayout, HolaDeNuevo)} />
      <Route path="/changePassword" element={loadLayout(AuthLayout, ChangePassword)} />
      <Route path="/actualizarPlan" element={loadLayout(MainLayout, ActualizarPlan)} />
      <Route path="/resumen" element={loadLayout(MainLayout, Resumen)} />
      <Route path="/newResource" element={loadLayout(ProfileLayout, NewResource)}  />
      <Route path="/previoRegistroVentas" element={loadLayout(ProfileLayout, PrevioRegistroVentas)} />
      <Route path="/registroVentas" element={loadLayout(ProfileLayout, RegistroVentas)} />
      <Route path="/confirmaProducto" element={loadLayout(ProfileLayout, ConfirmaProducto)} />
      
      {/**
       * Sección de rutas protegidas principales
       * Requieren autenticación válida para acceso y contienen
       * las funcionalidades principales de la aplicación para usuarios autenticados
       */}
      <Route path="/dashboard" element={<Protected>{loadLayout(ProfileLayout, Dashboard)}</Protected>} />
      <Route path="/acercaDe" element={<Protected>{loadLayout(ProfileLayout, AcercaDe)}</Protected>} />
      <Route path="/editarProducto" element={<Protected>{loadLayout(ProfileLayout, EditarProducto)}</Protected>} />
      <Route path="/editarDatos" element={<Protected>{loadLayout(ProfileLayout, EditarDatos)}</Protected>} />
      <Route path="/empresa" element={<Protected>{loadLayout(ProfileLayout, Empresa)}</Protected>} />
      <Route path="/perfil" element={<Protected>{loadLayout(ProfileLayout, Perfil)}</Protected>} />
      <Route path="/productos" element={<Protected>{loadLayout(ProfileLayout, Productos)}</Protected>} />
      
      {/**
       * Sección de rutas del proceso de lanzamiento
       * Flujo protegido y secuencial para configuración inicial de productos
       * y empresas, con layout especializado para guiar al usuario paso a paso
       */}
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