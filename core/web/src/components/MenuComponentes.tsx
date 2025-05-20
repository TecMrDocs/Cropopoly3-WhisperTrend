import React, { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid,
} from 'recharts';


// Datos simulados para demostración (si no tienes los componentes reales)
const resultadoXCalc = {
  datosInteraccion: [
    { fecha: "01/01/25 - 31/01/25", tasa: 3.47 },
    { fecha: "1/02/25 - 28/02/25", tasa: 0.87 },
    { fecha: "1/03/25 - 31/03/25", tasa: 2.17 },
    { fecha: "1/04/25 - 19/04/25", tasa: 7.16 }
  ],
  datosViralidad: [
    { fecha: "01/01/25 - 31/01/25", tasa: 0.04 },
    { fecha: "1/02/25 - 28/02/25", tasa: 0.01 },
    { fecha: "1/03/25 - 31/03/25", tasa: 0.07 },
    { fecha: "1/04/25 - 19/04/25", tasa: 0.13 }
  ]
};

const resultadoRedditCalc = {
  datosInteraccion: [
    { fecha: "01/01/25 - 31/01/25", tasa: 5.2 },
    { fecha: "1/02/25 - 28/02/25", tasa: 4.8 },
    { fecha: "1/03/25 - 31/03/25", tasa: 6.3 },
    { fecha: "1/04/25 - 19/04/25", tasa: 8.1 }
  ],
  datosViralidad: [
    { fecha: "01/01/25 - 31/01/25", tasa: 0.06 },
    { fecha: "1/02/25 - 28/02/25", tasa: 0.05 },
    { fecha: "1/03/25 - 31/03/25", tasa: 0.09 },
    { fecha: "1/04/25 - 19/04/25", tasa: 0.11 }
  ]
};

const resultadoInstaCalc = {
  datosInteraccion: [
    { fecha: "01/01/25 - 31/01/25", tasa: 8.7 },
    { fecha: "1/02/25 - 28/02/25", tasa: 9.2 },
    { fecha: "1/03/25 - 31/03/25", tasa: 10.5 },
    { fecha: "1/04/25 - 19/04/25", tasa: 12.3 }
  ],
  datosViralidad: [
    { fecha: "01/01/25 - 31/01/25", tasa: 0.12 },
    { fecha: "1/02/25 - 28/02/25", tasa: 0.14 },
    { fecha: "1/03/25 - 31/03/25", tasa: 0.17 },
    { fecha: "1/04/25 - 19/04/25", tasa: 0.21 }
  ]
};

// Define cada calculadora y sus datos
const calculadoras = [
  { id: 'reddit', nombre: 'Reddit', datos: resultadoRedditCalc, color: '#8884d8' },
  { id: 'insta', nombre: 'Instagram', datos: resultadoInstaCalc, color: '#82ca9d' },
  { id: 'xcalc', nombre: 'XCalc', datos: resultadoXCalc, color: '#ffc658' },
];

