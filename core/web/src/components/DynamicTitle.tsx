/**
 * Componente: DynamicTitle
 *
 * Este componente React actualiza dinámicamente el título de la pestaña del navegador
 * en función de la ruta actual (`location.pathname`), utilizando un mapeo interno
 * para mostrar nombres legibles y amigables para el usuario.
 *
 * Es útil para mejorar la experiencia del usuario y la accesibilidad,
 * ya que indica de manera clara en qué sección de la aplicación se encuentra.
 *
 * Autor: Julio Cesar Vivas Medina
 * Contribuyentes: Sebastián Antonio Almanza (front design), Andrés Cabrera Alvarado (documentación)
 */

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

/**
 * Componente funcional sin renderizado visual que actualiza el título del documento.
 *
 * @return null - No se renderiza ningún JSX; solo actualiza efectos secundarios
 */
const DynamicTitle = () => {
  const location = useLocation();

  useEffect(() => {
    /**
     * Efecto secundario que actualiza el `document.title`
     * con base en la ruta actual. Si no se encuentra en el mapeo,
     * intenta construir un título capitalizando el path.
     */
    const routeName = routeTitles[location.pathname] || 
      location.pathname.substring(1).charAt(0).toUpperCase() + 
      location.pathname.substring(2);
    
    document.title = `WhisperTrend - ${routeName}`;
  }, [location]);

  return null;
};

export default DynamicTitle;
