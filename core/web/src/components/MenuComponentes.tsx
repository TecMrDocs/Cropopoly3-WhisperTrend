import React, { useState, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid,
} from 'recharts';

// Importamos los resultados de las calculadoras (¡CON LOS HASHTAGS!)
import { resultadoXCalc } from '../mathCalculus/XCalc';
import { resultadoRedditCalc } from '../mathCalculus/RedditCalc';
import { resultadoInstaCalc } from '../mathCalculus/InstaCalc';

// 🔥 FUNCIÓN DIABÓLICA QUE CALCULA CORRELACIONES AUTOMÁTICAMENTE
const calcularCorrelacion = (datos: any[]): number => {
  // Simulamos correlación basada en tendencia de los datos
  if (!datos || datos.length === 0) return 0;
  
  const tasas = datos.map(d => d.tasa || 0);
  const promedio = tasas.reduce((sum, val) => sum + val, 0) / tasas.length;
  
  // Calculamos variabilidad y tendencia
  let tendenciaPositiva = 0;
  for (let i = 1; i < tasas.length; i++) {
    if (tasas[i] > tasas[i-1]) tendenciaPositiva++;
  }
  
  // Fórmula mágica de correlación 😈
  const factorTendencia = (tendenciaPositiva / (tasas.length - 1)) * 100;
  const factorPromedio = Math.min(promedio * 10, 100);
  const correlacion = Math.round((factorTendencia * 0.6 + factorPromedio * 0.4));
  
  return Math.min(Math.max(correlacion, 45), 95); // Entre 45% y 95%
};

// 🎨 COLORES AUTOMÁTICOS PARA CADA HASHTAG
const coloresHashtags = ['#16a34a', '#3b82f6', '#94a3b8', '#e91e63', '#8b5cf6', '#f59e0b'];

// 🧙‍♂️ GENERADOR DINÁMICO DE HASHTAGS - AGRUPADO POR HASHTAG, NO POR PLATAFORMA
const generarHashtagsDinamicos = () => {
  const calculadoras = [
    { 
      id: 'insta', 
      nombre: 'Instagram', 
      resultado: resultadoInstaCalc,
      plataforma: '📸'
    },
    { 
      id: 'x', 
      nombre: 'X (Twitter)', 
      resultado: resultadoXCalc,
      plataforma: '🐦'
    },
    { 
      id: 'reddit', 
      nombre: 'Reddit', 
      resultado: resultadoRedditCalc,
      plataforma: '🔴'
    }
  ];

  // 🔥 OBTENER HASHTAGS ÚNICOS (NO REPETIR POR PLATAFORMA)
  const hashtagsUnicos = new Set<string>();
  const hashtagsMap = new Map<string, any>();

  calculadoras.forEach((calc, calcIndex) => {
    if (calc.resultado.hashtags && Array.isArray(calc.resultado.hashtags)) {
      calc.resultado.hashtags.forEach((hashtag: any) => {
        const hashtagNombre = hashtag.nombre;
        
        if (!hashtagsUnicos.has(hashtagNombre)) {
          hashtagsUnicos.add(hashtagNombre);
          
          // Calcular correlación promedio combinando todas las plataformas para este hashtag
          let totalCorrelacionInteraccion = 0;
          let totalCorrelacionViralidad = 0;
          let contadorPlataformas = 0;
          
          // Buscar este hashtag en todas las plataformas para calcular correlación promedio
          calculadoras.forEach(calcTmp => {
            if (calcTmp.resultado.hashtags && Array.isArray(calcTmp.resultado.hashtags)) {
              const hashtagEncontrado = calcTmp.resultado.hashtags.find((h: any) => h.nombre === hashtagNombre);
              if (hashtagEncontrado) {
                totalCorrelacionInteraccion += calcularCorrelacion(hashtagEncontrado.datosInteraccion);
                totalCorrelacionViralidad += calcularCorrelacion(hashtagEncontrado.datosViralidad);
                contadorPlataformas++;
              }
            }
          });
          
          const correlacionPromedio = Math.round(
            ((totalCorrelacionInteraccion + totalCorrelacionViralidad) / 2) / Math.max(contadorPlataformas, 1)
          );

          hashtagsMap.set(hashtagNombre, {
            id: hashtagNombre, // Usar el nombre del hashtag como ID único
            nombre: hashtagNombre,
            correlacion: correlacionPromedio,
            plataforma: `${contadorPlataformas} plataformas`, // Mostrar cuántas plataformas lo tienen
            color: coloresHashtags[hashtagsMap.size % coloresHashtags.length],
            hashtag: hashtagNombre,
            hashtagId: hashtag.id,
            insights: {
              mejorDia: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'][Math.floor(Math.random() * 5)],
              mejorHora: ['09:00-11:00', '12:00-14:00', '14:00-16:00', '18:00-20:00'][Math.floor(Math.random() * 4)],
              engagement: `+${Math.round(correlacionPromedio * 0.5)}%`,
              recomendacion: `Incrementar contenido con ${hashtagNombre} en todas las plataformas`
            },
            datos: {
              // Para datos combinados, usamos los del primer resultado encontrado
              interaccion: hashtag.datosInteraccion,
              viralidad: hashtag.datosViralidad
            }
          });
        }
      });
    }
  });

  return Array.from(hashtagsMap.values());
};

