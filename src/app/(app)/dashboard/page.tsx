
"use client";

import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckCircle2, Activity, Users, Truck, ShieldCheck, Wrench, Loader2, LucideIcon } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { useEffect, useState } from "react";
import { getAllVehicles, type Vehicle } from "@/services/vehicleService";
import { getAllUsers, type User } from "@/services/userService";
import { getAllTasks, type Task, type TaskStatus } from "@/services/taskService";
import { getAllMaintenanceTasks, type MaintenanceTask } from "@/services/maintenanceService";
import { getAllEraEquipments, type EraEquipment } from "@/services/eraService";
import { getAllInventoryItems, type InventoryItem } from "@/services/inventoryService";
import { formatDistanceToNow, parseISO, isValid } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from "@/lib/utils";

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

interface ActivityItem {
  id: string;
  date: Date;
  description: string;
  icon: LucideIcon;
  iconClassName: string;
  type: 'task' | 'maintenance' | 'vehicle' | 'equipment' | 'personnel' | 'inventory' | 'alert';
}


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
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);


  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true);
      setError(null);
      try {
        const [vehiclesData, usersData, tasksData, eraData, inventoryData, maintenanceData] = await Promise.all([
          getAllVehicles(),
          getAllUsers(),
          getAllTasks(),
          getAllEraEquipments(),
          getAllInventoryItems(),
          getAllMaintenanceTasks(),
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

        // Process Recent Activity
        const activities: ActivityItem[] = [];

        // Recent Tasks (last 3 updated/created)
        tasksData
          .sort((a, b) => new Date(b.fecha_actualizacion).getTime() - new Date(a.fecha_actualizacion).getTime())
          .slice(0, 3)
          .forEach(task => {
            let taskDesc = `Tarea T-${task.id_tarea.toString().padStart(3,'0')}`;
            if (task.fecha_actualizacion !== task.fecha_creacion && task.estado_tarea === 'Completada') {
              taskDesc += ` "${task.descripcion_tarea.substring(0,20)}..." completada.`;
            } else if (task.fecha_actualizacion !== task.fecha_creacion) {
              taskDesc += ` actualizada: "${task.descripcion_tarea.substring(0,20)}...". Estado: ${task.estado_tarea}.`;
            } else {
              taskDesc += ` creada: "${task.descripcion_tarea.substring(0,20)}...".`;
            }
            activities.push({
              id: `task-${task.id_tarea}`,
              date: new Date(task.fecha_actualizacion), // Changed from parseISO
              description: taskDesc,
              icon: Activity,
              iconClassName: "text-blue-500",
              type: 'task',
            });
          });

        // Recent Maintenance (last 2 scheduled/completed)
        maintenanceData
          .sort((a, b) => {
            // Prioritize completada, then programada, then actualizacion for sorting
            const dateAValue = a.fecha_completada || a.fecha_programada || a.fecha_actualizacion;
            const dateBValue = b.fecha_completada || b.fecha_programada || b.fecha_actualizacion;
            return new Date(dateBValue).getTime() - new Date(dateAValue).getTime();
          })
          .slice(0, 2)
          .forEach(maint => {
            let maintDesc = `Mantención para "${maint.nombre_item_mantenimiento.substring(0,20)}..."`;
            let activityDate: Date;

            if (maint.estado_mantencion === 'Completada' && maint.fecha_completada) {
              maintDesc += ` completada.`;
              activityDate = parseISO(maint.fecha_completada); // parseISO for YYYY-MM-DD strings
            } else if (maint.fecha_programada) {
              maintDesc += ` programada.`;
              activityDate = parseISO(maint.fecha_programada); // parseISO for YYYY-MM-DD strings
            } else {
              maintDesc += ` registrada.`;
              activityDate = new Date(maint.fecha_actualizacion); // Changed from parseISO
            }
            activities.push({
              id: `maint-${maint.id_mantencion}`,
              date: activityDate,
              description: maintDesc,
              icon: Wrench,
              iconClassName: "text-yellow-600",
              type: 'maintenance',
            });
          });
        
        // Recent Vehicles (last 1 added)
        vehiclesData
            .sort((a,b) => new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime())
            .slice(0,1)
            .forEach(vehicle => {
                activities.push({
                    id: `vehicle-${vehicle.id_vehiculo}`,
                    date: new Date(vehicle.fecha_creacion), // Changed from parseISO
                    description: `Nuevo vehículo ${vehicle.marca} ${vehicle.modelo} (ID: ${vehicle.identificador_interno || vehicle.patente || vehicle.id_vehiculo}) agregado.`,
                    icon: Truck,
                    iconClassName: "text-green-500",
                    type: 'vehicle',
                });
            });
        
        // Placeholder Alert (can be replaced with real alert logic later)
         activities.push({
              id: 'alert-fuel-low',
              date: new Date(Date.now() - 2 * 60 * 60 * 1000), // Example: 2 hours ago
              description: "Alerta de combustible bajo para Vehículo #5 (Patente XYZ-789).",
              icon: AlertTriangle,
              iconClassName: "text-red-500",
              type: 'alert',
            });


        setRecentActivity(
          activities
            .sort((a, b) => b.date.getTime() - a.date.getTime())
            .slice(0, 5) // Show top 5 most recent activities overall
        );


      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(err instanceof Error ? err.message : "No se pudieron cargar los datos del panel.");
        // Set all data points to error state
        setOperativeVehicles("Error");
        setTotalVehicles("Error");
        setPersonnelCount("Error");
        setTotalPersonnel("Error");
        setActiveTasksCount("Error");
        setOverdueTasksCount("Error");
        setReadyEraCount("Error");
        setReadyExtinguisherCount("Error");
        setTotalReadyEquipmentCount("Error");
        setRecentActivity([]);
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
          value={recentActivity.filter(a => a.type === 'alert').length.toString()}
          icon={AlertTriangle}
          description="Requieren atención inmediata"
          iconClassName="text-red-500"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-md">
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

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="font-headline">Actividad Reciente</CardTitle>
            <CardDescription>Registro de eventos importantes recientes.</CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivity.length > 0 ? (
              <ul className="space-y-3 text-sm">
                {recentActivity.map((activity) => (
                  <li key={activity.id} className="flex items-start">
                    <activity.icon className={cn("h-4 w-4 mr-2 mt-0.5 flex-shrink-0", activity.iconClassName)} />
                    <div className="flex-grow">
                      <span>{activity.description}</span>
                      {isValid(activity.date) && (
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(activity.date, { addSuffix: true, locale: es })}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No hay actividad reciente para mostrar.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
