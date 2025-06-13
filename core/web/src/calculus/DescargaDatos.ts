/**
* Módulo coordinador principal para descarga y procesamiento de datos.
* 
* Este módulo actúa como orquestador central del pipeline de análisis de tendencias,
* coordinando la descarga de datos de APIs, transformación a formatos específicos
* por plataforma, ejecución de calculadoras modulares y consolidación de resultados.
* Incluye soporte para datos de prueba, fallbacks automáticos y detección de
* cálculos backend pre-procesados.
* 
* Autor: Lucio Arturo Reyes Castillo
*/


// Importar las calculadoras modulares
import CalculosInstagram, { type InstagramDataInput, type ResultadoInstagramCalculado } from './CalculosInstagram.ts';
import CalculosReddit, { type RedditDataInput, type ResultadoRedditCalculado } from './CalculosReddit';
import CalculosX, { type XDataInput, type ResultadoXCalculado } from './CalculosX';

import { obtenerDatosPrueba } from './DatosPrueba';

/**
* Interfaces para estructuras de datos de APIs y resultados.
* 
* Define los tipos de datos que fluyen a través del pipeline desde
* las APIs hasta los resultados finales consolidados.
*/
interface APIPost {
 comments: number;
 followers?: number;
 likes: number;
 link: string;
 time: string;
 // Reddit específico
 members?: number;
 subreddit?: string;
 title?: string;
 vote?: number;
}

interface APIData {
 hashtags: string[];
 sentence: string;
 trends: {
   data: {
     instagram: Array<{
       keyword: string;
       posts: APIPost[];
     }>;
     reddit: Array<{
       keyword: string;
       posts: APIPost[];
     }>;
     twitter: APIPost[];
   };
   metadata: Array<{
     description: string;
     keywords: string[];
     title: string;
     url: string;
   }>;
 };
}

// 📋 Tipos para noticias
interface Noticia {
 title: string;
 description: string;
 url: string;
 keywords: string[];
}

// 🎯 Resultado final que se devuelve
interface ResultadoFinal {
 resultadoInstaCalc: ResultadoInstagramCalculado;
 resultadoRedditCalc: ResultadoRedditCalculado;
 resultadoXCalc: ResultadoXCalculado;
 noticias: Noticia[];
 resource_name?: string;
 metadatos: {
   timestamp: string;
   hashtagsOriginales: string[];
   sentence: string;
   totalPosts: {
     instagram: number;
     reddit: number;
     twitter: number;
   };
   fuente: 'api' | 'prueba' | 'fallback';
 };
 calculated_results?: any;
}

interface AnalysisData {
 sentence: string;
 hashtags: string[];
 trends: any;
 calculated_results?: any;
 sales: any;
}

/**
* Clase coordinadora principal para descarga y procesamiento de datos.
* 
* Orquesta todo el flujo desde la obtención de datos hasta la generación
* de resultados finales, con soporte para múltiples fuentes y fallbacks.
*/
class DescargaDatos {
 private apiUrl: string;
 private usarDatosPrueba: boolean;
 private analysisData: AnalysisData | null; 

 constructor(apiUrl: string, usarDatosPrueba: boolean = false, analysisData: AnalysisData | null = null) {
   this.apiUrl = apiUrl;
   this.usarDatosPrueba = usarDatosPrueba;
   this.analysisData = analysisData;
 }

