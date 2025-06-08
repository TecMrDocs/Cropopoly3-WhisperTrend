// CalculosInstagram.ts


// Tipos de entrada (formato JSON limpio)
interface HashtagInstagramData {
  hashtag: string;
  id: string;
  fechas: string[];
  likes: number[];
  comentarios: number[];
  vistas: number[];
  seguidores: number[];
  compartidos: number[];
}

interface InstagramDataInput {
  hashtags: HashtagInstagramData[];
}

// 📈 Tipos de salida (resultados calculados)
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
    comentarios: number[];
    vistas: number[];
    seguidores: number[];
    compartidos: number[];
  };
}

interface ResultadoInstagramCalculado {
  plataforma: string;
  emoji: string;
  color: string;
  hashtags: HashtagCalculado[];
  hashtag: string;
  datosInteraccion: DatoCalculado[];
  datosViralidad: DatoCalculado[];
  datosRaw: any;
}

class CalculosInstagram {
  
  static procesarDatos(inputData: InstagramDataInput): ResultadoInstagramCalculado {
    console.log('📸 Iniciando cálculos para Instagram...');
    const hashtagsProcesados = inputData.hashtags.map(hashtag => 
      this.procesarHashtag(hashtag)
    );

    const resultado: ResultadoInstagramCalculado = {
      plataforma: "Instagram",
      emoji: "📸", 
      color: "#16a34a",
      hashtags: hashtagsProcesados,
      hashtag: inputData.hashtags[0]?.hashtag || "#EcoFriendly",
      datosInteraccion: hashtagsProcesados[0]?.datosInteraccion || [],
      datosViralidad: hashtagsProcesados[0]?.datosViralidad || [],
      datosRaw: hashtagsProcesados[0]?.datosRaw || {}
    };

    console.log(`✅ Instagram: ${hashtagsProcesados.length} hashtags procesados`);
    return resultado;
  }


  private static procesarHashtag(hashtagData: HashtagInstagramData): HashtagCalculado {
    if (!hashtagData.fechas || hashtagData.fechas.length === 0) {
      return this.crearHashtagVacio(hashtagData);
    }

    // Calcular métricas
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
        comentarios: hashtagData.comentarios,
        vistas: hashtagData.vistas,
        seguidores: hashtagData.seguidores,
        compartidos: hashtagData.compartidos
      }
    };
  }

  /**
   * Fórmula: (Likes + Comentarios + Compartidos) / Vistas * 100
   */
  private static calcularTasaInteraccion(data: HashtagInstagramData): DatoCalculado[] {
    return data.fechas.map((fecha, i) => {
      const likes = data.likes[i] || 0;
      const comentarios = data.comentarios[i] || 0;
      const compartidos = data.compartidos[i] || 0;
      const vistas = data.vistas[i] || 1; // Evitar división por 0
      
      const totalInteracciones = likes + comentarios + compartidos;
      const tasa = vistas > 0 ? (totalInteracciones / vistas) * 100 : 0;
      
      return {
        fecha,
        tasa: parseFloat(tasa.toFixed(2))
      };
    });
  }

  /**
  Fórmula: (Likes + Comentarios + Compartidos) / Seguidores * 100
   */
  private static calcularTasaViralidad(data: HashtagInstagramData): DatoCalculado[] {
    return data.fechas.map((fecha, i) => {
      const likes = data.likes[i] || 0;
      const comentarios = data.comentarios[i] || 0;
      const compartidos = data.compartidos[i] || 0;
      const seguidores = data.seguidores[i] || 1; // Evitar división por 0
      
      const totalInteracciones = likes + comentarios + compartidos;
      const tasa = seguidores > 0 ? (totalInteracciones / seguidores) * 100 : 0;
      
      return {
        fecha,
        tasa: parseFloat(tasa.toFixed(2))
      };
    });
  }


  private static validarDatos(data: HashtagInstagramData): boolean {
    if (!data.fechas || data.fechas.length === 0) return false;
    if (!data.likes || !data.comentarios || !data.vistas || !data.seguidores) return false;
    
    const longitud = data.fechas.length;
    return (
      data.likes.length === longitud &&
      data.comentarios.length === longitud &&
      data.vistas.length === longitud &&
      data.seguidores.length === longitud &&
      data.compartidos.length === longitud
    );
  }

  private static crearHashtagVacio(hashtagData: HashtagInstagramData): HashtagCalculado {
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
        comentarios: datosVacios,
        vistas: datosVacios,
        seguidores: datosVacios,
        compartidos: datosVacios
      }
    };
  }


  static obtenerDatosHashtag(resultado: ResultadoInstagramCalculado, hashtagId: string): HashtagCalculado | undefined {
    return resultado.hashtags.find(h => h.id === hashtagId);
  }

  static obtenerListaHashtags(resultado: ResultadoInstagramCalculado): Array<{id: string, nombre: string}> {
    return resultado.hashtags.map(h => ({
      id: h.id,
      nombre: h.nombre
    }));
  }
}

export default CalculosInstagram;
export type { 
  HashtagInstagramData, 
  InstagramDataInput, 
  ResultadoInstagramCalculado,
  HashtagCalculado,
  DatoCalculado 
};