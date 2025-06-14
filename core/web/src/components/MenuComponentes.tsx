/**
 * MenuComponentes - Sistema de Control y Navegación del Dashboard
 * 
 * Este componente centraliza la funcionalidad de navegación y control del dashboard
 * de análisis de tendencias. Proporciona una interfaz completa para la gestión de
 * hashtags dinámicos, tasas de interacción y viralidad, análisis de noticias,
 * y visualizaciones consolidadas. Integra múltiples secciones especializadas
 * y maneja la comunicación entre diferentes componentes del sistema para crear
 * una experiencia de usuario fluida y cohesiva.
 * 
 * Autor: Lucio Arturo Reyes Castillo y Julio Cesar Vivas Medina
 */


import React, { useState, useMemo } from 'react';
import {LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid,} from 'recharts';
import SeccionVentas from './SeccionVentas';
import SeccionHashtags from './SeccionHashtags';
import SeccionNoticias from './SeccionNoticias';
import { 
  calcularCorrelacion, 
  getIconoHashtag, 
  ordenarPorMes, 
  generarColoresPorIndice,
  generarColoresNoticias 
} from './correlacionUtils';

/**
 * Componente de consolidación dinámica de hashtags que muestra un gráfico interactivo
 * con las tasas de interacción y viralidad de los hashtags seleccionados.
 *
 * @param {Object} param0 - Props del componente
 * @param {any} param0.datosDelSistema - Datos del sistema
 * @param {boolean} param0.cargandoDatos - Indicador de carga
 * @returns {JSX.Element} Componente de consolidación
 */
