import React, { useState } from 'react';

const MenuComponentes = () => {
  const [modoVisualizacion, setModoVisualizacion] = useState<'original' | 'logaritmo' | 'normalizado'>('original');

  const handleClick = (hashtag: string) => {
    if (modoVisualizacion === 'logaritmo') {
      console.log(`Logarítmico: Acción para ${hashtag}`);
      // Llama a la función específica para datos logarítmicos
    } else if (modoVisualizacion === 'original') {
      console.log(`Original: Acción para ${hashtag}`);
      // Llama a la función específica para datos originales
    } else if (modoVisualizacion === 'normalizado') {
      console.log(`Normalizado: Acción para ${hashtag}`);
      // Llama a la función específica para datos normalizados
    }
  };

  return (
    <div className="w-full h-full mx-auto rounded-3xl overflow-hidden border border-gray-200 bg-white">
      <div className="p-6 bg-white">
        <h2 className="text-xl font-bold text-navy-900">Hashtags</h2>

        <div className="mt-3 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div
                className="w-6 h-6 bg-green-500 rounded-full mr-3 cursor-pointer"
                onClick={() => handleClick('#EcoFriendly')}
              ></div>
              <span className="text-gray-800 font-medium">#EcoFriendly - Correlación: 91%</span>
            </div>
            <button className="px-4 py-1 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition">Ver más</button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div
                className="w-6 h-6 bg-blue-200 rounded-full border-2 border-blue-300 mr-3 cursor-pointer"
                onClick={() => handleClick('#SustainableFashion')}
              ></div>
              <span className="text-gray-800 font-medium">#SustainableFashion - Correlación: 82%</span>
            </div>
            <button className="px-4 py-1 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition">Ver más</button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div
                className="w-6 h-6 bg-white rounded-full border-2 border-gray-300 mr-3 cursor-pointer"
                onClick={() => handleClick('#NuevosMateriales')}
              ></div>
              <span className="text-gray-800 font-medium">#NuevosMateriales - Correlación: 70%</span>
            </div>
            <button className="px-4 py-1 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition">Ver más</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuComponentes;