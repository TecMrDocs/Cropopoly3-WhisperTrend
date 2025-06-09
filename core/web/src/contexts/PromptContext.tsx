/**
 * Componente: PromptContext
 * Authors: Arturo Barrios Mendoza y Mariana Balderrábano Aguilar
 * Descripción: Contexto para manejar los datos de la empresa y el producto en la aplicación.
 */

import { createContext, useContext, useState } from "react";

type DatosEmpresa = {
  business_name: string; // Nombre de la empresa
  industry: string; // Industria a la que pertenece la empresa
  company_size: string; // Tamaño de la empresa
  scope: string; // Alcance de la empresa (local, nacional, internacional)
  locations: string; // Ubicaciones de la empresa
  num_branches: string; // Número de sucursales
};

type DatosProducto = {
  r_type: string; // Indica si es producto o servicio
  name: string; // Nombre del producto o servicio
  description: string; // Descripción del producto o servicio
  related_words: string; // Palabras relacionadas con el producto o servicio (cadena)
};

// 🆕 TIPO PARA LOS DATOS DE ANÁLISIS DEL BACKEND
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
  processing?: {
    status: string;
    message: string;
    backend_calculations: boolean;
  };
};

type PromptContextType = {
  empresa: DatosEmpresa | null;
  setEmpresa: (data: DatosEmpresa) => void;

  producto: DatosProducto | null;
  setProducto: (data: DatosProducto) => void;

  userId: number | null;
  setUserId: (id: number) => void;
  
  productId: number | null;
  setProductId: (id: number) => void;

  // Indica si el usuario registró o no ventas para su producto
  hasSalesData: boolean;
  setHasSalesData: (hasData: boolean) => void;

  // 🆕 DATOS DE ANÁLISIS DEL BACKEND
  analysisData: AnalysisData | null;
  setAnalysisData: (data: AnalysisData | null) => void;
};

/**
 * Contexto para manejar los datos de la empresa y el producto.
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
 * 
 * @returns El contexto de PromptContext para acceder a los datos de la empresa y el producto.
 */
export function usePrompt() {
  return useContext(PromptContext);
}

/**
 * 
 * @param param0 - children: Elementos hijos que se renderizarán dentro del contexto.
 * @returns 
 */
export function PromptProvider({ children }: { children: React.ReactNode }) {
  const [empresa, setEmpresaState] = useState<DatosEmpresa | null>(null);
  const [producto, setProductoState] = useState<DatosProducto | null>(null);
  const [userId, setUserIdState] = useState<number | null>(null);
  const [productId, setProductIdState] = useState<number | null>(null);
  const [hasSalesData, setHasSalesDataState] = useState(false);
  
  const [analysisData, setAnalysisDataState] = useState<AnalysisData | null>(null);

  const setEmpresa = (data: DatosEmpresa) => setEmpresaState(data);
  const setProducto = (data: DatosProducto) => setProductoState(data);
  
  const setUserId = (id: number) => setUserIdState(id);
  const setProductId = (id: number) => setProductIdState(id);

  const setHasSalesData = (hasData: boolean) => setHasSalesDataState(hasData);
  
  const setAnalysisData = (data: AnalysisData | null) => {
    setAnalysisDataState(data);
    if (data) {
      console.log('✅ [PromptContext] Datos de análisis guardados:', data);
    } else {
      console.log('🧹 [PromptContext] Datos de análisis limpiados');
    }
  };

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