const Consolidacion = ({ datosDelSistema, cargandoDatos }: { datosDelSistema: any, cargandoDatos?: boolean }) => {
  const [seleccionadas, setSeleccionadas] = useState<string[]>(['insta']);

  const hashtagsDinamicos = useMemo(() => {
    if (cargandoDatos || !datosDelSistema) {
      return [
        { id: 'cargando', nombre: 'Cargando...', correlacion: 0, color: '#gray', datos: { interaccion: [] } }
      ];
    }

    return datosDelSistema.metadatos.hashtagsOriginales.map((hashtag: any, index: any) => {
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
      const datosInteraccion = datosDelSistema.resultadoInstaCalc.hashtags.find((h: any) => h.nombre === hashtag)?.datosInteraccion || [];
      
      return {
        id: hashtag.replace(/[^a-zA-Z0-9]/g, '').toLowerCase(),
        nombre: hashtag,
        correlacion,
        color: generarColoresPorIndice(index), // ✅ Usando utilidad
        datos: { interaccion: datosInteraccion }
      };
    });
  }, [datosDelSistema, cargandoDatos]);

  const toggleSeleccion = (hashtagId: string) => {
    setSeleccionadas((prev) =>
      prev.includes(hashtagId) ? prev.filter((x) => x !== hashtagId) : [...prev, hashtagId].slice(-3)
    );
  };

  const combinarDatosInteraccion = () => {
    if (!datosDelSistema) return [];
    
    const todasFechas = Array.from(
      new Set(
        seleccionadas.flatMap(
          (id) => {
            const hashtag = hashtagsDinamicos.find((h: any) => h.id === id);
            return hashtag?.datos?.interaccion?.map((d: any) => d.fecha) || [];
          }
        )
      )
    );

    const datosCombinados = todasFechas.map((fecha) => {
      const item: any = { fecha };
      seleccionadas.forEach((id) => {
        const hashtag = hashtagsDinamicos.find((h: any) => h.id === id);
        const dato = hashtag?.datos?.interaccion?.find((d: any) => d.fecha === fecha);
        item[id] = dato ? dato.tasa : 0;
      });
      return item;
    });

    return ordenarPorMes(datosCombinados); 
  };

  const datosCombinados = combinarDatosInteraccion();

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-xl font-bold text-navy-900 mb-4">🔥 Consolidación DINÁMICA de Hashtags</h2>

      <div className="flex gap-4 justify-center mb-6 flex-wrap">
        {hashtagsDinamicos.map((hashtag: any) => (
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

      <div className="w-full h-96">
        <ResponsiveContainer>
          <LineChart data={datosCombinados} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid stroke="#ccc" strokeDasharray="3 3" />
            <XAxis dataKey="fecha" />
            <YAxis domain={[0, 'dataMax']} tickFormatter={(value) => `${value}%`} />
            <Tooltip formatter={(value) => `${value}%`} />
            <Legend />
            {seleccionadas.map((id) => {
              const hashtag = hashtagsDinamicos.find((h: any) => h.id === id);
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

/**
 * Propiedades del componente MenuComponentes.
 * 
 * @typedef {Object} MenuComponentesProps
 */
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

/**
 * Componente de menú principal que maneja la visualización y selección de diferentes elementos
 * del sistema como hashtags, tasas de interacción/viralidad y noticias.
 * 
 * @author Lucio Reyes Castillo
 * @author Julio Cesar Vivas Medina
 * 
 * @component
 * @param {MenuComponentesProps} props - Propiedades del componente
 * @param {Function} props.setModoVisualizacion - Función para cambiar el modo de visualización
 * @param {Function} props.setHashtagSeleccionado - Función para establecer el hashtag seleccionado
 * @param {Function} props.onSeleccionItem - Callback cuando se selecciona un elemento
 * @param {string} props.hashtagSeleccionado - Hashtag actualmente seleccionado
 * @param {Function} props.onTasasSeleccionadas - Callback cuando se seleccionan tasas
 * @param {Function} props.onHashtagsNoticiasSeleccionados - Callback cuando se seleccionan hashtags de noticias
 * @param {Object} props.datosDelSistema - Datos del sistema con información de plataformas y resultados
 * @param {boolean} props.cargandoDatos - Indicador de estado de carga
 * 
 * @returns {JSX.Element} Componente de menú renderizado
 * 
 * @description
 * Este componente maneja la interfaz principal del menú que permite:
 * - Visualizar y seleccionar hashtags dinámicos
 * - Mostrar tasas de interacción y viralidad por plataforma
 * - Gestionar noticias relacionadas
 * - Alternar entre diferentes modos de visualización
 * - Mostrar consolidaciones de datos
 * 
 * El componente utiliza varios hooks para manejar el estado local y efectos secundarios,
 * generando opciones dinámicas basadas en los datos del sistema recibidos.
 */
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
            correlacion: calcularCorrelacion(hashtag.datosInteraccion), // ✅ Usando utilidad
            color: calc.colorInteraccion,
            datos: hashtag.datosInteraccion,
            plataforma: calc.nombre,
            hashtag: hashtag.nombre,
            hashtagId: hashtag.id
          });

          opcionesTasas.push({
            id: `vir_${calc.id}_${hashtag.id}`,
            nombre: `Tasa de viralidad ${calc.plataforma} ${hashtag.nombre}`,
            correlacion: calcularCorrelacion(hashtag.datosViralidad), // ✅ Usando utilidad
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
          correlacion: calcularCorrelacion(calc.resultado.datosInteraccion), // ✅ Usando utilidad
          color: calc.colorInteraccion,
          datos: calc.resultado.datosInteraccion,
          plataforma: calc.nombre
        });

        opcionesTasas.push({
          id: `vir_${calc.id}`,
          nombre: `Tasa de viralidad ${calc.plataforma} ${calc.resultado.hashtag}`,
          correlacion: calcularCorrelacion(calc.resultado.datosViralidad), // ✅ Usando utilidad
          color: calc.colorViralidad,
          datos: calc.resultado.datosViralidad,
          plataforma: calc.nombre
        });
      }
    });

    return opcionesTasas;
  };

  const obtenerTasasPorHashtag = (hashtagId: string): string[] => {
    if (!datosDelSistema) {
      return [];
    }

    const ids: string[] = [];
    
    const hashtagInsta = datosDelSistema.resultadoInstaCalc?.hashtags?.find((h: any) => h.nombre === hashtagId);
    if (hashtagInsta) {
      ids.push(`int_insta_${hashtagInsta.id}`, `vir_insta_${hashtagInsta.id}`);
    }
    
    const hashtagReddit = datosDelSistema.resultadoRedditCalc?.hashtags?.find((h: any) => h.nombre === hashtagId);
    if (hashtagReddit) {
      ids.push(`int_reddit_${hashtagReddit.id}`, `vir_reddit_${hashtagReddit.id}`);
    }
    
    const hashtagX = datosDelSistema.resultadoXCalc?.hashtags?.find((h: any) => h.nombre === hashtagId);
    if (hashtagX) {
      ids.push(`int_x_${hashtagX.id}`, `vir_x_${hashtagX.id}`);
    }
    
    return ids;
  };
  
  const hashtagsDinamicos = useMemo(() => {
    if (cargandoDatos || !datosDelSistema) {
      return [
        { id: 'cargando', nombre: 'Cargando...', correlacion: 0, color: '#gray' }
      ];
    }

    return datosDelSistema.metadatos.hashtagsOriginales.map((hashtag: any, index: any) => {
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
      
      return {
        id: hashtag.replace(/[^a-zA-Z0-9]/g, '').toLowerCase(),
        nombre: hashtag,
        correlacion,
        color: generarColoresPorIndice(index), // ✅ Usando utilidad
        datos: {
          interaccion: datosDelSistema.resultadoInstaCalc.hashtags.find((h: any) => h.nombre === hashtag)?.datosInteraccion || []
        }
      };
    });
  }, [datosDelSistema, cargandoDatos]);

  const noticiasDinamicas = useMemo(() => {
    if (cargandoDatos || !datosDelSistema || !datosDelSistema.noticias) {
      return [
        { id: 'cargando', titulo: 'Cargando noticias...', correlacion: 0, color: '#gray' }
      ];
    }

    return datosDelSistema.noticias.map((noticia: any, index: number) => {
      const correlacionBase = 60 + (index * 8);
      
      return {
        id: `noticia_${index}`,
        titulo: noticia.title,
        descripcion: noticia.description,
        url: noticia.url,
        keywords: noticia.keywords,
        correlacion: correlacionBase,
        color: generarColoresNoticias(index) // ✅ Usando utilidad
      };
    });
  }, [datosDelSistema, cargandoDatos]);

  const opcionesTasas = useMemo(() => generarOpcionesTasas(), [datosDelSistema]);
  
  const [mostrarConsolidacion, setMostrarConsolidacion] = useState<boolean>(false);
  const [mostrarDesgloseTasas, setMostrarDesgloseTasas] = useState<boolean>(false);
  const [mostrarDesgloseNoticias, setMostrarDesgloseNoticias] = useState<boolean>(false);
  const [tasasSeleccionadas, setTasasSeleccionadas] = useState<string[]>(['int_insta_eco']);
  const [hashtagsNoticiasSeleccionados, setHashtagsNoticiasSeleccionados] = useState<string[]>(['pielesSinteticas']);

  const hashtagsDinamicosLista = datosDelSistema?.metadatos?.hashtagsOriginales || [];

  const handleItemClick = (itemId: string, nuevoModo?: 'original' | 'logaritmo' | 'normalizado') => {
    if (itemId.startsWith('noticia_')) {
      setHashtagSeleccionado(itemId);
      setMostrarDesgloseNoticias(true);
      setMostrarDesgloseTasas(false);
      setMostrarConsolidacion(false);
      onSeleccionItem(itemId);
      return;
    }

    const hashtagEncontrado = hashtagsDinamicosLista.find((hashtag: any) => 
      hashtag.replace('#', '').toLowerCase() === itemId.toLowerCase()
    );

    if (hashtagEncontrado) {
      setHashtagSeleccionado(hashtagEncontrado);
      setMostrarDesgloseTasas(true);
      setMostrarDesgloseNoticias(false);
      setMostrarConsolidacion(false);
      
      const nuevasTasas = obtenerTasasPorHashtag(hashtagEncontrado);
      setTasasSeleccionadas(nuevasTasas);
      
      if (onTasasSeleccionadas) {
        onTasasSeleccionadas(nuevasTasas);
      }
      
      onSeleccionItem(hashtagEncontrado);
      return;
    } 
    else {
      setHashtagSeleccionado(itemId);
      setMostrarDesgloseTasas(false);
      setMostrarDesgloseNoticias(false);
      
      if (nuevoModo) {
        setModoVisualizacion(nuevoModo);
      }
    }
    
    setMostrarConsolidacion(false);
    onSeleccionItem(itemId);
  };

  const handleTasaToggle = (tasaId: string) => {
    setTasasSeleccionadas(prev => {
      let nuevaSeleccion;
      if (prev.includes(tasaId)) {
        nuevaSeleccion = prev.filter(id => id !== tasaId);
        if (nuevaSeleccion.length === 0) {
          return prev;
        }
      } else {
        nuevaSeleccion = [...prev, tasaId];
      }
      
      if (onTasasSeleccionadas) {
        onTasasSeleccionadas(nuevaSeleccion);
      }
      
      return nuevaSeleccion;
    });
  };

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

        <SeccionVentas
          datosDelSistema={datosDelSistema}
          hashtagSeleccionado={hashtagSeleccionado}
          isActive={isActive}
          getCircleStyle={getCircleStyle}
          getButtonStyle={getButtonStyle}
          handleItemClick={handleItemClick}
        />

        <SeccionHashtags
          hashtagsDinamicos={hashtagsDinamicos}
          hashtagSeleccionado={hashtagSeleccionado}
          isActive={isActive}
          getCircleStyle={getCircleStyle}
          getButtonStyle={getButtonStyle}
          handleItemClick={handleItemClick}
          mostrarDesgloseTasas={mostrarDesgloseTasas}
          mostrarDesgloseNoticias={mostrarDesgloseNoticias}
          mostrarConsolidacion={mostrarConsolidacion}
        />

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

               if (tasasDelHashtagActual.length === 0) {
                  return <div className="text-gray-500">No se encontraron tasas para {hashtagSeleccionado}</div>;
                }
                
                const hashtagActual = hashtagSeleccionado;
                const hashtagData = hashtagsDinamicos.find((h: any) => h.nombre === hashtagActual);
                const hashtagColor = hashtagData ? 'text-gray-700' : 'text-gray-700'; 
                const hashtagIcon = getIconoHashtag(hashtagActual); // ✅ Usando utilidad
                
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

        <SeccionNoticias
          noticiasDinamicas={noticiasDinamicas}
          hashtagSeleccionado={hashtagSeleccionado}
          isActive={isActive}
          getCircleStyle={getCircleStyle}
          getButtonStyle={getButtonStyle}
          handleItemClick={handleItemClick}
          mostrarDesgloseTasas={mostrarDesgloseTasas}
          mostrarDesgloseNoticias={mostrarDesgloseNoticias}
          mostrarConsolidacion={mostrarConsolidacion}
        />

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