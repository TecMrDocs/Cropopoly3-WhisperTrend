import React from 'react';
import { ModoVisualizacion } from '../mathCalculus/MathCalc2';

interface MenuComponentesProps {
  modoVisualizacion: ModoVisualizacion;
  setModoVisualizacion: React.Dispatch<React.SetStateAction<ModoVisualizacion>>;
  setHashtagSeleccionado: React.Dispatch<React.SetStateAction<string>>;
}

const MenuComponentes: React.FC<MenuComponentesProps> = ({
  modoVisualizacion,
  setModoVisualizacion,
  setHashtagSeleccionado
}) => {
  const hashtags = ['#EcoFriendly', '#MadeinMexico', '#Handmade', '#Artesanal'];

  return (
    <div>
      <h3 className="text-2xl font-bold mb-4">Opciones de Visualización</h3>
      
      {/* Selector de Modo de Visualización */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold mb-2">Escala de Visualización</h4>
        <div className="flex flex-wrap gap-2">
          <button
            className={`px-4 py-2 rounded-md ${
              modoVisualizacion === 'original' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
            onClick={() => setModoVisualizacion('original')}
          >
            Original
          </button>
          <button
            className={`px-4 py-2 rounded-md ${
              modoVisualizacion === 'logaritmo' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
            onClick={() => setModoVisualizacion('logaritmo')}
          >
            Logarítmica
          </button>
          <button
            className={`px-4 py-2 rounded-md ${
              modoVisualizacion === 'normalizado' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
            onClick={() => setModoVisualizacion('normalizado')}
          >
            Normalizada
          </button>
        </div>
      </div>
      
      {/* Selector de Hashtags */}
      <div>
        <h4 className="text-lg font-semibold mb-2">Hashtags Relacionados</h4>
        <div className="flex flex-wrap gap-2">
          {hashtags.map(hashtag => (
            <button
              key={hashtag}
              className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300"
              onClick={() => setHashtagSeleccionado(hashtag)}
            >
              {hashtag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MenuComponentes;