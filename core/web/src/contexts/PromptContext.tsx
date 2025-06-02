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
  prompt: string;
  setPrompt: (text: string) => void;
  resetPrompt: () => void;

  empresa: DatosEmpresa | null;
  setEmpresa: (data: DatosEmpresa) => void;

  producto: DatosProducto | null;
  setProducto: (data: DatosProducto) => void;
};

const PromptContext = createContext<PromptContextType>({
  prompt: "",
  setPrompt: () => {},
  resetPrompt: () => {},

  empresa: null,
  setEmpresa: () => {},

  producto: null,
  setProducto: () => {},
});

export function usePrompt() {
  return useContext(PromptContext);
}

export function PromptProvider({ children }: { children: React.ReactNode }) {
  const [prompt, setPromptState] = useState("");
  const [empresa, setEmpresaState] = useState<DatosEmpresa | null>(null);
  const [producto, setProductoState] = useState<DatosProducto | null>(null);

  const setPrompt = (text: string) => setPromptState(text);
  const resetPrompt = () => setPromptState("");

  const setEmpresa = (data: DatosEmpresa) => setEmpresaState(data);
  const setProducto = (data: DatosProducto) => setProductoState(data);

  return (
    <PromptContext.Provider
      value={{ prompt,
        setPrompt,
        resetPrompt,
        empresa,
        setEmpresa,
        producto,
        setProducto, }}
    >
      {children}
    </PromptContext.Provider>
  );
}
