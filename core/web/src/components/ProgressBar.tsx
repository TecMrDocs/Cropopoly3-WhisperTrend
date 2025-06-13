/**
 * Componente: ProgressBar
 * 
 * Este componente visualiza una barra de progreso con 4 pasos secuenciales
 * representados con íconos, textos y tooltips. Su propósito es guiar al usuario
 * a través de las distintas etapas del registro de su empresa en el proceso de lanzamiento.
 * 
 * Authors: Arturo Barrios Mendoza
 * Contribuyentes: -
 * 

 */

import { ReactElement } from 'react';
import { LiaIndustrySolid } from "react-icons/lia";
import { GiCardboardBox } from "react-icons/gi";
import { LuChartNoAxesCombined } from "react-icons/lu";
import { MdOutlineTravelExplore } from "react-icons/md";

/**
 * Tipo que representa un paso de la barra de progreso.
 * 
 * @property icon Icono visual representativo del paso
 * @property text Descripción breve que aparece debajo del ícono
 * @property color Clase de fondo del círculo que contiene el ícono
 * @property tooltip Texto explicativo que se muestra al pasar el cursor
 */
type Step = {
  icon: ReactElement;
  text: string;
  color: string;
  tooltip?: string;
};

/**
 * Props del componente ProgressBar.
 * 
 * @property activeStep Índice del paso actualmente activo (0 basado)
 */
type ProgressBarProps = {
  activeStep: number;
};

/**
 * Arreglo que define los pasos de la barra de progreso.
 * Cada paso tiene su ícono, texto, color y contenido del tooltip.
 */
const steps: Step[] = [
  {
    icon: <LiaIndustrySolid />,
    text: "¡Cuéntanos de tu empresa!",
    color: "bg-blue-600",
    tooltip: "Queremos conocerte mejor para brindarte contenido relevante y alineado a tu industria. La información que compartas nos permitirá identificarte de forma individual y segura, garantizando una experiencia personalizada."
  },
  {
    icon: <GiCardboardBox />,
    text: "¡Háblanos de tus productos y servicios!",
    color: "bg-sky-600",
    tooltip: "En esta sección, queremos conocer mejor los productos y/o servicios que ofrece tu empresa. Esta información nos ayudará a personalizar la búsqueda de tendencias y hacerla más relevante para tu negocio."
  },
  {
    icon: <LuChartNoAxesCombined />,
    text: "¡Cuéntanos sobre tus ventas!",
    color: "bg-cyan-500",
    tooltip: "Comparte con nosotros cómo van tus ventas. Con esa información podremos cruzarla con datos de redes sociales y mostrarte tendencias que te ayuden a ver hacia dónde va tu negocio."
  },
  {
    icon: <MdOutlineTravelExplore />,
    text: "¡Exploremos tu mercado!",
    color: "bg-emerald-400",
    tooltip: "Reunimos datos de redes y noticias, los conectamos y te mostramos las tendencias en gráficas claras. Personaliza tu tablero y elige las variables que quieres ver."
  }
];

/**
 * Componente funcional que renderiza la barra de progreso.
 * 
 * @param activeStep Número del paso actualmente activo
 * @return Barra visual con íconos, colores y tooltips que indican el progreso
 */
export default function ProgressBar({ activeStep }: ProgressBarProps) {
  return (
    <div className="p-8 flex justify-center">
      {/* Contenedor de alineación centrada de la barra */}
      <div className="relative inline-flex flex-col items-center">

        /**
         * Sección superior de la barra que contiene los círculos con íconos y líneas de conexión.
         * Incluye una línea horizontal que conecta todos los pasos y los íconos dentro de círculos.
         */
        <div className="relative flex gap-20 mb-5">
          <div className="absolute top-1/2 left-0 right-0 h-3 bg-gray-300 z-0 transform -translate-y-1/2" />

          {steps.map((step, index) => (
            <div key={index} className="relative group w-24 flex justify-center z-10">
              
              /**
               * Tooltip que aparece al pasar el cursor sobre el paso.
               * Se colorea dependiendo de si el paso ya fue alcanzado o no.
               */
              <div className={`absolute bottom-full mb-2 px-3 py-2 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition whitespace-normal w-64 text-left z-20 shadow-lg ${index <= activeStep ? step.color : "bg-gray-500"}`}>
                {step.tooltip}
              </div>

              /**
               * Círculo del paso con el ícono centrado.
               * El color depende de si el paso está activo o no.
               */
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

        /**
         * Sección inferior de la barra con el texto de cada paso.
         * Los textos están alineados con su respectivo ícono.
         */
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
