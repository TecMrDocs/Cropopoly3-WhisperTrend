import { createContext, useContext, useState } from "react";

type DatosEmpresa = {
  business_name: string;
  industry: string;
  company_size: string;
  scope: string;
  locations: string;
  num_branches: string;
};

type DatosProducto = {
  r_type: string;
  name: string;
  description: string;
  related_words: string;
};

type PromptContextType = {
  empresa: DatosEmpresa | null;
  setEmpresa: (data: DatosEmpresa) => void;

  producto: DatosProducto | null;
  setProducto: (data: DatosProducto) => void;

  idProducto: number | null;
  setIdProducto?: (id: number) => void;
};

const PromptContext = createContext<PromptContextType>({
  empresa: null,
  setEmpresa: () => {},

  producto: null,
  setProducto: () => {},

  idProducto: null,
  setIdProducto: () => {},
});

export function usePrompt() {
  return useContext(PromptContext);
}

export function PromptProvider({ children }: { children: React.ReactNode }) {
  const [empresa, setEmpresaState] = useState<DatosEmpresa | null>(null);
  const [producto, setProductoState] = useState<DatosProducto | null>(null);
  const [idProducto, setIdProductoState] = useState<number | null>(null);

  const setEmpresa = (data: DatosEmpresa) => setEmpresaState(data);
  const setProducto = (data: DatosProducto) => setProductoState(data);

  const setIdProducto = (id: number) => setIdProductoState(id);

  return (
    <PromptContext.Provider
      value={{
        empresa,
        setEmpresa,
        producto,
        setProducto,
        idProducto,
        setIdProducto,
      }}
    >
      {children}
    </PromptContext.Provider>
  );
}
