import React from 'react';

export default function AcercaDe() {
  return (
    <div className="min-h-screen px-6 py-12 flex flex-col items-center">
      <h1 className="text-4xl font-bold text-center mb-10">Acerca de</h1>

      <div className="space-y-8 max-w-3xl w-full">
        {/* Creación */}
        <div className="border-2 border-blue-300 rounded-xl p-6 shadow-md bg-white">
          <h2 className="text-xl font-semibold text-blue-800 mb-4">Creación</h2>
          <p className="text-justify text-blue-600">
            WhisperTrend es una solución de análisis de tendencia creada por Arturo Barrios, Lucio Reyes,
            Mariana Balderrábano, Renato García, Carlos Zamudio, Andrés Cabrera, Julio Vivas, Iván Ramos,
            Sebastián Antonio y Santiago Villazón, alumnos de 6° semestre de la Ingeniería en Tecnologías
            Computacionales del Instituto Tecnológico y de Estudios Superiores de Monterrey, Campus Estado
            de México, para NDS, como parte del proyecto final de Desarrollo e implementación de sistemas de software.
          </p>
        </div>

        {/* Misión */}
        <div className="border-2 border-blue-300 rounded-xl p-6 shadow-md bg-white">
          <h2 className="text-xl font-semibold text-blue-800 mb-4">Misión</h2>
          <p className="text-justify text-blue-600">
            Nuestra misión es ayudar a las empresas a escuchar lo que el mercado susurra antes de que se vuelva un grito.
            A través del análisis de noticias, redes sociales y datos empresariales, WhisperTrend detecta, califica
            y correlaciona tendencias emergentes para que las organizaciones puedan anticiparse, tomar decisiones
            informadas y proteger su crecimiento frente a amenazas invisibles.
          </p>
        </div>

        {/* Visión */}
        <div className="border-2 border-blue-300 rounded-xl p-6 shadow-md bg-white">
          <h2 className="text-xl font-semibold text-blue-800 mb-4">Visión</h2>
          <p className="text-justify text-blue-600">
            Ser la plataforma líder en inteligencia de mercado predictiva, permitiendo que empresas de todos los tamaños
            conviertan información dispersa en conocimiento accionable. Aspiramos a crear un entorno donde cada decisión
            empresarial esté guiada por datos relevantes, en tiempo real, y adaptados al contexto único de cada organización.
          </p>
        </div>
      </div>
    </div>
  );
}