// 🔥 DEFINICIÓN DE TASAS 100% DINÁMICAS - LEE AUTOMÁTICAMENTE DE LOS JSONs
const generarOpcionesTasas = () => {
  const calculadoras = [
    { 
      id: 'insta', 
      nombre: 'Instagram', 
      resultado: resultadoInstaCalc,
      plataforma: resultadoInstaCalc.emoji || '📸',
      color: resultadoInstaCalc.color || '#16a34a'
    },
    { 
      id: 'x', 
      nombre: 'X (Twitter)', 
      resultado: resultadoXCalc,
      plataforma: resultadoXCalc.emoji || '🐦',
      color: resultadoXCalc.color || '#3b82f6'
    },
    { 
      id: 'reddit', 
      nombre: 'Reddit', 
      resultado: resultadoRedditCalc,
      plataforma: resultadoRedditCalc.emoji || '🔴',
      color: resultadoRedditCalc.color || '#94a3b8'
    }
  ];

  const opcionesTasas: any[] = [];

  // 🚀 PROCESAMIENTO 100% DINÁMICO - SE ADAPTA A CUALQUIER CANTIDAD DE HASHTAGS
  calculadoras.forEach((calc) => {
    // Verificar que la calculadora tenga hashtags
    if (calc.resultado.hashtags && Array.isArray(calc.resultado.hashtags)) {
      // Para cada hashtag en cada plataforma
      calc.resultado.hashtags.forEach((hashtag: any) => {
        // Tasa de interacción
        opcionesTasas.push({
          id: `int_${calc.id}_${hashtag.id}`,
          nombre: `Tasa de interacción ${calc.plataforma} ${hashtag.nombre}`,
          correlacion: calcularCorrelacion(hashtag.datosInteraccion),
          color: calc.color,
          datos: hashtag.datosInteraccion,
          plataforma: calc.nombre,
          hashtag: hashtag.nombre,
          hashtagId: hashtag.id
        });

        // Tasa de viralidad
        opcionesTasas.push({
          id: `vir_${calc.id}_${hashtag.id}`,
          nombre: `Tasa de viralidad ${calc.plataforma} ${hashtag.nombre}`,
          correlacion: calcularCorrelacion(hashtag.datosViralidad),
          color: calc.color,
          datos: hashtag.datosViralidad,
          plataforma: calc.nombre,
          hashtag: hashtag.nombre,
          hashtagId: hashtag.id
        });
      });
    } else {
      // 🔥 COMPATIBILIDAD CON ESTRUCTURA ANTERIOR
      opcionesTasas.push({
        id: `int_${calc.id}`,
        nombre: `Tasa de interacción ${calc.plataforma} ${calc.resultado.hashtag}`,
        correlacion: calcularCorrelacion(calc.resultado.datosInteraccion),
        color: calc.color,
        datos: calc.resultado.datosInteraccion,
        plataforma: calc.nombre
      });

      opcionesTasas.push({
        id: `vir_${calc.id}`,
        nombre: `Tasa de viralidad ${calc.plataforma} ${calc.resultado.hashtag}`,
        correlacion: calcularCorrelacion(calc.resultado.datosViralidad),
        color: calc.color,
        datos: calc.resultado.datosViralidad,
        plataforma: calc.nombre
      });
    }
  });

  return opcionesTasas;
};

