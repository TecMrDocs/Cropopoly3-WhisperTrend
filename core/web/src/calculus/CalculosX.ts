// CalculosX.ts
// Módulo especializado en cálculos específicos de X (Twitter)

interface HashtagXData {
  hashtag: string;
  id: string;
  fechas: string[];
  likes: number[];
  repost: number[];
  comentarios: number[];
  vistas: number[];
  seguidores: number[];
}

interface XDataInput {
  hashtags: HashtagXData[];
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
    likes: number[];
    repost: number[];
    comentarios: number[];
    vistas: number[];
    seguidores: number[];
  };
}

interface ResultadoXCalculado {
  plataforma: string;
  emoji: string;
  color: string;
  hashtags: HashtagCalculado[];
  hashtag: string;
  datosInteraccion: DatoCalculado[];
  datosViralidad: DatoCalculado[];
  datosRaw: any;
}

class CalculosX {
  

  static procesarDatos(inputData: XDataInput): ResultadoXCalculado {
    console.log('🐦 Iniciando cálculos para X (Twitter)...');
    const hashtagsProcesados = inputData.hashtags.map(hashtag => 
      this.procesarHashtag(hashtag)
    );
    const resultado: ResultadoXCalculado = {
      plataforma: "X (Twitter)",
      emoji: "🐦",
      color: "#3b82f6",
      hashtags: hashtagsProcesados,
      hashtag: inputData.hashtags[0]?.hashtag || "#EcoFriendly",
      datosInteraccion: hashtagsProcesados[0]?.datosInteraccion || [],
      datosViralidad: hashtagsProcesados[0]?.datosViralidad || [],
      datosRaw: hashtagsProcesados[0]?.datosRaw || {}
    };

    console.log(`✅ X (Twitter): ${hashtagsProcesados.length} hashtags procesados`);
    return resultado;
  }


  private static procesarHashtag(hashtagData: HashtagXData): HashtagCalculado {
    if (!hashtagData.fechas || hashtagData.fechas.length === 0) {
      return this.crearHashtagVacio(hashtagData);
    }
    const datosInteraccion = this.calcularTasaInteraccion(hashtagData);
    const datosViralidad = this.calcularTasaViralidad(hashtagData);

    return {
      id: hashtagData.id,
      nombre: hashtagData.hashtag,
      datosInteraccion,
      datosViralidad,
      datosRaw: {
        fechas: hashtagData.fechas,
        likes: hashtagData.likes,
        repost: hashtagData.repost,
        comentarios: hashtagData.comentarios,
        vistas: hashtagData.vistas,
        seguidores: hashtagData.seguidores
      }
    };
  }

  private static calcularTasaInteraccion(data: HashtagXData): DatoCalculado[] {
    return data.fechas.map((fecha, i) => {
      const likes = data.likes[i] || 0;
      const repost = data.repost[i] || 0;
      const comentarios = data.comentarios[i] || 0;
      const vistas = data.vistas[i] || 1; 
      
      const totalInteracciones = likes + repost + comentarios;
      const tasa = vistas > 0 ? (totalInteracciones / vistas) * 100 : 0;
      
      return {
        fecha,
        tasa: parseFloat(tasa.toFixed(2)) 
      };
    });
  }


  private static calcularTasaViralidad(data: HashtagXData): DatoCalculado[] {
    return data.fechas.map((fecha, i) => {
      const likes = data.likes[i] || 0;
      const repost = data.repost[i] || 0;
      const comentarios = data.comentarios[i] || 0;
      const seguidores = data.seguidores[i] || 1; 
      
      const totalInteracciones = likes + repost + comentarios;
      const tasa = seguidores > 0 ? (totalInteracciones / seguidores) * 100 : 0;
      
      return {
        fecha,
        tasa: parseFloat(tasa.toFixed(2)) 
      };
    });
  }

  private static validarDatos(data: HashtagXData): boolean {
    if (!data.fechas || data.fechas.length === 0) return false;
    if (!data.likes || !data.repost || !data.comentarios || !data.vistas || !data.seguidores) return false;
    const longitud = data.fechas.length;
    return (
      data.likes.length === longitud &&
      data.repost.length === longitud &&
      data.comentarios.length === longitud &&
      data.vistas.length === longitud &&
      data.seguidores.length === longitud
    );
  }

