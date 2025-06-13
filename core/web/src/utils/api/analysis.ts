import { get, post } from "../methods";

/**
 * analysis.ts tiene las definiciones de tipos y funciones para interactuar con la API de análisis.
 * Proporciona interfaces para las solicitudes y respuestas de análisis,
 * así como un objeto que encapsula los métodos para realizar operaciones de análisis.
 * 
 * @author Julio Cesar Vivas Medina
 */

/**
 * Interfaz que define la estructura de una solicitud de análisis.
 *
 * @property model - El modelo a utilizar para el análisis.
 * @property analysis_data - Los datos que se enviarán para el análisis.
 */
export interface AnalysisRequest {
  model: string;
  analysis_data: any;
}

/**
 * Interfaz que define la estructura de la respuesta del análisis.
 *
 * @property analysis - El resultado del análisis como una cadena.
 * @property saved - Indica si el análisis fue guardado exitosamente.
 */
export interface AnalysisResponse {
  analysis: string;
  saved: boolean;
}

/**
 * Objeto que proporciona métodos para interactuar con la API de análisis.
 *
 * @remarks
 * Incluye funciones para probar el contexto del prompt, generar nuevos análisis,
 * y obtener resultados de análisis (más reciente, anterior y de prueba).
 *
 * @property analysis Métodos relacionados con operaciones de análisis.
 * @property analysis.testPromptContext Envía datos de prueba para el contexto del prompt a la API de análisis.
 * @property analysis.generateNew Genera un nuevo análisis usando los datos proporcionados.
 * @property analysis.getLatest Obtiene el resultado del análisis más reciente.
 * @property analysis.getPrevious Obtiene el resultado del análisis anterior.
 * @property analysis.getDummy Obtiene un resultado de análisis ficticio para pruebas.
 */
const analysisApi = {
  analysis: {
    /**
     * Envía un contexto de prompt de prueba a la API de análisis.
     * @param data - Los datos que se enviarán para probar el contexto del prompt.
     * @returns Una promesa que resuelve con la respuesta de la API.
     */
    testPromptContext: (data: any): Promise<any> =>
      post("analysis/test-prompt-context", data, false),

    /**
     * Genera un nuevo análisis utilizando los datos de la solicitud proporcionados.
     * @param data - Los datos de la solicitud de análisis.
     * @returns Una promesa que resuelve con la respuesta del análisis.
     */
    generateNew: (data: AnalysisRequest): Promise<AnalysisResponse> =>
      post("analysis", data, true),

    /**
     * Obtiene el resultado del análisis más reciente.
     * @returns Una promesa que resuelve con el análisis más reciente como una cadena.
     */
    getLatest: (): Promise<string> =>
      get("analysis/latest", true),

    /**
     * Obtiene el resultado del análisis anterior.
     * @returns Una promesa que resuelve con el análisis anterior como una cadena.
     */
    getPrevious: (): Promise<string> =>
      get("analysis/previous", true),

    /**
     * Recupera un resultado de análisis ficticio para fines de prueba.
     * @returns Una promesa que resuelve con un análisis ficticio como una cadena.
     */
    getDummy: (): Promise<string> =>
      get("analysis/dummy", true),
  },
};

export default analysisApi;