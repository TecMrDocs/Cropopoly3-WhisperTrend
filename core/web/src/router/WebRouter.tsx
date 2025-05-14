import React from "react";
import {Routes, Route} from "react-router-dom";
import LandingLayout from "../layouts/landingLayout";
import MainLayout from "../layouts/mainLayout";
import LaunchLayout from "../layouts/launchLayout";
import Home from "../pages/Home";
import MainPage from "../pages/MainPage";
import AcercaDe from "../pages/AcercaDe"
import Dashboard from "../pages/Dashboard"
import EditarProducto from "../pages/EditarProducto";
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
      <Route path="/main" element={loadLayout(MainLayout, MainPage)} />
      <Route path="/acercaDe" element={loadLayout(MainLayout, AcercaDe)} />
      <Route path="/dashboard" element={loadLayout(MainLayout, Dashboard)} />
      <Route path="/editarProducto" element={loadLayout(MainLayout, EditarProducto)} />
      <Route path="/empresa" element={loadLayout(MainLayout, Empresa)} />
      <Route path="/perfil" element={loadLayout(MainLayout, Perfil)} />
      <Route path="/productos" element={loadLayout(MainLayout, Productos)} />
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
    </Routes>
  );
}
