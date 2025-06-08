// CalculosReddit.ts
// Módulo especializado en cálculos específicos de Reddit

interface HashtagRedditData {
  hashtag: string;
  id: string;
  fechas: string[];
  upVotes: number[];
  comentarios: number[];
  suscriptores: number[];
  horas: number[];
}

interface RedditDataInput {
  hashtags: HashtagRedditData[];
}

interface DatoCalculado {
  fecha: string;
  tasa: number;
}

interface HashtagCalculado {
  id: string;
  nombre: string;
  datosInteraccion: DatoCalculado[];
  datosViralidad: DatoCalculado[];
  datosRaw: {
    fechas: string[];
    upVotes: number[];
    comentarios: number[];
    suscriptores: number[];
    horas: number[];
  };
}

interface ResultadoRedditCalculado {
  plataforma: string;
  emoji: string;
  color: string;
  hashtags: HashtagCalculado[];
  hashtag: string;
  datosInteraccion: DatoCalculado[];
  datosViralidad: DatoCalculado[];
  datosRaw: any;
}

class CalculosReddit {
  
  static procesarDatos(inputData: RedditDataInput): ResultadoRedditCalculado {
    console.log('🔴 Iniciando cálculos para Reddit...');
    
    const hashtagsProcesados = inputData.hashtags.map(hashtag => 
      this.procesarHashtag(hashtag)
    );

    const resultado: ResultadoRedditCalculado = {
      plataforma: "Reddit",
      emoji: "🔴",
      color: "#94a3b8",
      hashtags: hashtagsProcesados,
      hashtag: inputData.hashtags[0]?.hashtag || "#EcoFriendly",
      datosInteraccion: hashtagsProcesados[0]?.datosInteraccion || [],
      datosViralidad: hashtagsProcesados[0]?.datosViralidad || [],
      datosRaw: hashtagsProcesados[0]?.datosRaw || {}
    };

    console.log(`✅ Reddit: ${hashtagsProcesados.length} hashtags procesados`);
    return resultado;
  }

  private static procesarHashtag(hashtagData: HashtagRedditData): HashtagCalculado {
    if (!hashtagData.fechas || hashtagData.fechas.length === 0) {
      return this.crearHashtagVacio(hashtagData);
    }

    // Calcular métricas específicas de Reddit
    const datosInteraccion = this.calcularTasaInteraccion(hashtagData);
    const datosViralidad = this.calcularTasaViralidad(hashtagData);

    return {
      id: hashtagData.id,
      nombre: hashtagData.hashtag,
      datosInteraccion,
      datosViralidad,
      datosRaw: {
        fechas: hashtagData.fechas,
        upVotes: hashtagData.upVotes,
        comentarios: hashtagData.comentarios,
        suscriptores: hashtagData.suscriptores,
        horas: hashtagData.horas
      }
    };
  }

  /**
   * Fórmula: (UpVotes + Comentarios) / Suscriptores * 100
   */
  private static calcularTasaInteraccion(data: HashtagRedditData): DatoCalculado[] {
    return data.fechas.map((fecha, i) => {
      const upVotes = data.upVotes[i] || 0;
      const comentarios = data.comentarios[i] || 0;
      const suscriptores = data.suscriptores[i] || 1;
      
      const totalInteracciones = upVotes + comentarios;
      const tasa = suscriptores > 0 ? (totalInteracciones / suscriptores) * 100 : 0;
      
      return {
        fecha,
        tasa: parseFloat(tasa.toFixed(3)) 
      };
    });
  }

  /**
   Fórmula: (UpVotes + Comentarios) / Horas * 100
   */
  private static calcularTasaViralidad(data: HashtagRedditData): DatoCalculado[] {
    return data.fechas.map((fecha, i) => {
      const upVotes = data.upVotes[i] || 0;
      const comentarios = data.comentarios[i] || 0;
      const horas = data.horas[i] || 1; // Evitar división por 0
      
      const totalInteracciones = upVotes + comentarios;
      const tasa = horas > 0 ? (totalInteracciones / horas) * 100 : 0;
      
      return {
        fecha,
        tasa: parseFloat(tasa.toFixed(3)) // Reddit usa 3 decimales según tu código
      };
    });
  }


