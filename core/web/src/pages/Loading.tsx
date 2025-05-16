import React from 'react';
import '/src/components/Loading.css';

export default function AnalysisLoading() {
  const steps = [
    "Analizando palabras relacionadas",
    "Analizando tendencias",
    "Calculando predicciones",
    "Preparando gráficas",
    "Preparando presentación",
  ];

  return (
    <div className=" bg-white flex flex-col items-center justify-center text-center pt-20">
      <h2 className="text-2xl md:text-3xl font-bold text-blue-900">
        Ejecutando análisis
      </h2>

      <div className="loader-square-50 pt-20">
        <div></div>
        <div></div>
        <div></div>
      </div>

      <div className="pt-10 mt-4">
        {steps.map((text, i) => (
          <p
            key={i}
            className="pt-7 font-bold text-blue-900 text-xl opacity-0 animate-fade-in-up"
            style={{
              animationDelay: `${1 + i * 1}s`,
              animationFillMode: 'forwards',
              animationDuration: '20s',
            }}
          >
            {text}
          </p>
        ))}
      </div>
    </div>
  );
}
