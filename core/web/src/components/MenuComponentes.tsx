import React from 'react';

type MenuComponentesProps = {
  modoVisualizacion: 'original' | 'logaritmo' | 'normalizado';
  setModoVisualizacion: React.Dispatch<React.SetStateAction<'original' | 'logaritmo' | 'normalizado'>>;
  setHashtagSeleccionado: React.Dispatch<React.SetStateAction<string>>;
  onSeleccionItem: (itemId: string) => void;
  onEcoFriendlyClick: () => void;
  hashtagSeleccionado: string;
};

const MenuComponentes: React.FC<MenuComponentesProps> = ({ 
  setModoVisualizacion, 
  setHashtagSeleccionado,
  onSeleccionItem,
  onEcoFriendlyClick,
  hashtagSeleccionado
}) => {
  // Función unificada para manejar clicks en círculos
  const handleItemClick_1 = (hashtag: string, nuevoModo: 'original' | 'logaritmo' | 'normalizado') => {
    setHashtagSeleccionado(hashtag);
    
    if (hashtag === '#EcoFriendly') {
      onEcoFriendlyClick();
    } else {
      setModoVisualizacion(nuevoModo);
    }
  };

  // Función unificada para manejar clicks en botones "Ver más"
  const handleItemClick_2 = (itemId: string) => {
    setHashtagSeleccionado(itemId);
    onSeleccionItem(itemId);
  };

  // Verifica si un hashtag está activo (seleccionado)
  const isActive = (value: string) => {
    return value === hashtagSeleccionado;
  };

  // Estilo para los botones
  const getButtonStyle = (value: string) => {
    return isActive(value)
      ? "px-4 py-1 bg-blue-700 text-white rounded-full shadow-md font-semibold"
      : "px-4 py-1 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition";
  };

  // Estilo para los círculos
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
                onClick={() => handleItemClick_1('Ventas', 'original')}
              ></div>
              <span className={`text-gray-800 font-medium ${isActive('Ventas') ? 'font-bold' : ''}`}>
                Ventas de Bolso Marianne
              </span>
            </div>
            <button
              className={getButtonStyle('Ventas')}
              onClick={() => handleItemClick_2('Ventas')}
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
                onClick={() => handleItemClick_1('#EcoFriendly', 'original')}
              ></div>
              <span className={`text-gray-800 ${isActive('#EcoFriendly') ? 'font-bold' : 'font-medium'}`}>
                #EcoFriendly - Correlación: 91%
              </span>
            </div>
            <button
              className={getButtonStyle('#EcoFriendly')}
              onClick={() => handleItemClick_2('#EcoFriendly')}
            >
              Ver más
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div
                className={getCircleStyle('#SustainableFashion')}
                onClick={() => handleItemClick_1('#SustainableFashion', 'logaritmo')}
              ></div>
              <span className={`text-gray-800 ${isActive('#SustainableFashion') ? 'font-bold' : 'font-medium'}`}>
                #SustainableFashion - Correlación: 82%
              </span>
            </div>
            <button
              className={getButtonStyle('#SustainableFashion')}
              onClick={() => handleItemClick_2('#SustainableFashion')}
            >
              Ver más
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div
                className={getCircleStyle('#NuevosMateriales')}
                onClick={() => handleItemClick_1('#NuevosMateriales', 'normalizado')}
              ></div>
              <span className={`text-gray-800 ${isActive('#NuevosMateriales') ? 'font-bold' : 'font-medium'}`}>
                #NuevosMateriales - Correlación: 70%
              </span>
            </div>
            <button
              className={getButtonStyle('#NuevosMateriales')}
              onClick={() => handleItemClick_2('#NuevosMateriales')}
            >
              Ver más
            </button>
          </div>
        </div>

        {/* Sección de Noticias */}
        <h2 className="text-xl font-bold text-navy-900">Noticias</h2>
        <div className="mt-3 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div
                className={getCircleStyle('Noticia1')}
                onClick={() => handleItemClick_1('Noticia1', 'original')}
              ></div>
              <span className={`text-gray-800 ${isActive('Noticia1') ? 'font-bold' : 'font-medium'}`}>
                Moda sostenible en auge
              </span>
            </div>
            <button
              className={getButtonStyle('Noticia1')}
              onClick={() => handleItemClick_2('Noticia1')}
            >
              Ver más
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div
                className={getCircleStyle('Noticia2')}
                onClick={() => handleItemClick_1('Noticia2', 'logaritmo')}
              ></div>
              <span className={`text-gray-800 ${isActive('Noticia2') ? 'font-bold' : 'font-medium'}`}>
                Materiales reciclados en bolsos
              </span>
            </div>
            <button
              className={getButtonStyle('Noticia2')}
              onClick={() => handleItemClick_2('Noticia2')}
            >
              Ver más
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div
                className={getCircleStyle('Noticia3')}
                onClick={() => handleItemClick_1('Noticia3', 'normalizado')}
              ></div>
              <span className={`text-gray-800 ${isActive('Noticia3') ? 'font-bold' : 'font-medium'}`}>
                Tendencias eco para 2025
              </span>
            </div>
            <button
              className={getButtonStyle('Noticia3')}
              onClick={() => handleItemClick_2('Noticia3')}
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
