import React, { useState, useMemo } from 'react';
import {LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid,} from 'recharts';

const calcularCorrelacion = (datos: any[]): number => {
  if (!datos || datos.length === 0) return 0;
  const tasas = datos.map(d => d.tasa || 0);
  const promedio = tasas.reduce((sum, val) => sum + val, 0) / tasas.length;
  let tendenciaPositiva = 0;
  for (let i = 1; i < tasas.length; i++) {
    if (tasas[i] > tasas[i-1]) tendenciaPositiva++;
  }

  const factorTendencia = (tendenciaPositiva / (tasas.length - 1)) * 100;
  const factorPromedio = Math.min(promedio * 10, 100);
  const correlacion = Math.round((factorTendencia * 0.6 + factorPromedio * 0.4));
  
  return Math.min(Math.max(correlacion, 45), 95);
};

// Componente de Consolidación extraído de MenuComponentes para usarlo independientemente
const Consolidacion = ({ datosDelSistema, cargandoDatos }: { datosDelSistema: any, cargandoDatos?: boolean }) => {
  const [seleccionadas, setSeleccionadas] = useState<string[]>(['insta']); // Por defecto muestra Instagram
  
  // 🆕 CAMBIO: Usar datos reales del sistema
  const hashtagsDinamicos = useMemo(() => {
    console.log('🔍 DEBUG - cargandoDatos:', cargandoDatos);
    console.log('🔍 DEBUG - datosDelSistema:', datosDelSistema);

    // Si está cargando o no hay datos, mostrar mensaje
    if (cargandoDatos || !datosDelSistema) {
      console.log('🔍 DEBUGGING - Mostrando cargando');

      return [
        { id: 'cargando', nombre: 'Cargando...', correlacion: 0, color: '#gray', datos: { interaccion: [] } }
      ];
    }

    console.log('🔍 DEBUGGING - Hashtags originales:', datosDelSistema.metadatos.hashtagsOriginales);

    // Usar datos reales del sistema
    return datosDelSistema.metadatos.hashtagsOriginales.map((hashtag: any, index:any) => {
      console.log('🔍 PROCESANDO HASHTAG:', hashtag);

      // Calcular correlación promedio de todas las plataformas
      let totalCorrelacion = 0;
      let contador = 0;
      
      ['resultadoInstaCalc', 'resultadoRedditCalc', 'resultadoXCalc'].forEach(plataforma => {
        const hashtagData = datosDelSistema[plataforma]?.hashtags?.find((h: any) => h.nombre === hashtag);
        if (hashtagData) {
          const promedioInt = hashtagData.datosInteraccion.reduce((sum: any, d:any) => sum + d.tasa, 0) / hashtagData.datosInteraccion.length;
          const promedioVir = hashtagData.datosViralidad.reduce((sum:any, d:any) => sum + d.tasa, 0) / hashtagData.datosViralidad.length;
          totalCorrelacion += (promedioInt + promedioVir) / 2;
          contador++;
        }
      });
      
      const correlacion = contador > 0 ? Math.round(totalCorrelacion / contador) : 0;
      const colores = ['#16a34a', '#3b82f6', '#94a3b8', '#e91e63', '#8b5cf6'];
      
      // 🆕 USAR DATOS REALES PARA LA GRÁFICA
      const datosInteraccion = datosDelSistema.resultadoInstaCalc.hashtags.find((h:any) => h.nombre === hashtag)?.datosInteraccion || [];
      
      return {
        id: hashtag.replace(/[^a-zA-Z0-9]/g, '').toLowerCase(),
        nombre: hashtag,
        correlacion,
        color: colores[index % colores.length],
        datos: {
          interaccion: datosInteraccion  // 🆕 DATOS REALES
        }
      };
    });
  }, [datosDelSistema, cargandoDatos]);

  // Función para alternar selección de una calculadora
  const toggleSeleccion = (hashtagId: string) => {
    setSeleccionadas((prev) =>
      prev.includes(hashtagId) ? prev.filter((x) => x !== hashtagId) : [...prev, hashtagId].slice(-3) // máximo 3
    );
  };

const combinarDatosInteraccion = () => {
   if (!datosDelSistema) return [];
   
   const todasFechas = Array.from(
     new Set(
       seleccionadas.flatMap(
         (id) => {
           const hashtag = hashtagsDinamicos.find((h:any) => h.id === id);
           return hashtag?.datos?.interaccion?.map((d: any) => d.fecha) || [];
         }
       )
     )
   );

   const datosCombinados = todasFechas.map((fecha) => {
     const item: any = { fecha };
     seleccionadas.forEach((id) => {
       const hashtag = hashtagsDinamicos.find((h:any) => h.id === id);
       const dato = hashtag?.datos?.interaccion?.find((d: any) => d.fecha === fecha);
       item[id] = dato ? dato.tasa : 0;
     });
     return item;
   });

   // ✅ AGREGAR ESTA PARTE AL FINAL
   const ordenMeses: Record<string, number> = {
     'Ene': 1, 'Feb': 2, 'Mar': 3, 'Abr': 4, 'May': 5, 'Jun': 6,
     'Jul': 7, 'Ago': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dic': 12
   };

   return datosCombinados.sort((a, b) => {
     const mesA = a.fecha.split(' ')[0];
     const mesB = b.fecha.split(' ')[0];
     return (ordenMeses[mesA] || 0) - (ordenMeses[mesB] || 0);
   });
 };

 const datosCombinados = combinarDatosInteraccion();

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-xl font-bold text-navy-900 mb-4">🔥 Consolidación DINÁMICA de Hashtags</h2>

      {/* Botones tipo bolitas para seleccionar hashtags */}
      <div className="flex gap-4 justify-center mb-6 flex-wrap">
        {hashtagsDinamicos.map((hashtag:any) => (
          <div
            key={hashtag.id}
            onClick={() => toggleSeleccion(hashtag.id)}
            className={`w-12 h-12 rounded-full cursor-pointer flex items-center justify-center font-bold select-none text-xs text-center
              ${seleccionadas.includes(hashtag.id) ? 'text-white' : 'text-gray-600'}`}
            style={{ backgroundColor: seleccionadas.includes(hashtag.id) ? hashtag.color : '#ddd' }}
            title={`${hashtag.nombre} - ${hashtag.correlacion}%`}
          >
            {hashtag.id.slice(1, 3).toUpperCase()}
          </div>
        ))}
      </div>

      {/* Gráfica combinada que muestra las tendencias seleccionadas */}
      <div className="w-full h-96">
        <ResponsiveContainer>
          <LineChart data={datosCombinados} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid stroke="#ccc" strokeDasharray="3 3" />
            <XAxis dataKey="fecha" />
            <YAxis domain={[0, 'dataMax']} tickFormatter={(value) => `${value}%`} />
            <Tooltip formatter={(value) => `${value}%`} />
            <Legend />
            {seleccionadas.map((id) => {
              const hashtag = hashtagsDinamicos.find((h:any) => h.id === id);
              return (
                <Line
                  key={id}
                  type="monotone"
                  dataKey={id}
                  stroke={hashtag?.color || '#000'}
                  name={hashtag?.nombre || id}
                  activeDot={{ r: 8 }}
                  strokeWidth={3}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

type MenuComponentesProps = {
  modoVisualizacion: 'original' | 'logaritmo' | 'normalizado';
  setModoVisualizacion: React.Dispatch<React.SetStateAction<'original' | 'logaritmo' | 'normalizado'>>;
  setHashtagSeleccionado: React.Dispatch<React.SetStateAction<string>>;
  onSeleccionItem: (itemId: string) => void;
  onEcoFriendlyClick: () => void;
  hashtagSeleccionado: string;
  onTasasSeleccionadas?: (tasasIds: string[]) => void;
  onHashtagsNoticiasSeleccionados?: (hashtagsIds: string[]) => void;
  datosDelSistema?: any;     
  cargandoDatos?: boolean;   
};

const MenuComponentes: React.FC<MenuComponentesProps> = ({ 
  setModoVisualizacion, 
  setHashtagSeleccionado,
  onSeleccionItem,
  hashtagSeleccionado,
  onTasasSeleccionadas,
  onHashtagsNoticiasSeleccionados,
  datosDelSistema,
  cargandoDatos
}) => {
  
  // ✅ FUNCIÓN PARA GENERAR OPCIONES DE TASAS - AHORA DENTRO DEL COMPONENTE
  const generarOpcionesTasas = () => {
    if (!datosDelSistema) return [];
    
    const calculadoras = [
      { 
        id: 'insta', 
        nombre: 'Instagram', 
        resultado: datosDelSistema.resultadoInstaCalc,
        plataforma: datosDelSistema.resultadoInstaCalc.emoji || '📸',
        colorInteraccion: '#e91e63',
        colorViralidad: '#f06292'
      },
      { 
        id: 'x', 
        nombre: 'X (Twitter)', 
        resultado: datosDelSistema.resultadoXCalc,
        plataforma: datosDelSistema.resultadoXCalc.emoji || '🐦',
        colorInteraccion: '#dc2626',
        colorViralidad: '#f97316'
      },
      {
        id: 'reddit',
        nombre: 'Reddit', 
        resultado: datosDelSistema.resultadoRedditCalc,
        plataforma: datosDelSistema.resultadoRedditCalc.emoji || '🔴',
        colorInteraccion: '#2563eb',
        colorViralidad: '#06b6d4'
      }
    ];

    const opcionesTasas: any[] = [];

    calculadoras.forEach((calc) => {
      if (calc.resultado.hashtags && Array.isArray(calc.resultado.hashtags)) {
        calc.resultado.hashtags.forEach((hashtag: any) => {
          opcionesTasas.push({
            id: `int_${calc.id}_${hashtag.id}`,
            nombre: `Tasa de interacción ${calc.plataforma} ${hashtag.nombre}`,
            correlacion: calcularCorrelacion(hashtag.datosInteraccion),
            color: calc.colorInteraccion,
            datos: hashtag.datosInteraccion,
            plataforma: calc.nombre,
            hashtag: hashtag.nombre,
            hashtagId: hashtag.id
          });

          opcionesTasas.push({
            id: `vir_${calc.id}_${hashtag.id}`,
            nombre: `Tasa de viralidad ${calc.plataforma} ${hashtag.nombre}`,
            correlacion: calcularCorrelacion(hashtag.datosViralidad),
            color: calc.colorViralidad,
            datos: hashtag.datosViralidad,
            plataforma: calc.nombre,
            hashtag: hashtag.nombre,
            hashtagId: hashtag.id
          });
        });
      } else {
        opcionesTasas.push({
          id: `int_${calc.id}`,
          nombre: `Tasa de interacción ${calc.plataforma} ${calc.resultado.hashtag}`,
          correlacion: calcularCorrelacion(calc.resultado.datosInteraccion),
          color: calc.colorInteraccion,
          datos: calc.resultado.datosInteraccion,
          plataforma: calc.nombre
        });

        opcionesTasas.push({
          id: `vir_${calc.id}`,
          nombre: `Tasa de viralidad ${calc.plataforma} ${calc.resultado.hashtag}`,
          correlacion: calcularCorrelacion(calc.resultado.datosViralidad),
          color: calc.colorViralidad,
          datos: calc.resultado.datosViralidad,
          plataforma: calc.nombre
        });
      }
    });

    return opcionesTasas;
  };

  // ✅ FUNCIÓN PARA OBTENER TASAS POR HASHTAG - AHORA DENTRO DEL COMPONENTE
  const obtenerTasasPorHashtag = (hashtagId: string): string[] => {
    if (!datosDelSistema) {
      console.warn("❌ No hay datos del sistema disponibles");
      return [];
    }

    const ids: string[] = [];
    
    // Buscar en Instagram
    const hashtagInsta = datosDelSistema.resultadoInstaCalc?.hashtags?.find((h: any) => h.nombre === hashtagId);
    if (hashtagInsta) {
      console.log(`✅ Encontrado en Instagram: ${hashtagId} -> ${hashtagInsta.id}`);
      ids.push(`int_insta_${hashtagInsta.id}`, `vir_insta_${hashtagInsta.id}`);
    }
    
    // Buscar en Reddit  
    const hashtagReddit = datosDelSistema.resultadoRedditCalc?.hashtags?.find((h: any) => h.nombre === hashtagId);
    if (hashtagReddit) {
      console.log(`✅ Encontrado en Reddit: ${hashtagId} -> ${hashtagReddit.id}`);
      ids.push(`int_reddit_${hashtagReddit.id}`, `vir_reddit_${hashtagReddit.id}`);
    }
    
    // Buscar en X
    const hashtagX = datosDelSistema.resultadoXCalc?.hashtags?.find((h: any) => h.nombre === hashtagId);
    if (hashtagX) {
      console.log(`✅ Encontrado en X: ${hashtagId} -> ${hashtagX.id}`);
      ids.push(`int_x_${hashtagX.id}`, `vir_x_${hashtagX.id}`);
    }
    
    console.log("✅ IDs encontrados dinámicamente:", ids);
    return ids;
  };
  
  // 🔧 HASHTAGS DINÁMICOS ACTUALIZADOS - USAR DATOS DEL SISTEMA
  const hashtagsDinamicos = useMemo(() => {
    console.log('🔍 DEBUG - cargandoDatos:', cargandoDatos);
    console.log('🔍 DEBUG - datosDelSistema:', datosDelSistema);
    // Si está cargando o no hay datos, mostrar mensaje
    if (cargandoDatos || !datosDelSistema) {
      return [
        { id: 'cargando', nombre: 'Cargando...', correlacion: 0, color: '#gray' }
      ];
    }

    // Usar datos reales del sistema
    return datosDelSistema.metadatos.hashtagsOriginales.map((hashtag: any, index: any) => {
      // Calcular correlación promedio de todas las plataformas
      let totalCorrelacion = 0;
      let contador = 0;
      
      ['resultadoInstaCalc', 'resultadoRedditCalc', 'resultadoXCalc'].forEach(plataforma => {
        const hashtagData = datosDelSistema[plataforma]?.hashtags?.find((h: any) => h.nombre === hashtag);
        if (hashtagData) {
          const promedioInt = hashtagData.datosInteraccion.reduce((sum: any, d: any) => sum + d.tasa, 0) / hashtagData.datosInteraccion.length;
          const promedioVir = hashtagData.datosViralidad.reduce((sum: any, d: any) => sum + d.tasa, 0) / hashtagData.datosViralidad.length;
          totalCorrelacion += (promedioInt + promedioVir) / 2;
          contador++;
        }
      });
      
      const correlacion = contador > 0 ? Math.round(totalCorrelacion / contador) : 0;
      const colores = ['#16a34a', '#3b82f6', '#94a3b8', '#e91e63', '#8b5cf6'];
      
      return {
        id: hashtag.replace(/[^a-zA-Z0-9]/g, '').toLowerCase(),
        nombre: hashtag,
        correlacion,
        color: colores[index % colores.length],
        datos: {
          interaccion: datosDelSistema.resultadoInstaCalc.hashtags.find((h: any) => h.nombre === hashtag)?.datosInteraccion || []
        }
      };
    });
  }, [datosDelSistema, cargandoDatos]);

  // 🆕 NOTICIAS DINÁMICAS - USAR DATOS REALES DEL SISTEMA
  const noticiasDinamicas = useMemo(() => {
    if (cargandoDatos || !datosDelSistema || !datosDelSistema.noticias) {
      return [
        { id: 'cargando', titulo: 'Cargando noticias...', correlacion: 0, color: '#gray' }
      ];
    }

    // Usar noticias reales del sistema
    return datosDelSistema.noticias.map((noticia: any, index: number) => {
      // Calcular correlación simulada basada en keywords
      const correlacionBase = 60 + (index * 8); // Valores entre 60-84%
      const coloresNoticias = ['#9333ea', '#f59e0b', '#059669']; // Púrpura, ámbar, verde
      
      return {
        id: `noticia_${index}`,
        titulo: noticia.title,
        descripcion: noticia.description,
        url: noticia.url,
        keywords: noticia.keywords,
        correlacion: correlacionBase,
        color: coloresNoticias[index % coloresNoticias.length]
      };
    });
  }, [datosDelSistema, cargandoDatos]);

  const opcionesTasas = useMemo(() => generarOpcionesTasas(), [datosDelSistema]);
  
  // Estado para controlar la visibilidad del componente de Consolidación
  const [mostrarConsolidacion, setMostrarConsolidacion] = useState<boolean>(false);
  // Estado para controlar la visualización del desglose de tasas
  const [mostrarDesgloseTasas, setMostrarDesgloseTasas] = useState<boolean>(false);
  // Estado para controlar la visualización del desglose de hashtags de noticias
  const [mostrarDesgloseNoticias, setMostrarDesgloseNoticias] = useState<boolean>(false);
  // Estado para guardar las tasas seleccionadas - ACTUALIZADO CON NUEVOS IDs
  const [tasasSeleccionadas, setTasasSeleccionadas] = useState<string[]>(['int_insta_eco']); // Por defecto Instagram EcoFriendly
  // Estado para guardar los hashtags de noticias seleccionados
  const [hashtagsNoticiasSeleccionados, setHashtagsNoticiasSeleccionados] = useState<string[]>(['pielesSinteticas']);

  const hashtagsDinamicosLista = datosDelSistema?.metadatos?.hashtagsOriginales || [];

  // 🆕 FUNCIÓN DINÁMICA PARA OBTENER ÍCONO DEL HASHTAG
  const getIconoHashtag = (nombre: string): string => {
    const nombreLower = nombre.toLowerCase();
    if (nombreLower.includes('eco') || nombreLower.includes('green') || nombreLower.includes('verde')) return '🌱';
    if (nombreLower.includes('sustain') || nombreLower.includes('recicl') || nombreLower.includes('reciclados')) return '♻️';
    if (nombreLower.includes('material') || nombreLower.includes('nuevo') || nombreLower.includes('innovation')) return '🧪';
    if (nombreLower.includes('moda') || nombreLower.includes('fashion')) return '👗';
    if (nombreLower.includes('friendly')) return '🌿';
    return '📈'; // Ícono por defecto
  };

const handleItemClick = (itemId: string, nuevoModo?: 'original' | 'logaritmo' | 'normalizado') => {
    console.log("🔍 CLICK en item:", itemId);
    
    // 🆕 Verificar si es una noticia
    if (itemId.startsWith('noticia_')) {
      console.log("📰 Es una noticia:", itemId);
      setHashtagSeleccionado(itemId);
      setMostrarDesgloseNoticias(true);
      setMostrarDesgloseTasas(false);
      setMostrarConsolidacion(false);
      onSeleccionItem(itemId);
      return;
    }

    console.log("🔍 Lista disponible:", hashtagsDinamicosLista);

    // 🔧 Buscar el hashtag que coincida (ignorando # y mayúsculas/minúsculas)
    const hashtagEncontrado = hashtagsDinamicosLista.find((hashtag: any) => 
      hashtag.replace('#', '').toLowerCase() === itemId.toLowerCase()
    );

    if (hashtagEncontrado) {
      console.log("🔍 Hashtag encontrado:", hashtagEncontrado);
      
      setHashtagSeleccionado(hashtagEncontrado); // Usar el hashtag correcto
      setMostrarDesgloseTasas(true);
      setMostrarDesgloseNoticias(false);
      setMostrarConsolidacion(false);
      
      // 🚀 NUEVO: Cambiar las tasas seleccionadas al hashtag correspondiente
      const nuevasTasas = obtenerTasasPorHashtag(hashtagEncontrado);
      console.log("MenuComponentes: Nuevas tasas para", hashtagEncontrado, ":", nuevasTasas);
      
      setTasasSeleccionadas(nuevasTasas);
      
      // IMPORTANTE: Notificar al componente padre sobre las nuevas tasas seleccionadas
      if (onTasasSeleccionadas) {
        onTasasSeleccionadas(nuevasTasas);
      }
      
      // Llamar a la función del padre para actualizar la visualización
      onSeleccionItem(hashtagEncontrado);
      return; // Salir temprano para evitar ocultar la gráfica
    } 
    else {
      setHashtagSeleccionado(itemId);
      setMostrarDesgloseTasas(false);
      setMostrarDesgloseNoticias(false);
      
      if (nuevoModo) {
        setModoVisualizacion(nuevoModo);
      }
    }
    
    // Ocultar la consolidación cuando se selecciona un elemento específico
    setMostrarConsolidacion(false);
    
    // Llamar a la función del padre para actualizar la visualización
    onSeleccionItem(itemId);
  };

  // Función para manejar toggle de tasas con callback al padre
  const handleTasaToggle = (tasaId: string) => {
    console.log("🔍 TOGGLE - Tasa clickeada:", tasaId);
    console.log("🔍 TOGGLE - Estado actual:", tasasSeleccionadas);
    
    setTasasSeleccionadas(prev => {
      let nuevaSeleccion;
      if (prev.includes(tasaId)) {
        console.log("🔍 TOGGLE - Deseleccionando tasa");
        nuevaSeleccion = prev.filter(id => id !== tasaId);
        if (nuevaSeleccion.length === 0) {
          console.log("🔍 TOGGLE - No se permite selección vacía");
          return prev; // No permitir selección vacía
        }
      } else {
        console.log("🔍 TOGGLE - Seleccionando tasa");
        nuevaSeleccion = [...prev, tasaId];
      }
      
      console.log("🔍 TOGGLE - Nueva selección:", nuevaSeleccion);
      
      // Llamar al callback del padre
      if (onTasasSeleccionadas) {
        onTasasSeleccionadas(nuevaSeleccion);
      }
      
      return nuevaSeleccion;
    });
  };

  // Efectos para notificar al padre cuando cambian las selecciones
  React.useEffect(() => {
    if (onTasasSeleccionadas) {
      onTasasSeleccionadas(tasasSeleccionadas);
    }
  }, [tasasSeleccionadas, onTasasSeleccionadas]);

  React.useEffect(() => {
    if (onHashtagsNoticiasSeleccionados) {
      onHashtagsNoticiasSeleccionados(hashtagsNoticiasSeleccionados);
    }
  }, [hashtagsNoticiasSeleccionados, onHashtagsNoticiasSeleccionados]);

  const isActive = (value: string) => value === hashtagSeleccionado;

  const getButtonStyle = (value: string) => {
    return isActive(value)
      ? "px-4 py-1 bg-blue-700 text-white rounded-full shadow-md font-semibold"
      : "px-4 py-1 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition";
  };

  const getCircleStyle = (item: any) => {
    const baseStyle = "w-6 h-6 rounded-full mr-3 cursor-pointer";
    
    if (isActive(item.id || item.nombre)) {
      return `${baseStyle} ring-2 ring-offset-2 ring-blue-500`;
    }
    
    return baseStyle;
  };

  return (
    <div className="w-full h-full mx-auto rounded-3xl overflow-hidden border border-gray-200 bg-white">
      <div className="p-6 bg-white">

        <div className="mb-6 p-4 border rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50">
          <h2 className="text-xl font-bold text-navy-900">Ventas</h2>
          <div className="mt-3 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div
                  className={`${getCircleStyle({ id: 'Ventas' })} bg-blue-600`}
                  onClick={() => handleItemClick('Ventas', 'original')}
                ></div>
<span className={`text-gray-800 font-medium ${isActive('Ventas') ? 'font-bold' : ''}`}>
  Ventas de {datosDelSistema?.resource_name || 'Producto'}
</span>
              </div>
              <button
                className={getButtonStyle('Ventas')}
                onClick={() => handleItemClick('Ventas')}
              >
                Ver más
              </button>
            </div>
          </div>
        </div>

        {!mostrarDesgloseTasas && !mostrarDesgloseNoticias && !mostrarConsolidacion && (
          <div className="mb-6 p-4 border rounded-xl bg-gradient-to-r from-green-50 to-emerald-50">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-xl font-bold text-navy-900">🚀 Hashtags</h2>
              </div>
            </div>
            <div className="mt-3 space-y-4">

              {hashtagsDinamicos
                .sort((a: any, b: any) => b.correlacion - a.correlacion) // Ordenar por correlación
                .map((hashtag:any) => (
                <div key={hashtag.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div
                      className={getCircleStyle(hashtag)}
                      style={{ backgroundColor: hashtag.color }}
                      onClick={() => handleItemClick(hashtag.id)}
                    ></div>
                    <span className={`text-gray-800 ${isActive(hashtag.id) ? 'font-bold' : 'font-medium'}`}>
                      {hashtag.nombre} - Relación con la búsqueda: {hashtag.correlacion}%
                    </span>
                  </div>
                  <button
                    className={getButtonStyle(hashtag.id)}
                    onClick={() => handleItemClick(hashtag.id)}
                  >
                    Ver más
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {mostrarDesgloseTasas && (
          <div className="mb-6 p-4 border rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-blue-700">🔍 Desglose dinámico de tasas</h2>
              <button
                className="px-4 py-2 bg-gray-500 text-white rounded-full hover:bg-gray-600 transition font-medium"
                onClick={() => {
                  setMostrarDesgloseTasas(false);
                  setHashtagSeleccionado('');
                  onSeleccionItem(''); 
                }}
              >
                Regresar
              </button>
            </div>
            
            <div className="space-y-6">
              {(() => {
                const tasasDelHashtagActual = opcionesTasas.filter(tasa => {
                  return tasa.hashtag === hashtagSeleccionado;
                });

                console.log("🔍 RENDER - tasasSeleccionadas:", tasasSeleccionadas);
                console.log("🔍 RENDER - tasasDelHashtagActual:", tasasDelHashtagActual);

               if (tasasDelHashtagActual.length === 0) {
                  return <div className="text-gray-500">No se encontraron tasas para {hashtagSeleccionado}</div>;
                }
                
                // 🆕 DINÁMICO: Buscar el hashtag en los datos del sistema
                const hashtagActual = hashtagSeleccionado;
                const hashtagData = hashtagsDinamicos.find((h: any) => h.nombre === hashtagActual);
                const hashtagColor = hashtagData ? 'text-gray-700' : 'text-gray-700'; // Color del texto
                const hashtagIcon = getIconoHashtag(hashtagActual); // Ícono dinámico
                
                return (
                  <div key={hashtagActual}>
                    <h3 className={`text-lg font-semibold ${hashtagColor} mb-3 flex items-center`}>
                      {hashtagIcon} {hashtagActual}
                    </h3>
                    <div className="grid grid-cols-1 gap-2 ml-4">
                      {tasasDelHashtagActual.map((tasa) => (
                        <label key={tasa.id} className="flex items-center space-x-3 cursor-pointer hover:bg-blue-50 p-2 rounded-lg transition">
                          <input
                            type="checkbox"
                            checked={tasasSeleccionadas.includes(tasa.id)}
                            onChange={() => handleTasaToggle(tasa.id)}
                            className="hidden"
                          />
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
                              tasasSeleccionadas.includes(tasa.id) 
                                ? 'border-transparent' 
                                : 'border-gray-300'
                            }`}
                            style={{ 
                              backgroundColor: tasasSeleccionadas.includes(tasa.id) ? tasa.color : 'transparent'
                            }}
                          >
                            {tasasSeleccionadas.includes(tasa.id) && (
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            )}
                          </div>
                          <span className="text-gray-800 font-medium text-sm">
                            {tasa.nombre}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
            
            <div className="mt-6 p-3 bg-blue-100 rounded-lg">
              <div className="text-sm text-blue-800">
                <strong>📊 Estadísticas para {hashtagSeleccionado}:</strong>
                <div className="mt-1 grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium">Hashtag actual:</span> {hashtagSeleccionado}
                  </div>
                  <div>
                    <span className="font-medium">Tasas disponibles:</span> {opcionesTasas.filter(t => t.hashtag === hashtagSeleccionado).length}
                  </div>
                  <div>
                    <span className="font-medium">Seleccionadas:</span> {tasasSeleccionadas.length}
                  </div>
                  <div>
                    <span className="font-medium">Plataformas:</span> {Array.from(new Set(opcionesTasas.filter(t => t.hashtag === hashtagSeleccionado).map(t => t.plataforma))).length}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {mostrarDesgloseNoticias && (
          <div className="mb-6 p-4 border rounded-xl bg-gradient-to-r from-purple-50 to-pink-50">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-bold text-navy-900">📰 Detalles de la Noticia</h2>
              <button
                className="px-4 py-1 bg-gray-500 text-white rounded-full hover:bg-gray-600 transition"
                onClick={() => {
                  setMostrarDesgloseNoticias(false);
                  setHashtagSeleccionado('');
                  onSeleccionItem('');
                }}
              >
                Regresar
              </button>
            </div>
            
            {(() => {
              const noticiaSeleccionada = noticiasDinamicas.find((n: any) => n.id === hashtagSeleccionado);
              if (!noticiaSeleccionada) {
                return <div className="text-gray-500">Noticia no encontrada</div>;
              }
              
              return (
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg border">
                    <h3 className="text-lg font-bold text-gray-800 mb-2">
                      {noticiaSeleccionada.titulo}
                    </h3>
                    <p className="text-gray-600 mb-3">
                      {noticiaSeleccionada.descripcion}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-2">
                        {noticiaSeleccionada.keywords.map((keyword: string, index: number) => (
                          <span 
                            key={index}
                            className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium"
                          >
                            #{keyword}
                          </span>
                        ))}
                      </div>
                      <span className="text-sm font-medium text-purple-600">
                        Correlación: {noticiaSeleccionada.correlacion}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <div className="text-sm text-purple-800">
                      <strong>🔗 URL:</strong> 
                      <a 
                        href={noticiaSeleccionada.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="ml-2 text-purple-600 hover:underline"
                      >
                        {noticiaSeleccionada.url}
                      </a>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {!mostrarDesgloseTasas && !mostrarDesgloseNoticias && !mostrarConsolidacion && (
          <div className="mb-6 p-4 border rounded-xl bg-gradient-to-r from-purple-50 to-pink-50">
            <h2 className="text-xl font-bold text-navy-900">📰 Noticias</h2>
            <div className="mt-3 space-y-4">
              {noticiasDinamicas.map((noticia: any) => (
                <div key={noticia.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div
                      className={`${getCircleStyle({ id: noticia.id })} bg-purple-500`}
                      style={{ backgroundColor: noticia.color }}
                      onClick={() => handleItemClick(noticia.id, 'original')}
                    ></div>
                    <div className="flex-1">
                      <span className={`text-gray-800 ${isActive(noticia.id) ? 'font-bold' : 'font-medium'} block`}>
                        {noticia.titulo}
                      </span>
                      <span className="text-xs text-gray-500">
                        Correlación: {noticia.correlacion}%
                      </span>
                    </div>
                  </div>
                  <button
                    className={getButtonStyle(noticia.id)}
                    onClick={() => handleItemClick(noticia.id)}
                  >
                    Ver más
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {mostrarConsolidacion && (
          <div className="mt-6 border-t pt-6">
            <Consolidacion datosDelSistema={datosDelSistema} cargandoDatos={cargandoDatos} />
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuComponentes;