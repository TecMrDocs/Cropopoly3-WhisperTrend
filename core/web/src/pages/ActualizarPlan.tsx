import { useState } from "react";

export default function ActualizarPlan() {
  const [planSelected, setPlanSelected] = useState<string | null>(null);
  const plans = [
    { id: "tracker", label: "Plan Tracker" },
    { id: "caster", label: "Plan Caster" },
    { id: "glider", label: "Plan Glider" },
  ];

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