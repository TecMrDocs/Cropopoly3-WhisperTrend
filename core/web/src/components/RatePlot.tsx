import { TrendingUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { CartesianGrid, Line, LineChart, XAxis, YAxis, Legend,  } from "recharts";

// Importamos los resultados de cada calculadora
import { resultadoXCalc } from '../mathCalculus/XCalc';
import { resultadoRedditCalc } from '../mathCalculus/RedditCalc';
import { resultadoInstaCalc } from '../mathCalculus/InstaCalc';

// Definición de los datos de tasa para mostrar en el componente seleccionado
const datosTasas = {
  'virX': { 
    nombre: 'Tasa de viralidad en X', 
    datos: resultadoXCalc.datosViralidad, 
    color: '#8884d8' 
  },
  'intX': { 
    nombre: 'Tasa de interacción en X', 
    datos: resultadoXCalc.datosInteraccion, 
    color: '#8884d8' 
  },
  'virInsta': { 
    nombre: 'Tasa de viralidad en Instagram', 
    datos: resultadoInstaCalc.datosViralidad, 
    color: '#82ca9d' 
  },
  'intInsta': { 
    nombre: 'Tasa de interacción en Instagram', 
    datos: resultadoInstaCalc.datosInteraccion, 
    color: '#82ca9d' 
  },
  'virReddit': { 
    nombre: 'Tasa de viralidad en Reddit', 
    datos: resultadoRedditCalc.datosViralidad, 
    color: '#ffc658' 
  },
  'intReddit': { 
    nombre: 'Tasa de interacción en Reddit', 
    datos: resultadoRedditCalc.datosInteraccion, 
    color: '#ffc658' 
  }
};

const RatePlot = ({ tasasIds }: { tasasIds: string[] }) => {
  if (!tasasIds || tasasIds.length === 0) {
    return <div>Selecciona al menos una tasa para visualizar</div>;
  }

  const generarDatosCombinados = () => {
    // Obtenemos todas las fechas de todos los conjuntos de datos seleccionados
    const todasFechas = Array.from(
      new Set(
        tasasIds.flatMap(id => {
          const tasa = datosTasas[id as keyof typeof datosTasas];
          return tasa ? tasa.datos.map((d: any) => d.fecha) : [];
        })
      )
    );

    // Para cada fecha, creamos un objeto con los valores de todas las tasas seleccionadas
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

  const chartConfig: ChartConfig = {};
  tasasIds.forEach(id => {
    const tasa = datosTasas[id as keyof typeof datosTasas];
    if (tasa) {
      chartConfig[id] = {
        label: tasa.nombre,
        color: tasa.color
      };
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comparativa de Tasas</CardTitle>
        <CardDescription>Visualización de las tasas seleccionadas a lo largo del tiempo</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            data={datosCombinados}
            margin={{
              left: 12,
              right: 12,
              top: 12,
              bottom: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="fecha"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              domain={[0, 'dataMax']}
              tickFormatter={(value) => `${value}%`}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent />}
              formatter={(value) => `${value}%`}
            />
            <Legend />
            {tasasIds.map(id => {
              const tasa = datosTasas[id as keyof typeof datosTasas];
              if (!tasa) return null;
              
              return (
                <Line 
                  key={id}
                  type="linear" 
                  dataKey={id} 
                  stroke={tasa.color} 
                  name={tasa.nombre} 
                  strokeWidth={2}
                  dot={false}
                />
              );
            })}
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Análisis de tasas <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Visualización de tasas por período
        </div>
      </CardFooter>
    </Card>
  );
};

export default RatePlot;