// Datos de hashtags para noticias (mantenemos algunos estáticos para demo)
const hashtagsNoticias = [
  { id: 'pielesSinteticas', nombre: '#PielesSinteticas', correlacion: 82, color: '#a855f7', datos: [
    { fecha: "01/01/25 - 31/01/25", tasa: 45.2 },
    { fecha: "1/02/25 - 28/02/25", tasa: 62.8 },
    { fecha: "1/03/25 - 31/03/25", tasa: 71.3 },
    { fecha: "1/04/25 - 19/04/25", tasa: 88.5 }
  ]},
  { id: 'milan', nombre: '#Milan', correlacion: 70, color: '#a855f7', datos: [
    { fecha: "01/01/25 - 31/01/25", tasa: 32.1 },
    { fecha: "1/02/25 - 28/02/25", tasa: 48.7 },
    { fecha: "1/03/25 - 31/03/25", tasa: 55.9 },
    { fecha: "1/04/25 - 19/04/25", tasa: 67.4 }
  ]},
  { id: 'modaSustentable', nombre: '#ModaSustentable', correlacion: 76, color: '#a855f7', datos: [
    { fecha: "01/01/25 - 31/01/25", tasa: 38.9 },
    { fecha: "1/02/25 - 28/02/25", tasa: 55.3 },
    { fecha: "1/03/25 - 31/03/25", tasa: 69.1 },
    { fecha: "1/04/25 - 19/04/25", tasa: 82.7 }
  ]}
];

// 🔥 FUNCIÓN HELPER PARA OBTENER TASAS POR HASHTAG ESPECÍFICO
const obtenerTasasPorHashtag = (hashtagId: string): string[] => {
  // Verificar que el hashtagId es exactamente como aparece en tus datos
  console.log("MenuComponentes: Obteniendo tasas para hashtag:", hashtagId);
  
  const hashtagMap: { [key: string]: string } = {
    '#EcoFriendly': 'eco',
    '#SustainableFashion': 'sustainable', 
    '#NuevosMateriales': 'materiales'
  };
  
  const tag = hashtagMap[hashtagId];
  if (!tag) {
    console.warn(`MenuComponentes: No se encontró mapping para el hashtag: ${hashtagId}`);
    return ['int_insta_eco']; // Fallback
  }
  
  // Estos IDs deben coincidir exactamente con los que tienes en tus datos
  return [
    `int_insta_${tag}`, `vir_insta_${tag}`,
    `int_x_${tag}`, `vir_x_${tag}`,
    `int_reddit_${tag}`, `vir_reddit_${tag}`
  ];
};

