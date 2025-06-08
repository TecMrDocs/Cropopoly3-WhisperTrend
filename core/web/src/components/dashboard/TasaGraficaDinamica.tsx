import { Line, Tooltip } from "recharts";
import { YAxis } from "recharts";
import { XAxis } from "recharts";
import { CartesianGrid } from "recharts";
import { LineChart } from "recharts";
import { ResponsiveContainer } from "recharts";



export default function TasasGraficaDinamica({ tasasIds, datosTasas }: { tasasIds: string[], datosTasas: any })  {
  console.log("Renderizando TasasGraficaDinamica con tasasIds:", tasasIds);
  if (!tasasIds || tasasIds.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <div className="text-4xl mb-2">📊</div>
          <div>Selecciona tasas para visualizar</div>
        </div>
      </div>
    );
  }

  const generarDatosCombinados = () => {
    const todasFechas = Array.from(
      new Set(
        tasasIds.flatMap(id => {
          const tasa = datosTasas[id as keyof typeof datosTasas];
          return tasa ? tasa.datos.map((d: any) => d.fecha) : [];
        })
      )
    );

    return todasFechas.map(fecha => {
      const item: any = { fecha };      
      tasasIds.forEach(id => {
        const tasa = datosTasas[id as keyof typeof datosTasas];
        if (tasa) {
          const datoTasa = tasa.datos.find((d: any) => d.fecha === fecha);
          item[id] = datoTasa ? datoTasa.tasa : 0;
        }
      });
      return item;
    });
  };

  const datosCombinados = generarDatosCombinados();
  console.log("Datos combinados generados:", datosCombinados);

  return (
    <div className="w-full">
      <h3 className="text-xl font-bold text-center mb-4 text-purple-700">
        📈 Comparativa de Tasas Seleccionadas
      </h3>
      <div className="w-full h-80">
        <ResponsiveContainer>
          <LineChart data={datosCombinados} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
            <XAxis 
              dataKey="fecha" 
              tick={{ fontSize: 11 }}
              angle={-30}
              textAnchor="end"
              height={80}
            />
              <YAxis 
                domain={[0, 'dataMax + 10']} 
                tickFormatter={(value) => `${value}%`}
                tick={{ fontSize: 11 }}
              />
            <Tooltip 
              formatter={(value: number, name: string) => {
                const tasa = datosTasas[name as keyof typeof datosTasas];
                return [`${value}%`, tasa?.nombre || name];
              }}
              labelStyle={{ color: '#374151' }}
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '12px'
              }}
            />
            {tasasIds.map((id) => {
              const tasa = datosTasas[id as keyof typeof datosTasas];
              if (!tasa) {
                console.warn(`No se encontró tasa para ID: ${id}`);
                return null;
              }
              
              return (
                <Line 
                  key={id}
                  type="linear" 
                  dataKey={id} 
                  stroke={tasa.color} 
                  name={id}
                  strokeWidth={3}
                  dot={{ r: 4, fill: tasa.color }}
                  activeDot={{ r: 6, fill: tasa.color }}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 flex flex-wrap gap-2 justify-center">
        {tasasIds.map(id => {
          const tasa = datosTasas[id as keyof typeof datosTasas];
          if (!tasa) return null;
          return (
            <div 
              key={id}
              className="flex items-center px-3 py-1 rounded-full text-xs font-medium text-white"
              style={{ backgroundColor: tasa.color }}
            >
              <div 
                className="w-2 h-2 bg-white rounded-full mr-2"
              ></div>
              {tasa.nombre}
            </div>
          );
        })}
      </div>
    </div>
  );
};