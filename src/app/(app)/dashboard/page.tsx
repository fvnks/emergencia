"use client";

import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckCircle2, Activity, Users, Truck, ShieldCheck, Wrench } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";


const dailyOpsData = [
  { name: 'Lun', ops: 4, maint: 2 },
  { name: 'Mar', ops: 3, maint: 1 },
  { name: 'Mié', ops: 5, maint: 3 },
  { name: 'Jue', ops: 2, maint: 2 },
  { name: 'Vie', ops: 6, maint: 1 },
  { name: 'Sáb', ops: 3, maint: 0 },
  { name: 'Dom', ops: 1, maint: 1 },
];

const chartConfig = {
  ops: {
    label: "Operaciones",
    color: "hsl(var(--primary))",
  },
  maint: {
    label: "Mantenciones",
    color: "hsl(var(--accent))",
  },
} satisfies import("@/components/ui/chart").ChartConfig;


export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard
          title="Vehículos Operativos"
          value="8"
          icon={Truck}
          description="De 10 en total"
          iconClassName="text-green-500"
        />
        <StatCard
          title="Tareas Activas"
          value="12"
          icon={Activity}
          description="3 atrasadas"
          iconClassName="text-blue-500"
        />
        <StatCard
          title="Personal Disponible"
          value="9"
          icon={Users}
          description="De 11 en total"
          iconClassName="text-green-500"
        />
        <StatCard
          title="Equipos Listos"
          value="45"
          icon={ShieldCheck}
          description="ERA y Extintores"
          iconClassName="text-teal-500"
        />
        <StatCard
          title="Alertas Activas"
          value="2"
          icon={AlertTriangle}
          description="Requieren atención inmediata"
          iconClassName="text-red-500"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline">Operaciones y Mantenciones Diarias</CardTitle>
            <CardDescription>Resumen de la semana actual.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyOpsData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--foreground))" />
                  <YAxis stroke="hsl(var(--foreground))" />
                  <ChartTooltip
                    content={<ChartTooltipContent hideLabel className="bg-background text-foreground border-border shadow-lg" />}
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="ops" fill="var(--color-ops)" radius={4} />
                  <Bar dataKey="maint" fill="var(--color-maint)" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline">Actividad Reciente</CardTitle>
            <CardDescription>Registro de eventos importantes recientes.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start">
                <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                <span>Vehículo #3 (Patente GHIJ-12) regresó de mantención.</span>
              </li>
              <li className="flex items-start">
                <Activity className="h-4 w-4 mr-2 mt-0.5 text-blue-500 flex-shrink-0" />
                <span>Nueva tarea "Simulacro Revisión Equipos" asignada al Equipo Alfa.</span>
              </li>
              <li className="flex items-start">
                <Wrench className="h-4 w-4 mr-2 mt-0.5 text-yellow-600 flex-shrink-0" />
                <span>Unidad ERA #E007 programada para inspección mañana.</span>
              </li>
              <li className="flex items-start">
                <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 text-red-500 flex-shrink-0" />
                <span>Alerta de combustible bajo para Vehículo #5.</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
