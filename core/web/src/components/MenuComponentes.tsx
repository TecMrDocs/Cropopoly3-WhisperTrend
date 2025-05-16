import React from 'react';

type MenuComponentesProps = {
  modoVisualizacion: 'original' | 'logaritmo' | 'normalizado';
  setModoVisualizacion: React.Dispatch<React.SetStateAction<'original' | 'logaritmo' | 'normalizado'>>;
  setHashtagSeleccionado: React.Dispatch<React.SetStateAction<string>>;
  onEcoFriendlyClick: () => void; // Nueva prop para manejar el clic en #EcoFriendly
};

const MenuComponentes: React.FC<MenuComponentesProps> = ({ 
  modoVisualizacion, 
  setModoVisualizacion, 
  setHashtagSeleccionado,
  onEcoFriendlyClick 
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

  const handleModoChange = (nuevoModo: 'original' | 'logaritmo' | 'normalizado') => {
    setModoVisualizacion(nuevoModo);
  };

  const handleVentasClick = () => {
    setHashtagSeleccionado('Ventas');
    setModoVisualizacion('original');
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
                className="w-6 h-6 bg-blue-600 rounded-full mr-3 cursor-pointer"
                onClick={() => handleVentasClick()}
              ></div>
              <span className="text-gray-800 font-medium">Ventas de Bolso Marianne</span>
            </div>
            <button 
              className="px-4 py-1 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition"
              onClick={() => handleModoChange('original')}
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
                className="w-6 h-6 bg-green-500 rounded-full mr-3 cursor-pointer"
                onClick={() => handleHashtagClick('#EcoFriendly')}
              ></div>
              <span className="text-gray-800 font-medium">#EcoFriendly - Correlación: 91%</span>
            </div>
            <button
              className="px-4 py-1 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition"
              onClick={() => handleHashtagClick('#EcoFriendly')}
            >
              Ver tendencia
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div
                className="w-6 h-6 bg-blue-200 rounded-full border-2 border-blue-300 mr-3 cursor-pointer"
                onClick={() => handleHashtagClick('#SustainableFashion')}
              ></div>
              <span className="text-gray-800 font-medium">#SustainableFashion - Correlación: 82%</span>
            </div>
            <button 
              className="px-4 py-1 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition"
              onClick={() => handleModoChange('logaritmo')}
            >
              Ver más
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div
                className="w-6 h-6 bg-white rounded-full border-2 border-gray-300 mr-3 cursor-pointer"
                onClick={() => handleHashtagClick('#NuevosMateriales')}
              ></div>
              <span className="text-gray-800 font-medium">#NuevosMateriales - Correlación: 70%</span>
            </div>
            <button 
              className="px-4 py-1 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition"
              onClick={() => handleModoChange('normalizado')}
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