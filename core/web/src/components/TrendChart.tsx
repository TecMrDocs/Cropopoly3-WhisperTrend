"use client"

import { TrendingUp } from "lucide-react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis, Legend, ResponsiveContainer } from "recharts"

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

const chartData = [
  { fecha: "01/01/25 - 31/01/25", "Tasa Interacción X": 10.99, "Tasa Viralidad X": 1.75, "Tasa Interacción Instagram": 9.58, "Tasa Viralidad Instagram": 141.99 },
  { fecha: "1/02/25 - 28/02/25", "Tasa Interacción X": 1.88, "Tasa Viralidad X": 1.92, "Tasa Interacción Instagram": 346.06, "Tasa Viralidad Instagram": 213.98 },
  { fecha: "1/03/25 - 31/03/25", "Tasa Interacción X": 1.91, "Tasa Viralidad X": 0.69, "Tasa Interacción Instagram": 6.09, "Tasa Viralidad Instagram": 78.32 },
  { fecha: "1/04/25 - 19/04/25", "Tasa Interacción X": 25.52, "Tasa Viralidad X": 83.53, "Tasa Interacción Instagram": 4.26, "Tasa Viralidad Instagram": 5.35 },
]

const chartConfig = {
  "Tasa Interacción X": {
    label: "Tasa Interacción X",
    color: "#1f77b4",
  },
  "Tasa Viralidad X": {
    label: "Tasa Viralidad X",
    color: "#ff7f0e ",
  },
  "Tasa Interacción Instagram": {
    label: "Tasa Interacción Instagram",
    color: "#2ca02c ",
  },
  "Tasa Viralidad Instagram": {
    label: "Tasa Viralidad Instagram",
    color: "#d62728 ",
  },
} satisfies ChartConfig

export default function TrendChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Análisis de Métricas Sociales</CardTitle>
        <CardDescription>Enero - Abril 2025</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="fecha"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Legend />
              {Object.keys(chartConfig).map((key) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={chartConfig[key as keyof typeof chartConfig].color}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              Análisis de tasas de interacción y viralidad <TrendingUp className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              Comparativa entre diferentes plataformas sociales
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