// Componente de Consolidación que muestra los gráficos
const Consolidacion: React.FC = () => {
  const [seleccionadas, setSeleccionadas] = useState<string[]>(['xcalc']); // Por defecto muestra XCalc

  // Función para alternar selección de una calculadora
  const toggleSeleccion = (id: string) => {
    setSeleccionadas((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id].slice(-3) // máximo 3
    );
  };

  // Combinar datos de las calculadoras seleccionadas
  const combinarDatosInteraccion = () => {
    // Array con todas las fechas, para alinear por fecha
    const todasFechas = Array.from(
      new Set(
        seleccionadas.flatMap(
          (id) => calculadoras.find((c) => c.id === id)?.datos.datosInteraccion.map((d: any) => d.fecha) || []
        )
      )
    );

    // Por cada fecha crear un objeto con la fecha y las tasas de cada calculadora seleccionada
    return todasFechas.map((fecha) => {
      const item: any = { fecha };
      seleccionadas.forEach((id) => {
        const calc = calculadoras.find((c) => c.id === id);
        const dato = calc?.datos.datosInteraccion.find((d: any) => d.fecha === fecha);
        item[id] = dato ? dato.tasa : 0;
      });
      return item;
    });
  };

  const datosCombinados = combinarDatosInteraccion();

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-xl font-bold text-navy-900 mb-4">Consolidación de Tendencias</h2>

      {/* Botones tipo bolitas para seleccionar calculadoras */}
      <div className="flex gap-4 justify-center mb-6">
        {calculadoras.map(({ id, nombre, color }) => (
          <div
            key={id}
            onClick={() => toggleSeleccion(id)}
            className={`w-10 h-10 rounded-full cursor-pointer flex items-center justify-center font-bold select-none
              ${seleccionadas.includes(id) ? 'text-white' : 'text-gray-600'}`}
            style={{ backgroundColor: seleccionadas.includes(id) ? color : '#ddd' }}
            title={`Mostrar ${nombre}`}
          >
            {nombre[0]}
          </div>
        ))}
      </div>

      {/* Gráfica combinada que muestra las tendencias seleccionadas */}
      <div className="w-full h-96">
        <ResponsiveContainer>
          <LineChart data={datosCombinados} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid stroke="#ccc" strokeDasharray="3 3" />
            <XAxis dataKey="fecha" />
            <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
            <Tooltip formatter={(value) => `${value}%`} />
            <Legend />
            {seleccionadas.map((id) => {
              const calc = calculadoras.find((c) => c.id === id);
              return (
                <Line
                  key={id}
                  type="monotone"
                  dataKey={id}
                  stroke={calc?.color || '#000'}
                  name={calc?.nombre || id}
                  activeDot={{ r: 8 }}
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
};

const MenuComponentes: React.FC<MenuComponentesProps> = ({ 
  modoVisualizacion,
  setModoVisualizacion, 
  setHashtagSeleccionado,
  onSeleccionItem,
  onEcoFriendlyClick,
  hashtagSeleccionado
}) => {
  // Estado para controlar la visibilidad del componente de Consolidación
  const [mostrarConsolidacion, setMostrarConsolidacion] = useState<boolean>(false);

  const handleItemClick = (itemId: string, nuevoModo?: 'original' | 'logaritmo' | 'normalizado') => {
    setHashtagSeleccionado(itemId);
    
    if (itemId === '#EcoFriendly') {
      onEcoFriendlyClick();
    } else if (nuevoModo) {
      setModoVisualizacion(nuevoModo);
    }
    
    // Ocultar la consolidación cuando se selecciona un elemento específico
    setMostrarConsolidacion(false);
    
    onSeleccionItem(itemId);
  };

  const toggleConsolidacion = () => {
    setMostrarConsolidacion(!mostrarConsolidacion);
    // Deseleccionar el hashtag actual cuando se muestra la consolidación
    if (!mostrarConsolidacion) {
      setHashtagSeleccionado('');
    }
  };

  const isActive = (value: string) => value === hashtagSeleccionado;

  const getButtonStyle = (value: string) => {
    return isActive(value)
      ? "px-4 py-1 bg-blue-700 text-white rounded-full shadow-md font-semibold"
      : "px-4 py-1 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition";
  };

  const getCircleStyle = (hashtag: string) => {
    const baseStyle = "w-6 h-6 rounded-full mr-3 cursor-pointer";

    if (hashtag === '#EcoFriendly') {
      return `${baseStyle} ${isActive(hashtag) ? 'bg-green-600 ring-2 ring-offset-2 ring-green-500' : 'bg-green-500'}`;
    } else if (hashtag === '#SustainableFashion') {
      return `${baseStyle} ${isActive(hashtag) ? 'bg-blue-300 ring-2 ring-offset-2 ring-blue-300' : 'bg-blue-200 border-2 border-blue-300'}`;
    } else if (hashtag === '#NuevosMateriales') {
      return `${baseStyle} ${isActive(hashtag) ? 'bg-gray-100 ring-2 ring-offset-2 ring-gray-400' : 'bg-white border-2 border-gray-300'}`;
    } else if (hashtag === 'Ventas') {
      return `${baseStyle} ${isActive(hashtag) ? 'bg-blue-700 ring-2 ring-offset-2 ring-blue-600' : 'bg-blue-600'}`;
    } else if (hashtag === 'Noticia1') {
      return `${baseStyle} ${isActive(hashtag) ? 'bg-purple-600 ring-2 ring-offset-2 ring-purple-500' : 'bg-purple-500'}`;
    } else if (hashtag === 'Noticia2') {
      return `${baseStyle} ${isActive(hashtag) ? 'bg-amber-600 ring-2 ring-offset-2 ring-amber-500' : 'bg-amber-500'}`;
    } else if (hashtag === 'Noticia3') {
      return `${baseStyle} ${isActive(hashtag) ? 'bg-teal-600 ring-2 ring-offset-2 ring-teal-500' : 'bg-teal-500'}`;
    } else if (hashtag === 'Consolidacion') {
      return `${baseStyle} ${mostrarConsolidacion ? 'bg-purple-800 ring-2 ring-offset-2 ring-purple-700' : 'bg-purple-700'}`;
    }

    return baseStyle;
  };

  // Lista para mostrar debajo de Noticias
  const opcionesRedesSociales = ['Ventas', '#EcoFriendly', '#SustainableFashion', '#NuevosMateriales'];

  return (
    <div className="w-full h-full mx-auto rounded-3xl overflow-hidden border border-gray-200 bg-white">
      <div className="p-6 bg-white">
        {/* Sección de Ventas */}
        <h2 className="text-xl font-bold text-navy-900">Ventas</h2>
        <div className="mt-3 space-y-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div
                className={getCircleStyle('Ventas')}
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

        {/* Sección de Hashtags */}
        <h2 className="text-xl font-bold text-navy-900">Hashtags</h2>
        <div className="mt-3 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div
                className={getCircleStyle('#EcoFriendly')}
                onClick={() => handleItemClick('#EcoFriendly', 'original')}
              ></div>
              <span className={`text-gray-800 ${isActive('#EcoFriendly') ? 'font-bold' : 'font-medium'}`}>
                #EcoFriendly - Correlación: 91%
              </span>
            </div>
            <button
              className={getButtonStyle('#EcoFriendly')}
              onClick={() => handleItemClick('#EcoFriendly')}
            >
              Ver más
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div
                className={getCircleStyle('#SustainableFashion')}
                onClick={() => handleItemClick('#SustainableFashion', 'logaritmo')}
              ></div>
              <span className={`text-gray-800 ${isActive('#SustainableFashion') ? 'font-bold' : 'font-medium'}`}>
                #SustainableFashion - Correlación: 82%
              </span>
            </div>
            <button
              className={getButtonStyle('#SustainableFashion')}
              onClick={() => handleItemClick('#SustainableFashion')}
            >
              Ver más
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div
                className={getCircleStyle('#NuevosMateriales')}
                onClick={() => handleItemClick('#NuevosMateriales', 'normalizado')}
              ></div>
              <span className={`text-gray-800 ${isActive('#NuevosMateriales') ? 'font-bold' : 'font-medium'}`}>
                #NuevosMateriales - Correlación: 70%
              </span>
            </div>
            <button
              className={getButtonStyle('#NuevosMateriales')}
              onClick={() => handleItemClick('#NuevosMateriales')}
            >
              Ver más
            </button>
          </div>
        </div>

        {/* Sección de Noticias */}
        <h2 className="text-xl font-bold text-navy-900 mt-6">Noticias</h2>
        <div className="mt-3 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div
                className={getCircleStyle('Noticia1')}
                onClick={() => handleItemClick('Noticia1', 'original')}
              ></div>
              <span className={`text-gray-800 ${isActive('Noticia1') ? 'font-bold' : 'font-medium'}`}>
                Moda sostenible en auge
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
                className={getCircleStyle('Noticia2')}
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
                className={getCircleStyle('Noticia3')}
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

        {/* Sección de Consolidación (Nueva) */}
        <h2 className="mt-6 text-xl font-bold text-navy-900">Análisis de Redes</h2>
        <div className="mt-3 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div
                className={getCircleStyle('Consolidacion')}
                onClick={toggleConsolidacion}
              ></div>
              <span className={`text-gray-800 ${mostrarConsolidacion ? 'font-bold' : 'font-medium'}`}>
                Consolidación de Tendencias
              </span>
            </div>
            <button
              className={`px-4 py-1 rounded-full font-semibold transition ${
                mostrarConsolidacion ? 'bg-blue-700 text-white shadow-md' : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
              onClick={toggleConsolidacion}
            >
              {mostrarConsolidacion ? 'Ocultar' : 'Ver más'}
            </button>
          </div>
        </div>

        {/* Lista de botones para redes sociales */}
        <h2 className="mt-6 text-xl font-bold text-navy-900">Redes Sociales</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {opcionesRedesSociales.map((item) => (
            <button
              key={item}
              onClick={() => handleItemClick(item)}
              className={`px-3 py-1 rounded-full font-semibold transition ${
                isActive(item) ? 'bg-blue-700 text-white shadow-md' : 'bg-blue-400 text-white hover:bg-blue-600'
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {/* Contenedor para mostrar el componente de Consolidación */}
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