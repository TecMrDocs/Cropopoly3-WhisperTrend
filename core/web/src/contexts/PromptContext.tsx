/**
 * Contexto Global para Gestión de Datos de Empresa y Análisis
 * 
 * Este archivo implementa el contexto principal de React para manejar el estado global
 * de datos de empresa, productos, usuarios y resultados de análisis de tendencias.
 * Proporciona un estado centralizado accesible desde cualquier componente de la aplicación.
 * 
 * @author Arturo Barrios Mendoza
 * @contributors Mariana Barrios Mendoza y Lucio Arturo Reyes Castillo 
 */

import { createContext, useContext, useState } from "react";

/**
 * Estructura de datos para información de empresa
 * Contiene todos los campos necesarios para caracterizar una empresa
 * incluyendo información operacional, geográfica y organizacional
 */
type DatosEmpresa = {
  business_name: string;
  industry: string;
  company_size: string;
  scope: string;
  locations: string;
  num_branches: string;
};

/**
 * Estructura de datos para información de productos o servicios
 * Define los campos básicos que describen un producto/servicio
 * incluyendo metadatos y palabras clave relacionadas
 */
type DatosProducto = {
  r_type: string;
  name: string;
  description: string;
  related_words: string;
};

/**
 * Estructura completa de datos de análisis de tendencias
 * Contiene todos los resultados procesados por el backend incluyendo
 * hashtags, métricas de redes sociales, ventas y metadatos de procesamiento
 */
type AnalysisData = {
  sentence: string;
  hashtags: string[];
  trends: any;
  calculated_results?: {
    hashtags: Array<{
      name: string;
      instagram_interaction: number;
      instagram_virality: number;
      reddit_interaction: number;
      reddit_virality: number;
      twitter_interaction: number;
      twitter_virality: number;
    }>;
    total_hashtags: number;
    processing_time_ms: number;
    data_source: string;
  };
  sales: any;
  resource_name?: string;
  processing?: {
    status: string;
    message: string;
    backend_calculations: boolean;
  };
};

/**
 * Definición del tipo del contexto con todos los estados y funciones
 * Especifica la interfaz completa que estará disponible para los componentes
 * incluyendo datos, setters y flags de estado de la aplicación
 */
type PromptContextType = {
  empresa: DatosEmpresa | null;
  setEmpresa: (data: DatosEmpresa) => void;

  producto: DatosProducto | null;
  setProducto: (data: DatosProducto) => void;

  userId: number | null;
  setUserId: (id: number) => void;
  
  productId: number | null;
  setProductId: (id: number) => void;

  hasSalesData: boolean;
  setHasSalesData: (hasData: boolean) => void;

  analysisData: AnalysisData | null;
  setAnalysisData: (data: AnalysisData | null) => void;
};

/**
 * Creación del contexto de React con valores por defecto
 * Inicializa el contexto con valores null y funciones vacías
 * que serán reemplazadas por el provider con funcionalidad real
 */
const PromptContext = createContext<PromptContextType>({
  empresa: null,
  setEmpresa: () => {},

  producto: null,
  setProducto: () => {},

  userId: null,
  setUserId: () => {},
  
  productId: null,
  setProductId: () => {},

  hasSalesData: false,
  setHasSalesData: () => {},

  analysisData: null,
  setAnalysisData: () => {},
});

/**
 * Hook personalizado para acceder al contexto de forma simplificada
 * Proporciona una interfaz limpia para que los componentes accedan
 * al estado global sin necesidad de importar useContext directamente
 * 
 * @return Objeto con todos los datos y funciones del contexto
 */
export function usePrompt() {
  return useContext(PromptContext);
}

/**
 * Componente proveedor del contexto que maneja el estado global
 * Implementa toda la lógica de estado y proporciona los datos
 * a todos los componentes hijos a través del contexto de React
 * 
 * @param children Componentes hijos que tendrán acceso al contexto
 * @return JSX.Element con el proveedor configurado y estado inicializado
 */
export function PromptProvider({ children }: { children: React.ReactNode }) {
  /**
   * Estados locales para todos los datos de la aplicación
   * Cada estado maneja una sección específica de información
   * con sus respectivos setters para actualizaciones controladas
   */
  const [empresa, setEmpresaState] = useState<DatosEmpresa | null>(null);
  const [producto, setProductoState] = useState<DatosProducto | null>(null);
  const [userId, setUserIdState] = useState<number | null>(null);
  const [productId, setProductIdState] = useState<number | null>(null);
  const [hasSalesData, setHasSalesDataState] = useState(false);
  const [analysisData, setAnalysisDataState] = useState<AnalysisData | null>(null);

  /**
   * Setter para datos de empresa con validación y persistencia
   * Actualiza el estado global de información empresarial
   * manteniendo la consistencia de datos en toda la aplicación
   */
  const setEmpresa = (data: DatosEmpresa) => setEmpresaState(data);

  /**
   * Setter para datos de producto con validación y persistencia
   * Actualiza el estado global de información del producto/servicio
   * asegurando disponibilidad en todos los componentes relevantes
   */
  const setProducto = (data: DatosProducto) => setProductoState(data);
  
  /**
   * Setter para ID de usuario con control de sesión
   * Gestiona la identificación del usuario autenticado
   * y mantiene la referencia para operaciones backend
   */
  const setUserId = (id: number) => setUserIdState(id);

  /**
   * Setter para ID de producto con control de recursos
   * Gestiona la identificación del producto activo
   * y mantiene la referencia para análisis y operaciones
   */
  const setProductId = (id: number) => setProductIdState(id);

  /**
   * Setter para flag de datos de ventas con control de flujo
   * Indica si el usuario ha proporcionado información de ventas
   * affecting the analysis workflow and available features
   */
  const setHasSalesData = (hasData: boolean) => setHasSalesDataState(hasData);
  
  /**
   * Setter para datos de análisis con logging y validación
   * Maneja los resultados completos del análisis de tendencias
   * incluyendo logging para debugging y monitoreo del flujo de datos
   */
  const setAnalysisData = (data: AnalysisData | null) => {
    setAnalysisDataState(data);
  };

  /**
   * Configuración del proveedor con todos los valores del contexto
   * Combina todos los estados y setters en un objeto que será
   * accesible por todos los componentes hijos através del contexto
   */
  return (
    <PromptContext.Provider
      value={{
        empresa,
        setEmpresa,
        producto,
        setProducto, 
        userId,
        setUserId,
        productId,
        setProductId,
        hasSalesData,
        setHasSalesData,
        analysisData,
        setAnalysisData,
      }}
    >
      {children}
    </PromptContext.Provider>
  );
}