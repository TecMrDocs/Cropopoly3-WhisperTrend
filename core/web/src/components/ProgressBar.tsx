import React, { ReactElement } from 'react';
import { LiaIndustrySolid } from "react-icons/lia";
import { GiCardboardBox } from "react-icons/gi";
import { LuChartNoAxesCombined } from "react-icons/lu";
import { MdOutlineTravelExplore } from "react-icons/md";

type Step = {
  icon: ReactElement;
  text: string;
  color: string;
};

type ProgressBarProps = {
  activeStep: number;
};

const steps: Step[] = [
  {
    icon: <LiaIndustrySolid />,
    text: "¡Cuéntanos de tu empresa!",
    color: "bg-blue-600"
  },
  {
    icon: <GiCardboardBox />,
    text: "¡Háblanos de tus productos y servicios!",
    color: "bg-sky-600"
  },
  {
    icon: <LuChartNoAxesCombined />,
    text: "¡Cuéntanos sobre tus ventas!",
    color: "bg-cyan-500"
  },
  {
    icon: <MdOutlineTravelExplore />,
    text: "¡Exploremos tu mercado!",
    color: "bg-emerald-400"
  }
];

export default function ProgressBar({ activeStep }: ProgressBarProps) {
  return (
    <div className="p-8 flex justify-center">
      {/* Contenedor ajustado al contenido */}
      <div className="relative inline-flex flex-col items-center">
        {/* Fila de íconos con línea de fondo */}
        <div className="relative flex gap-20 mb-5">
          {/* Línea horizontal limitada al ancho de los círculos */}
          <div className="absolute top-1/2 left-0 right-0 h-3 bg-gray-300 z-0 transform -translate-y-1/2" />

          {steps.map((step, index) => (
            <div key={index} className="w-24 flex justify-center z-10">
              <div
                className={`w-20 h-20 rounded-full ${
                  index <= activeStep ? step.color : "bg-gray-500"
                } text-white flex items-center justify-center text-5xl ring-10 ring-gray-300`}
              >
                {step.icon}
              </div>
            </div>
          ))}
        </div>

        {/* Fila de textos */}
        <div className="flex justify-center gap-20">
          {steps.map((step, index) => (
            <div key={index} className="w-24 text-center text-sm leading-tight">
              {step.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

