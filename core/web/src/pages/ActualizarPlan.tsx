/**
 * Página para seleccionar y actualizar el plan del usuario.
 *
 * Este componente muestra una interfaz interactiva para que el usuario
 * elija uno de los planes disponibles (Tracker, Caster o Glider).
 * El plan seleccionado se resalta visualmente.
 *
 * Autor: -
 * Contribuyentes: —
 */

import { useState } from "react";

/**
 * Componente que permite seleccionar un plan de entre varias opciones disponibles.
 * El plan seleccionado se guarda en el estado `planSelected`.
 *
 * @return {JSX.Element}
 */
export default function ActualizarPlan() {
  /**
   * Estado que guarda el identificador del plan seleccionado.
   * Puede ser una cadena (id del plan) o `null` si no hay selección.
   */
  const [planSelected, setPlanSelected] = useState<string | null>(null);

  /**
   * Arreglo de planes disponibles para mostrar al usuario.
   * Cada plan tiene un `id` y un `label` para representar su nombre visible.
   */
  const plans = [
    { id: "tracker", label: "Plan Tracker" },
    { id: "caster", label: "Plan Caster" },
    { id: "glider", label: "Plan Glider" },
  ];

  /**
   * Renderiza la sección de selección de planes.
   * Cada opción se presenta como una tarjeta clickeable que cambia de estilo
   * si está seleccionada.
   *
   * @return {JSX.Element}
   */
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-semibold mb-4">Actualizar Plan</h1>
      <div className="flex gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={[
              "flex-1 p-4 rounded-lg border cursor-pointer text-center transition",
              planSelected === plan.id
                ? "bg-blue-100 border-blue-500"
                : "bg-white border-gray-300 hover:bg-gray-50",
            ].join(" ")}
            onClick={() => setPlanSelected(plan.id)}
          >
            {plan.label}
          </div>
        ))}
      </div>
    </div>
  );
}