 /**
  * Función principal que coordina todo el flujo de procesamiento.
  * 
  * Detecta automáticamente el tipo de datos disponibles (backend pre-calculados,
  * API, prueba o fallback) y ejecuta el pipeline completo de transformación
  * y cálculo de métricas.
  * 
  * @return Promise<ResultadoFinal> - Resultados consolidados de todas las plataformas
  */
 async obtenerResultadosCalculados(): Promise<ResultadoFinal> {
   try {
     let datosAPI: APIData;
     let fuente: 'api' | 'prueba' | 'fallback';
     let calculated_results: any = null;
     
     if (this.analysisData && this.analysisData.calculated_results?.hashtags?.length > 0) {
       datosAPI = {
         hashtags: this.analysisData.hashtags,
         sentence: this.analysisData.sentence,
         trends: this.analysisData.trends || { data: { instagram: [], reddit: [], twitter: [] }, metadata: [] }
       };
       calculated_results = this.analysisData.calculated_results; // 🎯 PASAR TAL COMO VIENEN
       fuente = 'api';
       
     } else if (this.usarDatosPrueba) {
       datosAPI = obtenerDatosPrueba();
       fuente = 'prueba';
     } else {
       try {
         datosAPI = await this.descargarDatosAPI();
         fuente = 'api';
       } catch (error) {
         datosAPI = obtenerDatosPrueba();
         fuente = 'fallback';
       }
     }
     
     // 2. Transformar a formatos específicos para cada calculadora
     const datosTransformados = this.transformarDatos(datosAPI);
     
     // 3. Ejecutar calculadoras modulares
     const resultados = this.ejecutarCalculadoras(datosTransformados);
     
     // 4. Preparar resultado final con metadatos
     const resultadoFinal = this.prepararResultadoFinal(datosAPI, resultados, fuente, this.analysisData);
     
     // 🎯 CLAVE: AGREGAR CALCULATED_RESULTS AL RESULTADO
     if (calculated_results) {
       resultadoFinal.calculated_results = calculated_results;
     }
     
     return resultadoFinal;
     
   } catch (error) {
     // Fallback final a datos hardcodeados básicos
     return this.usarDatosHardcodeados();
   }
 }

 /**
  * Descarga datos desde la API externa.
  * 
  * @return Promise<APIData> - Datos estructurados de la API
  */
 private async descargarDatosAPI(): Promise<APIData> {
   const response = await fetch(this.apiUrl, {
     method: 'GET',
     headers: {
       'Content-Type': 'application/json',
     },
   });

   if (!response.ok) {
     throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
   }

   const data: APIData = await response.json();
   
   if (!data.hashtags || !data.trends) {
     throw new Error('Estructura de datos API inválida');
   }

   return data;
 }

 /**
  * Transforma datos de API a formatos específicos para cada calculadora.
  * 
  * @param datosAPI - Datos crudos de la API
  * @return Object - Datos transformados por plataforma
  */
 private transformarDatos(datosAPI: APIData) {
   return {
     instagram: this.transformarParaInstagram(datosAPI),
     reddit: this.transformarParaReddit(datosAPI),
     x: this.transformarParaX(datosAPI),
     noticias: this.extraerNoticias(datosAPI)
   };
 }

 /**
  * Transforma datos para el formato específico de Instagram.
  * 
  * @param datosAPI - Datos de API
  * @return InstagramDataInput - Datos formateados para calculadora de Instagram
  */
 private transformarParaInstagram(datosAPI: APIData): InstagramDataInput {
   const hashtags = datosAPI.hashtags.map((hashtag, index) => {
     const grupoInstagram = datosAPI.trends.data.instagram?.find(
       grupo => grupo.keyword === hashtag
     );
     
     const posts = grupoInstagram?.posts || [];
     
     if (posts.length === 0) {
       return this.crearHashtagVacioInstagram(hashtag, index);
     }

     const datosAgrupados = this.agruparPostsPorMes(posts, 'instagram');
     
     return {
       hashtag: hashtag,
       id: this.generarIdAutomatico(hashtag, index),
       fechas: datosAgrupados.fechas,
       likes: datosAgrupados.likes,
       comentarios: datosAgrupados.comentarios,
       vistas: datosAgrupados.vistas,
       seguidores: datosAgrupados.seguidores,
       compartidos: datosAgrupados.compartidos
     };
   });

   return { hashtags };
 }

 /**
  * Transforma datos para el formato específico de Reddit.
  * 
  * @param datosAPI - Datos de API
  * @return RedditDataInput - Datos formateados para calculadora de Reddit
  */
 private transformarParaReddit(datosAPI: APIData): RedditDataInput {
   const hashtags = datosAPI.hashtags.map((hashtag, index) => {
     const grupoReddit = datosAPI.trends.data.reddit?.find(
       grupo => grupo.keyword === hashtag
     );
     
     const posts = grupoReddit?.posts || [];
     
     if (posts.length === 0) {
       return this.crearHashtagVacioReddit(hashtag, index);
     }

     const datosAgrupados = this.agruparPostsPorMes(posts, 'reddit');
     
     return {
       hashtag: hashtag,
       id: this.generarIdAutomatico(hashtag, index),
       fechas: datosAgrupados.fechas,
       upVotes: datosAgrupados.upVotes,
       comentarios: datosAgrupados.comentarios,
       suscriptores: datosAgrupados.suscriptores,
       horas: datosAgrupados.horas
     };
   });

   return { hashtags };
 }