  private static validarDatos(data: HashtagRedditData): boolean {
    if (!data.fechas || data.fechas.length === 0) return false;
    if (!data.upVotes || !data.comentarios || !data.suscriptores || !data.horas) return false;
    const longitud = data.fechas.length;
    return (
      data.upVotes.length === longitud &&
      data.comentarios.length === longitud &&
      data.suscriptores.length === longitud &&
      data.horas.length === longitud
    );
  }

  private static crearHashtagVacio(hashtagData: HashtagRedditData): HashtagCalculado {
    const fechasVacias = ["01/01/25 - 31/01/25", "1/02/25 - 28/02/25"];
    const datosVacios = [0, 0];
    
    return {
      id: hashtagData.id || 'vacio',
      nombre: hashtagData.hashtag || '#SinDatos',
      datosInteraccion: fechasVacias.map(fecha => ({ fecha, tasa: 0 })),
      datosViralidad: fechasVacias.map(fecha => ({ fecha, tasa: 0 })),
      datosRaw: {
        fechas: fechasVacias,
        upVotes: datosVacios,
        comentarios: datosVacios,
        suscriptores: datosVacios,
        horas: datosVacios
      }
    };
  }

  /**
   * 🎲 Función específica para generar ID automático basado en hashtag
   */
  static generarIdHashtag(hashtag: string, index: number): string {
    // Limpiar el hashtag para crear un ID válido
    const hashtagLimpio = hashtag
      .replace(/[^a-zA-Z0-9]/g, '') // Quitar caracteres especiales
      .toLowerCase()
      .substring(0, 15); // Máximo 15 caracteres
    
    return `${hashtagLimpio}_${index}`;
  }

  /**
   * 📊 Función para calcular estadísticas adicionales específicas de Reddit
   */
  static calcularEstadisticasReddit(data: HashtagRedditData) {
    const totalUpVotes = data.upVotes.reduce((sum, val) => sum + val, 0);
    const totalComentarios = data.comentarios.reduce((sum, val) => sum + val, 0);
    const promedioSuscriptores = data.suscriptores.reduce((sum, val) => sum + val, 0) / data.suscriptores.length;
    const totalHoras = data.horas.reduce((sum, val) => sum + val, 0);
    
    return {
      totalUpVotes,
      totalComentarios,
      promedioSuscriptores: Math.round(promedioSuscriptores),
      totalHoras,
      ratioUpVotesComentarios: totalComentarios > 0 ? (totalUpVotes / totalComentarios).toFixed(2) : 0
    };
  }

  /**
   * 🔍 Función helper para obtener datos de un hashtag específico
   */
  static obtenerDatosHashtag(resultado: ResultadoRedditCalculado, hashtagId: string): HashtagCalculado | undefined {
    return resultado.hashtags.find(h => h.id === hashtagId);
  }

  /**
   * 📋 Función helper para obtener lista de hashtags disponibles
   */
  static obtenerListaHashtags(resultado: ResultadoRedditCalculado): Array<{id: string, nombre: string}> {
    return resultado.hashtags.map(h => ({
      id: h.id,
      nombre: h.nombre
    }));
  }

  /**
   * 🏆 Función para obtener el hashtag con mejor rendimiento
   */
  static obtenerMejorHashtag(resultado: ResultadoRedditCalculado): HashtagCalculado | null {
    if (resultado.hashtags.length === 0) return null;
    
    // Buscar el hashtag con mayor tasa de interacción promedio
    let mejorHashtag = resultado.hashtags[0];
    let mejorPromedio = 0;
    
    resultado.hashtags.forEach(hashtag => {
      const promedioInteraccion = hashtag.datosInteraccion.reduce((sum, dato) => sum + dato.tasa, 0) / hashtag.datosInteraccion.length;
      if (promedioInteraccion > mejorPromedio) {
        mejorPromedio = promedioInteraccion;
        mejorHashtag = hashtag;
      }
    });
    
    return mejorHashtag;
  }
}

// 🚀 Exportar para uso en otros módulos
export default CalculosReddit;
export type { 
  HashtagRedditData, 
  RedditDataInput, 
  ResultadoRedditCalculado,
  HashtagCalculado,
  DatoCalculado 
};