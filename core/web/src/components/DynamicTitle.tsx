import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Mapeo de rutas a nombres legibles
const routeTitles: Record<string, string> = {
  '/': 'Inicio',
  '/acercaDe': 'Acerca De',
  '/actualizarPlan': 'Actualizar Plan',
  '/dashboard': 'Dashboard',
  '/avisoPrivacidad': 'Aviso de Privacidad',
  '/confirmacionCorreo': 'Confirmación de Correo',
  '/editarProducto': 'Editar Producto',
  '/empresa': 'Información de Empresa',
  '/perfil': 'Perfil de Usuario',
  '/productos': 'Productos y Servicios',
  '/launchConfirmacion': 'Confirmación',
  '/launchEmpresa': 'Información de Empresa',
  '/launchPeriodo': 'Periodo de Análisis',
  '/launchProcess': 'Proceso de Configuración',
  '/launchProducto': 'Información de Producto',
  '/launchRegistroVentas': 'Registro de Ventas',
  '/launchVentas': 'Información de Ventas',
  '/loading': 'Cargando Análisis',
  '/login': 'Iniciar Sesión',
  '/resumen': 'Resumen',
  '/changePassword': 'Cambiar Contraseña',
  '/confirmaCorreo': 'Confirmar Correo',
  '/RegistroU': 'Registro de Usuario'
};

const DynamicTitle = () => {
  const location = useLocation();
  
  useEffect(() => {
    // Obtener el nombre de la ruta actual o usar la ruta como fallback
    const routeName = routeTitles[location.pathname] || 
      location.pathname.substring(1).charAt(0).toUpperCase() + 
      location.pathname.substring(2);
    
    document.title = `WhisperTrend - ${routeName}`;
  }, [location]);
  
  return null;
};

export default DynamicTitle;