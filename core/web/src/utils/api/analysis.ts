const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export interface AnalysisRequest {
  model: string;
  analysis_data: any;
}

export interface AnalysisResponse {
  analysis: string;
  saved: boolean;
}

const analysisApi = {
  analysis: {
    // ENDPOINT DE PRUEBA
    testPromptContext: async (data: any): Promise<any> => {
      console.log('🧪 [API] Enviando datos de prueba:', data);
      
      const response = await fetch(`${BASE_URL}/analysis/test-prompt-context`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ [API] Respuesta del servidor:', result);
      return result;
    },

    // Generar nuevo análisis con datos del contexto
    generateNew: async (data: AnalysisRequest): Promise<AnalysisResponse> => {
      const response = await fetch(`${BASE_URL}/analysis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return response.json();
    },

    // Obtener último análisis
    getLatest: async (): Promise<string> => {
      const response = await fetch(`${BASE_URL}/analysis/latest`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return response.text();
    },

    // Obtener análisis anterior
    getPrevious: async (): Promise<string> => {
      const response = await fetch(`${BASE_URL}/analysis/previous`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return response.text();
    },

    // Mantener el método dummy existente
    getDummy: async (): Promise<string> => {
      const response = await fetch(`${BASE_URL}/analysis/dummy`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return response.text();
    },
  },
};

export default analysisApi;