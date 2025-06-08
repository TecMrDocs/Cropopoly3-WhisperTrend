// DescargaDatos.ts
// Coordinador principal: API → Transformación → Calculadoras → Resultados
// VERSIÓN CORREGIDA - Reemplaza tu archivo existente

// Importar las calculadoras modulares
import CalculosInstagram, { type InstagramDataInput, type ResultadoInstagramCalculado } from './CalculosInstagram.ts';
import CalculosReddit, { type RedditDataInput, type ResultadoRedditCalculado } from './CalculosReddit';
import CalculosX, { type XDataInput, type ResultadoXCalculado } from './CalculosX';

// 🎲 Importar datos de prueba
import { obtenerDatosPrueba } from './DatosPrueba';

// 📊 Tipos para la API (datos raw que llegan)
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
  metadatos: {
    timestamp: string;
    hashtagsOriginales: string[];
    sentence: string;
    totalPosts: {
      instagram: number;
      reddit: number;
      twitter: number;
    };
    fuente: 'api' | 'prueba' | 'fallback'; // 🆕 NUEVA LÍNEA
  };
}

class DescargaDatos {
  private apiUrl: string;
  private usarDatosPrueba: boolean; // 🆕 NUEVA LÍNEA

  constructor(apiUrl: string, usarDatosPrueba: boolean = false) { // 🆕 MODIFICADO
    this.apiUrl = apiUrl;
    this.usarDatosPrueba = usarDatosPrueba; // 🆕 NUEVA LÍNEA
  }

  /**
   * 🎯 FUNCIÓN PRINCIPAL - Coordina todo el flujo
   */
  async obtenerResultadosCalculados(): Promise<ResultadoFinal> {
    try {
      console.log('🚀 [DescargaDatos] Iniciando proceso completo...');
      
      let datosAPI: APIData;
      let fuente: 'api' | 'prueba' | 'fallback'; // 🆕 NUEVA LÍNEA

      // 🎲 Decidir fuente de datos
      if (this.usarDatosPrueba) {
        console.log('🎲 [DescargaDatos] Modo de prueba activado');
        datosAPI = obtenerDatosPrueba();
        fuente = 'prueba';
      } else {
        try {
          // 1. Intentar descargar datos de la API
          datosAPI = await this.descargarDatosAPI();
          fuente = 'api';
        } catch (error) {
          console.warn('⚠️ [DescargaDatos] API no disponible, usando datos de prueba');
          datosAPI = obtenerDatosPrueba();
          fuente = 'fallback';
        }
      }
      
      // 2. Transformar a formatos específicos para cada calculadora
      const datosTransformados = this.transformarDatos(datosAPI);
      
      // 3. Ejecutar calculadoras modulares
      const resultados = this.ejecutarCalculadoras(datosTransformados);
      
      // 4. Preparar resultado final con metadatos
      const resultadoFinal = this.prepararResultadoFinal(datosAPI, resultados, fuente);
      
      console.log(`✅ [DescargaDatos] Proceso completado exitosamente (fuente: ${fuente})`);
      return resultadoFinal;
      
    } catch (error) {
      console.error('❌ [DescargaDatos] Error crítico en proceso:', error);
      
      // Fallback final a datos hardcodeados básicos
      console.log('🔄 [DescargaDatos] Usando fallback de emergencia...');
      return this.usarDatosHardcodeados();
    }
  }

  /**
   * 📡 Paso 1: Descargar datos de la API
   */
  private async descargarDatosAPI(): Promise<APIData> {
    console.log('📡 Descargando datos de la API...');
    
    const response = await fetch(this.apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Timeout de 15 segundos
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
    }

    const data: APIData = await response.json();
    
    // Validación básica
    if (!data.hashtags || !data.trends) {
      throw new Error('Estructura de datos API inválida');
    }

    console.log(`✅ API: ${data.hashtags.length} hashtags recibidos`);
    return data;
  }

  /**
   * 🔄 Paso 2: Transformar datos para cada calculadora
   */
  private transformarDatos(datosAPI: APIData) {
    console.log('🔄 Transformando datos para calculadoras...');
    
    return {
      instagram: this.transformarParaInstagram(datosAPI),
      reddit: this.transformarParaReddit(datosAPI),
      x: this.transformarParaX(datosAPI),
      noticias: this.extraerNoticias(datosAPI)
    };
  }