 private transformarParaX(datosAPI: APIData): XDataInput {
   const hashtags = datosAPI.hashtags.map((hashtag, index) => {
     return this.crearHashtagVacioX(hashtag, index);
   });

   return { hashtags };
 }

 private extraerNoticias(datosAPI: APIData): Noticia[] {
   return datosAPI.trends.metadata?.map(item => ({
     title: item.title,
     description: item.description,
     url: item.url,
     keywords: item.keywords
   })) || [];
 }

 /**
  * Ejecuta todas las calculadoras modulares con los datos transformados.
  * 
  * @param datosTransformados - Datos preparados para cada plataforma
  * @return Object - Resultados calculados de todas las plataformas
  */
 private ejecutarCalculadoras(datosTransformados: any) {
   const resultadoInstagram = CalculosInstagram.procesarDatos(datosTransformados.instagram);
   const resultadoReddit = CalculosReddit.procesarDatos(datosTransformados.reddit);
   const resultadoX = CalculosX.procesarDatos(datosTransformados.x);
   
   return {
     instagram: resultadoInstagram,
     reddit: resultadoReddit,
     x: resultadoX
   };
 }

 private prepararResultadoFinal(datosAPI: APIData, resultados: any, fuente: 'api' | 'prueba' | 'fallback', analysisData?: any): ResultadoFinal {
   const totalPosts = {
     instagram: datosAPI.trends.data.instagram?.reduce((total, grupo) => total + (grupo.posts?.length || 0), 0) || 0,
     reddit: datosAPI.trends.data.reddit?.reduce((total, grupo) => total + (grupo.posts?.length || 0), 0) || 0,
     twitter: datosAPI.trends.data.twitter?.length || 0
   };

   return {
     resultadoInstaCalc: resultados.instagram,
     resultadoRedditCalc: resultados.reddit,
     resultadoXCalc: resultados.x,
     noticias: this.extraerNoticias(datosAPI),
     resource_name: analysisData?.resource_name || 'Producto',
     metadatos: {
       timestamp: new Date().toISOString(),
       hashtagsOriginales: datosAPI.hashtags,
       sentence: datosAPI.sentence,
       totalPosts,
       fuente
     }
   };
 }

 private agruparPostsPorMes(posts: APIPost[], plataforma: 'instagram' | 'reddit' | 'x') {
   const datosPorMes = new Map<string, any>();

   posts.forEach(post => {
     const fechaMes = this.extraerMes(post.time);
     
     if (!datosPorMes.has(fechaMes)) {
       datosPorMes.set(fechaMes, {
         likes: [], comentarios: [], seguidores: [], vistas: [], compartidos: [],
         upVotes: [], suscriptores: [], horas: []
       });
     }

     const datos = datosPorMes.get(fechaMes)!;

     if (plataforma === 'instagram') {
       datos.likes.push(post.likes || 0);
       datos.comentarios.push(post.comments || 0);
       datos.seguidores.push(post.followers || 0);
       datos.vistas.push((post.likes || 0) * 8);
       datos.compartidos.push(Math.floor((post.likes || 0) * 0.05));
     } else if (plataforma === 'reddit') {
       datos.upVotes.push(post.vote || 0);
       datos.comentarios.push(post.comments || 0);
       datos.suscriptores.push(post.members || 0);
       datos.horas.push(24);
     }
   });

   const mesesOrdenados = Array.from(datosPorMes.keys()).sort();
   
   return {
     fechas: mesesOrdenados.map(mes => this.formatearRangoFecha(mes)),
     likes: this.sumarPorMes(mesesOrdenados, datosPorMes, 'likes'),
     comentarios: this.sumarPorMes(mesesOrdenados, datosPorMes, 'comentarios'),
     seguidores: this.sumarPorMes(mesesOrdenados, datosPorMes, 'seguidores'),
     vistas: this.sumarPorMes(mesesOrdenados, datosPorMes, 'vistas'),
     compartidos: this.sumarPorMes(mesesOrdenados, datosPorMes, 'compartidos'),
     upVotes: this.sumarPorMes(mesesOrdenados, datosPorMes, 'upVotes'),
     suscriptores: this.maxPorMes(mesesOrdenados, datosPorMes, 'suscriptores'),
     horas: this.sumarPorMes(mesesOrdenados, datosPorMes, 'horas')
   };
 }