// Componente de Consolidación extraído de MenuComponentes para usarlo independientemente
const Consolidacion = () => {
  const [seleccionadas, setSeleccionadas] = useState<string[]>(['insta']); // Por defecto muestra Instagram
  const hashtagsDinamicos = useMemo(() => generarHashtagsDinamicos(), []);

  // Función para alternar selección de una calculadora
  const toggleSeleccion = (hashtagId: string) => {
    setSeleccionadas((prev) =>
      prev.includes(hashtagId) ? prev.filter((x) => x !== hashtagId) : [...prev, hashtagId].slice(-3) // máximo 3
    );
  };

  // Combinar datos de los hashtags seleccionados
  const combinarDatosInteraccion = () => {
    const todasFechas = Array.from(
      new Set(
        seleccionadas.flatMap(
          (id) => {
            const hashtag = hashtagsDinamicos.find((h) => h.id === id);
            return hashtag?.datos.interaccion.map((d: any) => d.fecha) || [];
          }
        )
      )
    );

    return todasFechas.map((fecha) => {
      const item: any = { fecha };
      seleccionadas.forEach((id) => {
        const hashtag = hashtagsDinamicos.find((h) => h.id === id);
        const dato = hashtag?.datos.interaccion.find((d: any) => d.fecha === fecha);
        item[id] = dato ? dato.tasa : 0;
      });
      return item;
    });
  };

  const datosCombinados = combinarDatosInteraccion();

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-xl font-bold text-navy-900 mb-4">🔥 Consolidación DINÁMICA de Hashtags</h2>

      {/* Botones tipo bolitas para seleccionar hashtags */}
      <div className="flex gap-4 justify-center mb-6 flex-wrap">
        {hashtagsDinamicos.map((hashtag) => (
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
              const hashtag = hashtagsDinamicos.find((h) => h.id === id);
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
};

const MenuComponentes: React.FC<MenuComponentesProps> = ({ 
  modoVisualizacion,
  setModoVisualizacion, 
  setHashtagSeleccionado,
  onSeleccionItem,
  onEcoFriendlyClick,
  hashtagSeleccionado,
  onTasasSeleccionadas,
  onHashtagsNoticiasSeleccionados
}) => {
  // 🧙‍♂️ GENERAMOS LOS HASHTAGS DINÁMICAMENTE
  const hashtagsDinamicos = useMemo(() => generarHashtagsDinamicos(), []);
  const opcionesTasas = useMemo(() => generarOpcionesTasas(), []);
  
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

  // 🔥 LISTA DE HASHTAGS DINÁMICOS - ESTA ES LA CLAVE DEL FIX
  const hashtagsDinamicosLista = ['#EcoFriendly', '#SustainableFashion', '#NuevosMateriales'];

  // 🚀 FUNCIÓN CORREGIDA QUE MANEJA TODOS LOS HASHTAGS
  const handleItemClick = (itemId: string, nuevoModo?: 'original' | 'logaritmo' | 'normalizado') => {
    console.log("MenuComponentes: Clic en item:", itemId); // Para depuración
    
    setHashtagSeleccionado(itemId);
    
    // 🔥 VERIFICAR SI ES CUALQUIER HASHTAG DINÁMICO
    if (hashtagsDinamicosLista.includes(itemId)) {
      setMostrarDesgloseTasas(true);
      setMostrarDesgloseNoticias(false);
      setMostrarConsolidacion(false);
      
      // 🚀 NUEVO: Cambiar las tasas seleccionadas al hashtag correspondiente
      const nuevasTasas = obtenerTasasPorHashtag(itemId);
      console.log("MenuComponentes: Nuevas tasas para", itemId, ":", nuevasTasas);
      
      setTasasSeleccionadas(nuevasTasas);
      
      // IMPORTANTE: Notificar al componente padre sobre las nuevas tasas seleccionadas
      if (onTasasSeleccionadas) {
        onTasasSeleccionadas(nuevasTasas);
      }
      
      // Llamar a la función del padre para actualizar la visualización
      onSeleccionItem(itemId);
      return; // Salir temprano para evitar ocultar la gráfica
    } 
    // Si es Noticia1, mostrar el desglose de hashtags de noticias
    else if (itemId === 'Noticia1') {
      setMostrarDesgloseNoticias(true);
      setMostrarDesgloseTasas(false);
      setMostrarConsolidacion(false);
    } 
    else {
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
    setTasasSeleccionadas(prev => {
      let nuevaSeleccion;
      if (prev.includes(tasaId)) {
        nuevaSeleccion = prev.filter(id => id !== tasaId);
        if (nuevaSeleccion.length === 0) {
          return prev; // No permitir selección vacía
        }
      } else {
        nuevaSeleccion = [...prev, tasaId];
      }
      
      console.log("MenuComponentes: Toggle tasa, nuevas tasas:", nuevaSeleccion);
      
      // Llamar al callback del padre
      if (onTasasSeleccionadas) {
        onTasasSeleccionadas(nuevaSeleccion);
      }
      
      return nuevaSeleccion;
    });
  };

  // Modificado para alternar hashtags de noticias seleccionados
  const handleHashtagNoticiaClick = (hashtagId: string) => {
    setHashtagsNoticiasSeleccionados(prev => {
      if (prev.includes(hashtagId)) {
        const nuevaSeleccion = prev.filter(id => id !== hashtagId);
        if (nuevaSeleccion.length === 0) {
          return prev;
        }
        
        if (onHashtagsNoticiasSeleccionados) {
          onHashtagsNoticiasSeleccionados(nuevaSeleccion);
        }
        return nuevaSeleccion;
      } 
      else {
        const nuevaSeleccion = [...prev, hashtagId];
        if (onHashtagsNoticiasSeleccionados) {
          onHashtagsNoticiasSeleccionados(nuevaSeleccion);
        }
        return nuevaSeleccion;
      }
    });
  };

  const toggleConsolidacion = () => {
    setMostrarConsolidacion(!mostrarConsolidacion);
    if (!mostrarConsolidacion) {
      setHashtagSeleccionado('');
      onSeleccionItem(''); // Importante: notificar al padre
    }
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
  const isTasaActive = (value: string) => tasasSeleccionadas.includes(value);
  const isHashtagNoticiaActive = (value: string) => hashtagsNoticiasSeleccionados.includes(value);

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

        {/* Sección de Ventas */}
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
                  Ventas de Bolso Marianne
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

        {/* 🧙‍♂️ SECCIÓN DE HASHTAGS DINÁMICOS */}
        {!mostrarDesgloseTasas && !mostrarDesgloseNoticias && !mostrarConsolidacion && (
          <div className="mb-6 p-4 border rounded-xl bg-gradient-to-r from-green-50 to-emerald-50">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-xl font-bold text-navy-900">🚀 Hashtags Dinámicos</h2>
                <p className="text-sm text-gray-600">Generados automáticamente desde los JSONs</p>
              </div>
              <button
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full hover:from-blue-600 hover:to-indigo-600 transition font-medium"
                onClick={toggleConsolidacion}
              >
                Ver Consolidación
              </button>
            </div>
            <div className="mt-3 space-y-4">
              {hashtagsDinamicos
                .sort((a, b) => b.correlacion - a.correlacion) // Ordenar por correlación
                .map((hashtag) => (
                <div key={hashtag.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div
                      className={getCircleStyle(hashtag)}
                      style={{ backgroundColor: hashtag.color }}
                      onClick={() => handleItemClick(hashtag.id, 'original')}
                    ></div>
                    <span className={`text-gray-800 ${isActive(hashtag.id) ? 'font-bold' : 'font-medium'}`}>
                      {hashtag.nombre} - Correlación: {hashtag.correlacion}%
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

        {/* 🔍 DESGLOSE DINÁMICO DE TASAS - 🔥 FILTRADO POR HASHTAG SELECCIONADO */}
        {mostrarDesgloseTasas && (
          <div className="mb-6 p-4 border rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-blue-700">🔍 Desglose dinámico de tasas</h2>
              <button
                className="px-4 py-2 bg-gray-500 text-white rounded-full hover:bg-gray-600 transition font-medium"
                onClick={() => {
                  setMostrarDesgloseTasas(false);
                  setHashtagSeleccionado('');
                  onSeleccionItem(''); // Importante: notificar al padre
                }}
              >
                Regresar
              </button>
            </div>
            
            {/* 🚀 FILTRAR SOLO POR EL HASHTAG SELECCIONADO */}
            <div className="space-y-6">
              {(() => {
                // 🔥 FILTRAR OPCIONES DE TASAS SOLO PARA EL HASHTAG SELECCIONADO
                const tasasDelHashtagActual = opcionesTasas.filter(tasa => {
                  return tasa.hashtag === hashtagSeleccionado;
                });

               if (tasasDelHashtagActual.length === 0) {
                  return <div className="text-gray-500">No se encontraron tasas para {hashtagSeleccionado}</div>;
                }

                // 🔥 SOLO MOSTRAR EL HASHTAG ACTUAL
                const hashtagActual = hashtagSeleccionado;
                const hashtagColor = hashtagActual === '#EcoFriendly' ? 'text-green-700' : 
                                   hashtagActual === '#SustainableFashion' ? 'text-purple-700' : 'text-amber-700';
                const hashtagIcon = hashtagActual === '#EcoFriendly' ? '🌱' : 
                                  hashtagActual === '#SustainableFashion' ? '♻️' : '🧪';
                
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
                            {tasa.nombre} - Correlación: {tasa.correlacion}%
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
            
            {/* 🔥 ESTADÍSTICAS DINÁMICAS - SOLO DEL HASHTAG ACTUAL */}
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

        {/* Sección de desglose de hashtags de noticias */}
        {mostrarDesgloseNoticias && (
          <div className="mb-6 p-4 border rounded-xl bg-gradient-to-r from-purple-50 to-pink-50">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-bold text-navy-900">A la alza pieles sintéticas en Milán - Correlación: 76%</h2>
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
            <div className="space-y-3">
              {hashtagsNoticias.map((hashtag) => (
                <div key={hashtag.id} className="flex items-center">
                  <div 
                    className={`w-6 h-6 rounded-full mr-3 cursor-pointer ${isHashtagNoticiaActive(hashtag.id) ? 'ring-2 ring-offset-2 ring-gray-600' : ''}`}
                    style={{ 
                      backgroundColor: isHashtagNoticiaActive(hashtag.id) ? hashtag.color : 'transparent',
                      border: `2px solid ${hashtag.color}`,
                    }}
                    onClick={() => handleHashtagNoticiaClick(hashtag.id)}
                  ></div>
                  <span className={`text-gray-800 ${isHashtagNoticiaActive(hashtag.id) ? 'font-bold' : 'font-medium'}`}>
                    {hashtag.nombre} - Correlación: {hashtag.correlacion}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sección de Noticias - Solo se muestra si no está mostrando ningún desglose */}
        {!mostrarDesgloseTasas && !mostrarDesgloseNoticias && !mostrarConsolidacion && (
          <div className="mb-6 p-4 border rounded-xl bg-gradient-to-r from-purple-50 to-pink-50">
            <h2 className="text-xl font-bold text-navy-900">Noticias</h2>
            <div className="mt-3 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div
                    className={`${getCircleStyle({ id: 'Noticia1' })} bg-purple-500`}
                    onClick={() => handleItemClick('Noticia1', 'original')}
                  ></div>
                  <span className={`text-gray-800 ${isActive('Noticia1') ? 'font-bold' : 'font-medium'}`}>
                    A la alza pieles sintéticas en Milán - Correlación: 76%
                  </span>
                </div>
                <button
                  className={getButtonStyle('Noticia1')}
                  onClick={() => handleItemClick('Noticia1')}
                >
                  Ver más
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div
                    className={`${getCircleStyle({ id: 'Noticia2' })} bg-amber-500`}
                    onClick={() => handleItemClick('Noticia2', 'logaritmo')}
                  ></div>
                  <span className={`text-gray-800 ${isActive('Noticia2') ? 'font-bold' : 'font-medium'}`}>
                    Materiales reciclados en bolsos
                  </span>
                </div>
                <button
                  className={getButtonStyle('Noticia2')}
                  onClick={() => handleItemClick('Noticia2')}
                >
                  Ver más
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div
                    className={`${getCircleStyle({ id: 'Noticia3' })} bg-teal-500`}
                    onClick={() => handleItemClick('Noticia3', 'normalizado')}
                  ></div>
                  <span className={`text-gray-800 ${isActive('Noticia3') ? 'font-bold' : 'font-medium'}`}>
                    Nuevos diseños eco-friendly
                  </span>
                </div>
                <button
                  className={getButtonStyle('Noticia3')}
                  onClick={() => handleItemClick('Noticia3')}
                >
                  Ver más
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Contenedor para mostrar el componente de Consolidación DINÁMICO */}
        {mostrarConsolidacion && (
          <div className="mt-6 border-t pt-6">
            <Consolidacion />
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuComponentes;

// Exportar los datos de hashtags de noticias para uso en Dashboard
export { hashtagsNoticias };