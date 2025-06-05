
"use client";

import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckCircle2, Activity, Users, Truck, ShieldCheck, Wrench, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { useEffect, useState } from "react";
import { getAllVehicles, type Vehicle } from "@/services/vehicleService";
import { getAllUsers, type User } from "@/services/userService";
import { getAllTasks, type Task, type TaskStatus } from "@/services/taskService";
import { getAllEraEquipments, type EraEquipment } from "@/services/eraService";
import { getAllInventoryItems, type InventoryItem } from "@/services/inventoryService";


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

const ACTIVE_TASK_STATUSES: TaskStatus[] = ['Pendiente', 'Programada', 'En Proceso', 'Atrasada'];
const READY_ERA_STATUSES: EraEquipment["estado_era"][] = ['Operativo', 'Disponible'];
const EXTINGUISHER_CATEGORY = "Extintores";


export default function DashboardPage() {
  const [operativeVehicles, setOperativeVehicles] = useState<number | string>("N/A");
  const [totalVehicles, setTotalVehicles] = useState<number | string>("N/A");
  const [personnelCount, setPersonnelCount] = useState<number | string>("N/A");
  const [totalPersonnel, setTotalPersonnel] = useState<number | string>("N/A");
  const [activeTasksCount, setActiveTasksCount] = useState<number | string>("N/A");
  const [overdueTasksCount, setOverdueTasksCount] = useState<number | string>("N/A");
  const [readyEraCount, setReadyEraCount] = useState<number | string>("N/A");
  const [readyExtinguisherCount, setReadyExtinguisherCount] = useState<number | string>("N/A");
  const [totalReadyEquipmentCount, setTotalReadyEquipmentCount] = useState<number | string>("N/A");


  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true);
      setError(null);
      try {
        const [vehiclesData, usersData, tasksData, eraData, inventoryData] = await Promise.all([
          getAllVehicles(),
          getAllUsers(),
          getAllTasks(),
          getAllEraEquipments(),
          getAllInventoryItems(),
        ]);

        // Process vehicle data
        const operative = vehiclesData.filter(v => v.estado_vehiculo === 'Operativo').length;
        setOperativeVehicles(operative);
        setTotalVehicles(vehiclesData.length);

        // Process personnel data
        setPersonnelCount(usersData.length);
        setTotalPersonnel(usersData.length);

        // Process tasks data
        const activeTasks = tasksData.filter(task => ACTIVE_TASK_STATUSES.includes(task.estado_tarea));
        const overdueTasks = activeTasks.filter(task => task.estado_tarea === 'Atrasada');
        setActiveTasksCount(activeTasks.length);
        setOverdueTasksCount(overdueTasks.length);

        // Process ERA data
        const erasReady = eraData.filter(era => READY_ERA_STATUSES.includes(era.estado_era)).length;
        setReadyEraCount(erasReady);
        
        // Process Inventory data for Extinguishers
        const extinguishersReady = inventoryData.filter(
          item => item.categoria_item?.toLowerCase() === EXTINGUISHER_CATEGORY.toLowerCase() && item.cantidad_actual > 0
        ).length;
        setReadyExtinguisherCount(extinguishersReady);

        setTotalReadyEquipmentCount(erasReady + extinguishersReady);

      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(err instanceof Error ? err.message : "No se pudieron cargar los datos del panel.");
        setOperativeVehicles("Error");
        setTotalVehicles("Error");
        setPersonnelCount("Error");
        setTotalPersonnel("Error");
        setActiveTasksCount("Error");
        setOverdueTasksCount("Error");
        setReadyEraCount("Error");
        setReadyExtinguisherCount("Error");
        setTotalReadyEquipmentCount("Error");
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        Cargando datos del panel...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-destructive">
        <AlertTriangle className="h-8 w-8 mr-2" />
        Error al cargar el panel: {error}
      </div>
    );
  }

  const readyEquipmentDescription = () => {
    let parts: string[] = [];
    if (readyEraCount !== "N/A" && readyEraCount !== "Error" && typeof readyEraCount === 'number' && readyEraCount > 0) {
        parts.push(`${readyEraCount} ERA${readyEraCount > 1 ? 's' : ''}`);
    }
    if (readyExtinguisherCount !== "N/A" && readyExtinguisherCount !== "Error" && typeof readyExtinguisherCount === 'number' && readyExtinguisherCount > 0) {
        parts.push(`${readyExtinguisherCount} Extintor${readyExtinguisherCount > 1 ? 'es' : ''}`);
    }
    if (parts.length === 0) return "No hay equipos listos.";
    return parts.join(" y ") + " listos.";
  };


  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard
          title="Vehículos Operativos"
          value={operativeVehicles.toString()}
          icon={Truck}
          description={totalVehicles !== "N/A" && totalVehicles !== "Error" ? `De ${totalVehicles} en total` : ""}
          iconClassName="text-green-500"
        />
        <StatCard
          title="Tareas Activas"
          value={activeTasksCount.toString()}
          icon={Activity}
          description={overdueTasksCount !== "N/A" && overdueTasksCount !== "Error" && typeof overdueTasksCount === 'number' && overdueTasksCount > 0 ? `${overdueTasksCount} atrasada(s)` : "Ninguna tarea atrasada"}
          iconClassName="text-blue-500"
        />
        <StatCard
          title="Personal Disponible"
          value={personnelCount.toString()}
          icon={Users}
          description={totalPersonnel !== "N/A" && totalPersonnel !== "Error" ? `${totalPersonnel} miembros registrados` : ""}
          iconClassName="text-green-500"
        />
        <StatCard
          title="Equipos Listos"
          value={totalReadyEquipmentCount.toString()}
          icon={ShieldCheck}
          description={readyEquipmentDescription()}
          iconClassName="text-teal-500"
        />
        <StatCard
          title="Alertas Activas"
          value="2" // Placeholder
          icon={AlertTriangle}
          description="Requieren atención inmediata" // Placeholder
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
