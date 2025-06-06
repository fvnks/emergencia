
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend as RechartsLegend, Tooltip as RechartsTooltip } from "recharts";
import { FileText, AlertTriangle } from "lucide-react";

const vehicleAvailabilityData = [
  { status: "Operativos", count: 12, fill: "hsl(var(--chart-1))" },
  { status: "En Mantención", count: 3, fill: "hsl(var(--chart-2))" },
  { status: "Fuera de Servicio", count: 2, fill: "hsl(var(--chart-4))" },
];

const vehicleAvailabilityChartConfig = {
  operativos: { label: "Operativos", color: "hsl(var(--chart-1))" },
  mantenimiento: { label: "En Mantención", color: "hsl(var(--chart-2))" },
  fueraDeServicio: { label: "Fuera de Servicio", color: "hsl(var(--chart-4))" },
} satisfies ChartConfig;


const eraAvailabilityData = [
  { status: "Disponibles", count: 25, fill: "hsl(var(--chart-1))" },
  { status: "Operativos (Asignados)", count: 18, fill: "hsl(var(--chart-2))" },
  { status: "En Mantención", count: 5, fill: "hsl(var(--chart-3))" },
  { status: "Requiere Inspección", count: 2, fill: "hsl(var(--chart-4))" },
];
const eraAvailabilityChartConfig = {
  disponibles: { label: "Disponibles", color: "hsl(var(--chart-1))" },
  operativos: { label: "Operativos", color: "hsl(var(--chart-2))" },
  mantenimiento: { label: "En Mantención", color: "hsl(var(--chart-3))" },
  inspeccion: { label: "Requiere Inspección", color: "hsl(var(--chart-4))" },
} satisfies ChartConfig;


const incidentResponseData = [
  { month: "Ene", "Tiempo Prom. (min)": 5.2 },
  { month: "Feb", "Tiempo Prom. (min)": 4.8 },
  { month: "Mar", "Tiempo Prom. (min)": 5.5 },
  { month: "Abr", "Tiempo Prom. (min)": 4.5 },
  { month: "May", "Tiempo Prom. (min)": 5.0 },
  { month: "Jun", "Tiempo Prom. (min)": 5.3 },
];
const incidentResponseChartConfig = {
  tiempo: { label: "Tiempo Prom. (min)", color: "hsl(var(--primary))" },
} satisfies ChartConfig;


const maintenanceComplianceData = [
  { name: "Vehículos", completadas: 30, vencidas: 5 },
  { name: "ERAs", completadas: 45, vencidas: 8 },
  { name: "Extintores", completadas: 80, vencidas: 3 },
  { name: "Otros Equipos", completadas: 22, vencidas: 2 },
];
const maintenanceComplianceChartConfig = {
  completadas: { label: "Completadas a Tiempo", color: "hsl(var(--chart-1))" },
  vencidas: { label: "Vencidas/Pendientes", color: "hsl(var(--chart-4))" },
} satisfies ChartConfig;

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-headline font-bold md:text-3xl flex items-center">
          <FileText className="mr-3 h-7 w-7 text-primary" />
          Informes y Estadísticas
        </h1>
      </div>
      <p className="text-muted-foreground">
        Visualización detallada del estado y rendimiento de los recursos. (Datos simulados para demostración)
      </p>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Disponibilidad de Vehículos</CardTitle>
            <CardDescription>Distribución del estado actual de la flota vehicular.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={vehicleAvailabilityChartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent hideLabel nameKey="status" />} />
                  <Pie data={vehicleAvailabilityData} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={100} labelLine={false} label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                      const RADIAN = Math.PI / 180;
                      const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                      const x = cx + radius * Math.cos(-midAngle * RADIAN);
                      const y = cy + radius * Math.sin(-midAngle * RADIAN);
                      return (
                        <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                          {`${(percent * 100).toFixed(0)}%`}
                        </text>
                      );
                    }}>
                    {vehicleAvailabilityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartLegend content={<ChartLegendContent nameKey="status" />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Disponibilidad de Equipos ERA</CardTitle>
            <CardDescription>Estado actual de los equipos de respiración autónoma.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={eraAvailabilityChartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent hideLabel nameKey="status"/>} />
                  <Pie data={eraAvailabilityData} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={100} labelLine={false} label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                      const RADIAN = Math.PI / 180;
                      const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                      const x = cx + radius * Math.cos(-midAngle * RADIAN);
                      const y = cy + radius * Math.sin(-midAngle * RADIAN);
                      return (
                        <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                          {`${(percent * 100).toFixed(0)}%`}
                        </text>
                      );
                    }}>
                    {eraAvailabilityData.map((entry, index) => (
                      <Cell key={`cell-era-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartLegend content={<ChartLegendContent nameKey="status" />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-md lg:col-span-2"> {/* Span 2 columnas en LG */}
          <CardHeader>
            <CardTitle>Tiempo de Respuesta a Incidentes (Simulado)</CardTitle>
            <CardDescription>Promedio mensual simulado de tiempo de respuesta en minutos.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={incidentResponseChartConfig} className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={incidentResponseData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))"/>
                  <XAxis dataKey="month" stroke="hsl(var(--foreground))"/>
                  <YAxis stroke="hsl(var(--foreground))" label={{ value: 'Minutos', angle: -90, position: 'insideLeft', offset: 10, style: { textAnchor: 'middle', fill: 'hsl(var(--foreground))' } }}/>
                  <ChartTooltip
                    cursor={true}
                    content={<ChartTooltipContent indicator="line" labelKey="Tiempo Prom. (min)" className="bg-background text-foreground border-border shadow-lg" />}
                  />
                   <RechartsLegend verticalAlign="top" height={36} content={<ChartLegendContent nameKey="month" />} />
                  <Line type="monotone" dataKey="Tiempo Prom. (min)" stroke="var(--color-tiempo)" strokeWidth={2} dot={{ r: 4, fill: "var(--color-tiempo)" }} activeDot={{ r: 6 }}/>
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-md lg:col-span-2"> {/* Span 2 columnas en LG */}
          <CardHeader>
            <CardTitle>Cumplimiento de Tareas de Mantención</CardTitle>
            <CardDescription>Número de tareas de mantención completadas versus vencidas/pendientes por tipo de ítem.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={maintenanceComplianceChartConfig} className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={maintenanceComplianceData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))"/>
                  <XAxis dataKey="name" stroke="hsl(var(--foreground))"/>
                  <YAxis stroke="hsl(var(--foreground))"/>
                   <ChartTooltip
                    content={<ChartTooltipContent className="bg-background text-foreground border-border shadow-lg" />}
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="completadas" stackId="a" fill="var(--color-completadas)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="vencidas" stackId="a" fill="var(--color-vencidas)" radius={[4, 4, 0, 0]}/>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
       <div className="mt-8 p-4 border-l-4 border-orange-400 bg-orange-50 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-orange-500" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-orange-700">
              <strong>Nota Importante:</strong> Todos los datos y gráficos presentados en esta sección son simulados y tienen fines demostrativos únicamente. No representan información operativa real.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

