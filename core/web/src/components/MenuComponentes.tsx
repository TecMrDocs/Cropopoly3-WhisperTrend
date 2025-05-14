import React from 'react';

const MenuComponentes = () => {
  return (
    <div className="w-full max-w-lg mx-auto rounded-3xl overflow-hidden border border-gray-200 bg-white">
      <div className="p-6 bg-white">
        <h2 className="text-xl font-bold text-navy-900">Ventas</h2>
        
        <div className="mt-3 flex items-center">
          <div className="w-6 h-6 bg-blue-600 rounded-full mr-3"></div>
          <span className="text-gray-800 font-medium">Ventas de Bolso Marianne</span>
        </div>
      </div>
      
      <div className="p-6 border-t border-gray-200">
        <h2 className="text-xl font-bold text-navy-900">Hashtags</h2>
        
        <div className="mt-3 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-green-500 rounded-full mr-3"></div>
              <span className="text-gray-800 font-medium">#EcoFriendly - Correlación: 91%</span>
            </div>
            <button className="px-4 py-1 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition">Ver más</button>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-blue-200 rounded-full border-2 border-blue-300 mr-3"></div>
              <span className="text-gray-800 font-medium">#SustainableFashion - Correlación: 82%</span>
            </div>
            <button className="px-4 py-1 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition">Ver más</button>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-white rounded-full border-2 border-gray-300 mr-3"></div>
              <span className="text-gray-800 font-medium">#NuevosMateriales - Correlación: 70%</span>
            </div>
            <button className="px-4 py-1 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition">Ver más</button>
          </div>
        </div>
      </div>
      
      <div className="p-6 border-t border-gray-200">
        <h2 className="text-xl font-bold text-navy-900">Noticias</h2>
        
        <div className="mt-3 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-white rounded-full border-2 border-gray-300 mr-3"></div>
              <span className="text-gray-800 font-medium">A la alza pieles sintéticas en Milán - Correlación: 76%</span>
            </div>
            <button className="px-4 py-1 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition">Ver más</button>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-white rounded-full border-2 border-gray-300 mr-3"></div>
              <span className="text-gray-800 font-medium">Mujeres piden bolsos más grandes - Correlación: 68%</span>
            </div>
            <button className="px-4 py-1 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition">Ver más</button>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-white rounded-full border-2 border-gray-300 mr-3"></div>
              <span className="text-gray-800 font-medium">Los materiales más durables en la alta moda - Correlación: 52%</span>
            </div>
            <button className="px-4 py-1 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition">Ver más</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuComponentes;