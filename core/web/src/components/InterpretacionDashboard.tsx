import React from 'react';

const InterpretacionDashboard = () => {
  return (
    <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
      <h2 className="text-2xl font-semibold mb-4 text-blue-600">Interpretación de Tendencias</h2>
      <p className="text-gray-700 mb-3">
        En esta sección puedes visualizar cómo se comportan diferentes métricas de rendimiento en redes sociales a lo largo del tiempo.
      </p>
      <p className="text-gray-700">
        Usa las opciones para cambiar entre los valores originales, su escala logarítmica o una versión normalizada para facilitar la comparación entre métricas de diferente orden de magnitud.
      </p>
    </div>
  );
};

export default InterpretacionDashboard;