  private static crearHashtagVacio(hashtagData: HashtagXData): HashtagCalculado {
    const fechasVacias = ["01/01/25 - 31/01/25", "1/02/25 - 28/02/25"];
    const datosVacios = [0, 0];
    
    return {
      id: hashtagData.id || 'vacio',
      nombre: hashtagData.hashtag || '#SinDatos',
      datosInteraccion: fechasVacias.map(fecha => ({ fecha, tasa: 0 })),
      datosViralidad: fechasVacias.map(fecha => ({ fecha, tasa: 0 })),
      datosRaw: {
        fechas: fechasVacias,
        likes: datosVacios,
        repost: datosVacios,
        comentarios: datosVacios,
        vistas: datosVacios,
        seguidores: datosVacios
      }
    };
  }

  static generarIdHashtag(hashtag: string, index: number): string {
    const hashtagLimpio = hashtag
      .replace(/[^a-zA-Z0-9]/g, '') 
      .toLowerCase()
      .substring(0, 15); 
    
    return `${hashtagLimpio}_${index}`;
  }


  static calcularEstadisticasX(data: HashtagXData) {
    const totalLikes = data.likes.reduce((sum, val) => sum + val, 0);
    const totalRepost = data.repost.reduce((sum, val) => sum + val, 0);
    const totalComentarios = data.comentarios.reduce((sum, val) => sum + val, 0);
    const totalVistas = data.vistas.reduce((sum, val) => sum + val, 0);
    const promedioSeguidores = data.seguidores.reduce((sum, val) => sum + val, 0) / data.seguidores.length;
    
    return {
      totalLikes,
      totalRepost,
      totalComentarios,
      totalVistas,
      promedioSeguidores: Math.round(promedioSeguidores),
      ratioLikesRepost: totalRepost > 0 ? (totalLikes / totalRepost).toFixed(2) : 0,
      ratioVistaInteracciones: totalVistas > 0 ? ((totalLikes + totalRepost + totalComentarios) / totalVistas * 100).toFixed(2) : 0
    };
  }

  static calcularPotencialViral(data: HashtagXData): number {
    const totalInteracciones = data.repost.reduce((sum, val) => sum + val, 0)+ 
                               data.likes.reduce((sum, val) => sum + val, 0)+   
                               data.comentarios.reduce((sum, val) => sum + val, 0);
    
    const totalVistas = data.vistas.reduce((sum, val) => sum + val, 0);
    
    return totalVistas > 0 ? (totalInteracciones / totalVistas) * 100 : 0;
  }

  static obtenerDatosHashtag(resultado: ResultadoXCalculado, hashtagId: string): HashtagCalculado | undefined {
    return resultado.hashtags.find(h => h.id === hashtagId);
  }


  static obtenerListaHashtags(resultado: ResultadoXCalculado): Array<{id: string, nombre: string}> {
    return resultado.hashtags.map(h => ({
      id: h.id,
      nombre: h.nombre
    }));
  }


  static obtenerHashtagMasViral(resultado: ResultadoXCalculado): HashtagCalculado | null {
    if (resultado.hashtags.length === 0) return null;
    let mejorHashtag = resultado.hashtags[0];
    let mejorPromedio = 0;
    
    resultado.hashtags.forEach(hashtag => {
      const promedioViralidad = hashtag.datosViralidad.reduce((sum, dato) => sum + dato.tasa, 0) / hashtag.datosViralidad.length;
      if (promedioViralidad > mejorPromedio) {
        mejorPromedio = promedioViralidad;
        mejorHashtag = hashtag;
      }
    });
    
    return mejorHashtag;
  }

  static detectarTendencias(resultado: ResultadoXCalculado): Array<{hashtag: string, tendencia: 'subiendo' | 'bajando' | 'estable'}> {
    return resultado.hashtags.map(hashtag => {
      const datos = hashtag.datosInteraccion;
      if (datos.length < 2) return { hashtag: hashtag.nombre, tendencia: 'estable' as const };
      
      const primeraMitad = datos.slice(0, Math.floor(datos.length / 2));
      const segundaMitad = datos.slice(Math.floor(datos.length / 2));
      
      const promedioPrimera = primeraMitad.reduce((sum, d) => sum + d.tasa, 0) / primeraMitad.length;
      const promedioSegunda = segundaMitad.reduce((sum, d) => sum + d.tasa, 0) / segundaMitad.length;
      
      const diferencia = promedioSegunda - promedioPrimera;
      const umbral = 0.1; 
      
      if (diferencia > umbral) return { hashtag: hashtag.nombre, tendencia: 'subiendo' as const };
      if (diferencia < -umbral) return { hashtag: hashtag.nombre, tendencia: 'bajando' as const };
      return { hashtag: hashtag.nombre, tendencia: 'estable' as const };
    });
  }
}

export default CalculosX;
export type { 
  HashtagXData, 
  XDataInput, 
  ResultadoXCalculado,
  HashtagCalculado,
  DatoCalculado 
};