 private crearHashtagVacioInstagram(hashtag: string, index: number) {
   const fechasDefecto = ["01/01/25 - 31/01/25", "1/02/25 - 28/02/25"];
   return {
     hashtag,
     id: this.generarIdAutomatico(hashtag, index),
     fechas: fechasDefecto,
     likes: [0, 0],
     comentarios: [0, 0],
     vistas: [0, 0],
     seguidores: [0, 0],
     compartidos: [0, 0]
   };
 }

 private crearHashtagVacioReddit(hashtag: string, index: number) {
   const fechasDefecto = ["01/01/25 - 31/01/25", "1/02/25 - 28/02/25"];
   return {
     hashtag,
     id: this.generarIdAutomatico(hashtag, index),
     fechas: fechasDefecto,
     upVotes: [0, 0],
     comentarios: [0, 0],
     suscriptores: [0, 0],
     horas: [0, 0]
   };
 }

 private crearHashtagVacioX(hashtag: string, index: number) {
   const fechasDefecto = ["01/01/25 - 31/01/25", "1/02/25 - 28/02/25"];
   return {
     hashtag,
     id: this.generarIdAutomatico(hashtag, index),
     fechas: fechasDefecto,
     likes: [0, 0],
     repost: [0, 0],
     comentarios: [0, 0],
     vistas: [0, 0],
     seguidores: [0, 0]
   };
 }

 private generarIdAutomatico(hashtag: string, index: number): string {
   const hashtagLimpio = hashtag
     .replace(/[^a-zA-Z0-9]/g, '')
     .toLowerCase()
     .substring(0, 12);
   return `${hashtagLimpio}_${index}`;
 }

 private extraerMes(isoDate: string): string {
   const fecha = new Date(isoDate);
   const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
   const año = fecha.getFullYear().toString().slice(-2);
   return `${mes}/${año}`;
 }

 private formatearRangoFecha(mes: string): string {
   const [mm, aa] = mes.split('/');
   const mesNum = parseInt(mm);
   const año = `20${aa}`;
   const ultimoDia = new Date(parseInt(año), mesNum, 0).getDate();
   return `1/${mm}/${aa} - ${ultimoDia}/${mm}/${aa}`;
 }

 private sumarPorMes(meses: string[], datos: Map<string, any>, campo: string): number[] {
   return meses.map(mes => {
     const valores = datos.get(mes)?.[campo] || [];
     return valores.reduce((sum: number, val: number) => sum + val, 0);
   });
 }

 private maxPorMes(meses: string[], datos: Map<string, any>, campo: string): number[] {
   return meses.map(mes => {
     const valores = datos.get(mes)?.[campo] || [];
     return valores.length > 0 ? Math.max(...valores) : 0;
   });
 }

 private async usarDatosHardcodeados(): Promise<ResultadoFinal> {
   const datosEmergencia = obtenerDatosPrueba();
   const datosTransformados = this.transformarDatos(datosEmergencia);
   const resultados = this.ejecutarCalculadoras(datosTransformados);
   return this.prepararResultadoFinal(datosEmergencia, resultados, 'fallback');
 }
}

export const crearDescargaDatos = (apiUrl: string, usarDatosPrueba: boolean = false) => {
 return new DescargaDatos(apiUrl, usarDatosPrueba);
};

export const crearConDatosPrueba = () => {
 return new DescargaDatos('', true);
};

export const crearConDatosContext = (analysisData: any) => {
 return new DescargaDatos('', false, analysisData);
};

export default DescargaDatos;
export type { ResultadoFinal, Noticia, APIData };