  /**
   * 📸 Transformar datos específicos para Instagram
   */
  private transformarParaInstagram(datosAPI: APIData): InstagramDataInput {
    const hashtags = datosAPI.hashtags.map((hashtag, index) => {
      // Buscar posts de Instagram para este hashtag específico
      const grupoInstagram = datosAPI.trends.data.instagram?.find(
        grupo => grupo.keyword === hashtag
      );
      
      const posts = grupoInstagram?.posts || [];
      
      if (posts.length === 0) {
        return this.crearHashtagVacioInstagram(hashtag, index);
      }

      // Agrupar posts por mes
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
   * 🔴 Transformar datos específicos para Reddit
   */
  private transformarParaReddit(datosAPI: APIData): RedditDataInput {
    const hashtags = datosAPI.hashtags.map((hashtag, index) => {
      // Buscar posts de Reddit para este hashtag específico
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

  /**
   * 🐦 Transformar datos específicos para X (Twitter)
   */
  private transformarParaX(datosAPI: APIData): XDataInput {
    // Por ahora Twitter viene vacío, pero mantenemos estructura
    const hashtags = datosAPI.hashtags.map((hashtag, index) => {
      return this.crearHashtagVacioX(hashtag, index);
    });

    return { hashtags };
  }

  /**
   * 📰 Extraer noticias del metadata
   */
  private extraerNoticias(datosAPI: APIData): Noticia[] {
    return datosAPI.trends.metadata.map(item => ({
      title: item.title,
      description: item.description,
      url: item.url,
      keywords: item.keywords
    }));
  }

  /**
   * 🧮 Paso 3: Ejecutar todas las calculadoras
   */
  private ejecutarCalculadoras(datosTransformados: any) {
    console.log('🧮 Ejecutando calculadoras modulares...');
    
    const resultadoInstagram = CalculosInstagram.procesarDatos(datosTransformados.instagram);
    const resultadoReddit = CalculosReddit.procesarDatos(datosTransformados.reddit);
    const resultadoX = CalculosX.procesarDatos(datosTransformados.x);

    console.log('✅ Todas las calculadoras ejecutadas');
    
    return {
      instagram: resultadoInstagram,
      reddit: resultadoReddit,
      x: resultadoX
    };
  }

  /**
   * 📦 Paso 4: Preparar resultado final con metadatos
   */
  private prepararResultadoFinal(datosAPI: APIData, resultados: any, fuente: 'api' | 'prueba' | 'fallback'): ResultadoFinal { // 🆕 MODIFICADO
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
      metadatos: {
        timestamp: new Date().toISOString(),
        hashtagsOriginales: datosAPI.hashtags,
        sentence: datosAPI.sentence,
        totalPosts,
        fuente // 🆕 NUEVA LÍNEA
      }
    };
  }

  /**
   * 📅 Helper: Agrupar posts por mes
   */
  private agruparPostsPorMes(posts: APIPost[], plataforma: 'instagram' | 'reddit' | 'x') {
    // Mapa para agrupar por mes
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
        datos.vistas.push((post.likes || 0) * 8); // Estimación: 8 vistas por like
        datos.compartidos.push(Math.floor((post.likes || 0) * 0.05)); // 5% de likes
      } else if (plataforma === 'reddit') {
        datos.upVotes.push(post.vote || 0);
        datos.comentarios.push(post.comments || 0);
        datos.suscriptores.push(post.members || 0);
        datos.horas.push(24); // Estimación: 24 horas por post
      }
    });

    // Convertir a arrays ordenados
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

  /**
   * 🔧 Helpers para generar datos vacíos
   */
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

  /**
   * 🔧 Helpers generales
   */
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

  /**
   * 🔄 Fallback a datos hardcodeados
   */
  private async usarDatosHardcodeados(): Promise<ResultadoFinal> {
    console.log('🆘 Usando datos de emergencia básicos');
    
    // Usar datos de prueba como emergencia
    const datosEmergencia = obtenerDatosPrueba();
    const datosTransformados = this.transformarDatos(datosEmergencia);
    const resultados = this.ejecutarCalculadoras(datosTransformados);
    return this.prepararResultadoFinal(datosEmergencia, resultados, 'fallback');
  }
}

// 🚀 Funciones para usar en otros archivos
export const crearDescargaDatos = (apiUrl: string, usarDatosPrueba: boolean = false) => {
  return new DescargaDatos(apiUrl, usarDatosPrueba);
};

// 🎲 Función para desarrollo con datos de prueba
export const crearConDatosPrueba = () => {
  return new DescargaDatos('', true);
};

export default DescargaDatos;
export type { ResultadoFinal, Noticia, APIData };

