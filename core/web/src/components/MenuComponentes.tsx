import React from 'react';

type MenuComponentesProps = {
  modoVisualizacion: 'original' | 'logaritmo' | 'normalizado';
  setModoVisualizacion: React.Dispatch<React.SetStateAction<'original' | 'logaritmo' | 'normalizado'>>;
  setHashtagSeleccionado: React.Dispatch<React.SetStateAction<string>>;
  onEcoFriendlyClick: () => void; // Nueva prop para manejar el clic en #EcoFriendly
  hashtagSeleccionado: string;
};

const MenuComponentes: React.FC<MenuComponentesProps> = ({ 
  modoVisualizacion, 
  setModoVisualizacion, 
  setHashtagSeleccionado,
  onEcoFriendlyClick,
  hashtagSeleccionado
}) => {
  const handleHashtagClick = (hashtag: string) => {
    setHashtagSeleccionado(hashtag);
    
    // Si es #EcoFriendly, llamamos a la función especial
    if (hashtag === '#EcoFriendly') {
      onEcoFriendlyClick();
    } 
    // Para los otros hashtags, mantenemos el comportamiento original
    else if (hashtag === '#SustainableFashion') {
      setModoVisualizacion('logaritmo');
    } else if (hashtag === '#NuevosMateriales') {
      setModoVisualizacion('normalizado');
    }
  };

  const handleModoChange = (nuevoModo: 'original' | 'logaritmo' | 'normalizado', hashtag: string) => {
    setModoVisualizacion(nuevoModo);
    setHashtagSeleccionado(hashtag);
  };

  const handleVentasClick = () => {
    setHashtagSeleccionado('Ventas');
    setModoVisualizacion('original');
  };

  // Función para determinar si un elemento está activo
  const isActive = (value: string) => {
    return value === hashtagSeleccionado;
  };

  // Función para determinar el estilo del botón según esté activo o no
  const getButtonStyle = (value: string) => {
    return isActive(value)
      ? "px-4 py-1 bg-blue-700 text-white rounded-full shadow-md font-semibold"
      : "px-4 py-1 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition";
  };

  // Función para determinar el estilo del círculo según esté activo o no
  const getCircleStyle = (hashtag: string) => {
    const baseStyle = "w-6 h-6 rounded-full mr-3 cursor-pointer";

    // Estilos personalizados por hashtag
    if (hashtag === '#EcoFriendly') {
      return `${baseStyle} ${isActive(hashtag) ? 'bg-green-600 ring-2 ring-offset-2 ring-green-500' : 'bg-green-500'}`;
    } else if (hashtag === '#SustainableFashion') {
      return `${baseStyle} ${isActive(hashtag) ? 'bg-blue-300 ring-2 ring-offset-2 ring-blue-300' : 'bg-blue-200 border-2 border-blue-300'}`;
    } else if (hashtag === '#NuevosMateriales') {
      return `${baseStyle} ${isActive(hashtag) ? 'bg-gray-100 ring-2 ring-offset-2 ring-gray-400' : 'bg-white border-2 border-gray-300'}`;
    } else if (hashtag === 'Ventas') {
      return `${baseStyle} ${isActive(hashtag) ? 'bg-blue-700 ring-2 ring-offset-2 ring-blue-600' : 'bg-blue-600'}`;
    }

    return baseStyle;
  };

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
                onClick={() => handleVentasClick()}
              ></div>
              <span className={`text-gray-800 font-medium ${isActive('Ventas') ? 'font-bold' : ''}`}>
                Ventas de Bolso Marianne
              </span>
            </div>
            <button
              className={getButtonStyle('Ventas')}
              onClick={() => handleModoChange('original', 'Ventas')}
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
                onClick={() => handleHashtagClick('#EcoFriendly')}
              ></div>
              <span className={`text-gray-800 ${isActive('#EcoFriendly') ? 'font-bold' : 'font-medium'}`}>
                #EcoFriendly - Correlación: 91%
              </span>
            </div>
            <button
              className={getButtonStyle('#EcoFriendly')}
              onClick={() => handleHashtagClick('#EcoFriendly')}
            >
              Ver tendencia
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div
                className={getCircleStyle('#SustainableFashion')}
                onClick={() => handleHashtagClick('#SustainableFashion')}
              ></div>
              <span className={`text-gray-800 ${isActive('#SustainableFashion') ? 'font-bold' : 'font-medium'}`}>
                #SustainableFashion - Correlación: 82%
              </span>
            </div>
            <button
              className={getButtonStyle('#SustainableFashion')}
              onClick={() => handleModoChange('logaritmo', '#SustainableFashion')}
            >
              Ver más
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div
                className={getCircleStyle('#NuevosMateriales')}
                onClick={() => handleHashtagClick('#NuevosMateriales')}
              ></div>
              <span className={`text-gray-800 ${isActive('#NuevosMateriales') ? 'font-bold' : 'font-medium'}`}>
                #NuevosMateriales - Correlación: 70%
              </span>
            </div>
            <button
              className={getButtonStyle('#NuevosMateriales')}
              onClick={() => handleModoChange('normalizado', '#NuevosMateriales')}
            >
              Ver más
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuComponentes;