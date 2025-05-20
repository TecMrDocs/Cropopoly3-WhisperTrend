import React from 'react';

type ConsolidacionProps = {
  data: any[]; // Puedes ajustar el tipo según los datos que manejes
  filtro: string;
  setFiltro: React.Dispatch<React.SetStateAction<string>>;
  onDetalleClick: (id: string) => void;
};

const Consolidacion: React.FC<ConsolidacionProps> = ({ data, filtro, setFiltro, onDetalleClick }) => {
  const filtrarDatos = () => {
    if (!filtro) return data;
    return data.filter(item => item.categoria === filtro);
  };

  return (
    <div className="p-6 bg-white rounded-3xl border border-gray-200 w-full">
      <h2 className="text-2xl font-bold mb-4 text-navy-900">Consolidación de Datos</h2>

      {/* Filtro */}
      <div className="mb-6 flex space-x-4">
        <button
          className={`px-4 py-2 rounded-full font-semibold ${
            filtro === '' ? 'bg-blue-700 text-white' : 'bg-blue-200 text-blue-700 hover:bg-blue-300'
          }`}
          onClick={() => setFiltro('')}
        >
          Todos
        </button>
        <button
          className={`px-4 py-2 rounded-full font-semibold ${
            filtro === 'Ventas' ? 'bg-blue-700 text-white' : 'bg-blue-200 text-blue-700 hover:bg-blue-300'
          }`}
          onClick={() => setFiltro('Ventas')}
        >
          Ventas
        </button>
        <button
          className={`px-4 py-2 rounded-full font-semibold ${
            filtro === 'Noticias' ? 'bg-blue-700 text-white' : 'bg-blue-200 text-blue-700 hover:bg-blue-300'
          }`}
          onClick={() => setFiltro('Noticias')}
        >
          Noticias
        </button>
        <button
          className={`px-4 py-2 rounded-full font-semibold ${
            filtro === 'Hashtags' ? 'bg-blue-700 text-white' : 'bg-blue-200 text-blue-700 hover:bg-blue-300'
          }`}
          onClick={() => setFiltro('Hashtags')}
        >
          Hashtags
        </button>
      </div>

      {/* Lista de datos filtrados */}
      <ul className="space-y-4 max-h-96 overflow-auto">
        {filtrarDatos().map(item => (
          <li
            key={item.id}
            className="flex justify-between items-center p-4 border border-gray-300 rounded-lg hover:bg-blue-50 cursor-pointer"
            onClick={() => onDetalleClick(item.id)}
          >
            <div>
              <h3 className="font-semibold text-navy-900">{item.titulo}</h3>
              <p className="text-gray-600">{item.descripcion}</p>
            </div>
            <button className="text-blue-600 hover:underline">Detalle</button>
          </li>
        ))}
        {filtrarDatos().length === 0 && (
          <li className="text-gray-500 text-center">No hay datos para mostrar</li>
        )}
      </ul>
    </div>
  );
};

export default Consolidacion;
