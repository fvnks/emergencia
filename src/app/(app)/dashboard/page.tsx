
"use client";

import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckCircle2, Activity, Users, Truck, ShieldCheck, Wrench, Loader2, LucideIcon, ArchiveX, CalendarClock, TruckOff } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { useEffect, useState } from "react";
import { getAllVehicles, type Vehicle } from "@/services/vehicleService";
import { getAllUsers, type User } from "@/services/userService";
import { getAllTasks, type Task, type TaskStatus } from "@/services/taskService";
import { getAllMaintenanceTasks, type MaintenanceTask } from "@/services/maintenanceService";
import { getAllEraEquipments, type EraEquipment } from "@/services/eraService";
import { getAllInventoryItems, type InventoryItem } from "@/services/inventoryService";
import { formatDistanceToNow, parseISO, isValid, format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addDays, isBefore, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from "@/lib/utils";

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
  type: 'task' | 'maintenance_log' | 'vehicle_log' | 'equipment_log' | 'personnel_log' | 'inventory_log' |
        'alert_stock' | 'alert_maintenance_overdue' | 'alert_vehicle_oos';
  details?: string;
  severity?: 'info' | 'warning' | 'error';
}

interface DailyOpsChartDataItem {
  name: string; // 'Lun', 'Mar', etc.
  ops: number;
  maint: number;
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
  const [dailyOpsChartData, setDailyOpsChartData] = useState<DailyOpsChartDataItem[]>([]);
  const [activeAlertsCount, setActiveAlertsCount] = useState<number | string>("N/A");


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

        const operative = vehiclesData.filter(v => v.estado_vehiculo === 'Operativo').length;
        setOperativeVehicles(operative);
        setTotalVehicles(vehiclesData.length);

        setPersonnelCount(usersData.length);
        setTotalPersonnel(usersData.length);

        const activeTasks = tasksData.filter(task => ACTIVE_TASK_STATUSES.includes(task.estado_tarea));
        const overdueTasks = activeTasks.filter(task => task.estado_tarea === 'Atrasada');
        setActiveTasksCount(activeTasks.length);
        setOverdueTasksCount(overdueTasks.length);

        const erasReady = eraData.filter(era => READY_ERA_STATUSES.includes(era.estado_era)).length;
        setReadyEraCount(erasReady);
        
        const extinguishersReady = inventoryData.filter(
          item => item.categoria_item?.toLowerCase() === EXTINGUISHER_CATEGORY.toLowerCase() && item.cantidad_actual > 0
        ).length;
        setReadyExtinguisherCount(extinguishersReady);

        setTotalReadyEquipmentCount(erasReady + extinguishersReady);

        const activities: ActivityItem[] = [];
        const today = startOfDay(new Date());

        // Generate Specific Alerts
        inventoryData.forEach(item => {
          if (item.stock_minimo && item.stock_minimo > 0 && item.cantidad_actual <= item.stock_minimo) {
            activities.push({
              id: `alert-stock-${item.id_item}`,
              date: new Date(), // Alert is current
              description: `Stock bajo: ${item.nombre_item} (${item.codigo_item}). Actual: ${item.cantidad_actual}, Mín: ${item.stock_minimo}.`,
              icon: AlertTriangle, // Using generic AlertTriangle, specific icon can be ArchiveX
              iconClassName: "text-red-500",
              type: 'alert_stock',
              severity: 'warning',
            });
          }
        });

        maintenanceData.forEach(maint => {
          if (maint.fecha_programada && isBefore(parseISO(maint.fecha_programada), today) && 
              maint.estado_mantencion !== 'Completada' && maint.estado_mantencion !== 'Cancelada') {
            activities.push({
              id: `alert-maint-${maint.id_mantencion}`,
              date: parseISO(maint.fecha_programada), // Date of the overdue event
              description: `Mantención Vencida: ${maint.nombre_item_mantenimiento}. Prog.: ${format(parseISO(maint.fecha_programada), 'dd-MM-yyyy', { locale: es })}.`,
              icon: AlertTriangle, // Using generic AlertTriangle, specific icon can be Wrench or CalendarClock
              iconClassName: "text-red-500",
              type: 'alert_maintenance_overdue',
              severity: 'error',
            });
          }
        });

        vehiclesData.forEach(vehicle => {
          if (vehicle.estado_vehiculo === 'Fuera de Servicio') {
            activities.push({
              id: `alert-vehicle-${vehicle.id_vehiculo}`,
              date: new Date(), // Alert is current
              description: `Vehículo Inoperativo: ${vehicle.marca} ${vehicle.modelo} (${vehicle.identificador_interno || vehicle.patente}) está 'Fuera de Servicio'.`,
              icon: AlertTriangle, // Using generic AlertTriangle, specific icon can be TruckOff
              iconClassName: "text-red-500",
              type: 'alert_vehicle_oos',
              severity: 'error',
            });
          }
        });
        
        // Add other activity logs (tasks, maintenance completions, etc.)
        tasksData
          .sort((a, b) => new Date(b.fecha_actualizacion).getTime() - new Date(a.fecha_actualizacion).getTime())
          .slice(0, 3) // Limit non-alert activities to avoid clutter if many alerts
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
              date: new Date(task.fecha_actualizacion),
              description: taskDesc,
              icon: Activity,
              iconClassName: "text-blue-500",
              type: 'task',
              severity: 'info',
            });
          });

        maintenanceData
          .filter(m => m.estado_mantencion === 'Completada' && m.fecha_completada) // Only completed for recent activity list
          .sort((a, b) => new Date(b.fecha_completada!).getTime() - new Date(a.fecha_completada!).getTime())
          .slice(0, 2)
          .forEach(maint => {
            activities.push({
              id: `maint-log-${maint.id_mantencion}`,
              date: parseISO(maint.fecha_completada!),
              description: `Mantención para "${maint.nombre_item_mantenimiento.substring(0,20)}..." completada.`,
              icon: Wrench,
              iconClassName: "text-green-500",
              type: 'maintenance_log',
              severity: 'info',
            });
          });
        
        setRecentActivity(
          activities
            .sort((a, b) => b.date.getTime() - a.date.getTime()) // Sort all activities including new alerts
            .slice(0, 7) // Show more items if alerts are present
        );

        // Update Active Alerts Count for StatCard
        const currentActiveAlerts = activities.filter(a => a.type.startsWith('alert_')).length;
        setActiveAlertsCount(currentActiveAlerts);


        const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
        const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
        const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

        const chartData: DailyOpsChartDataItem[] = daysInWeek.map(day => ({
            name: format(day, 'E', { locale: es }).charAt(0).toUpperCase() + format(day, 'E', { locale: es }).slice(1,3),
            ops: 0,
            maint: 0
        }));

        tasksData.forEach(task => {
            const taskCreationDate = new Date(task.fecha_creacion);
            chartData.forEach(dayData => {
                const dayDate = daysInWeek.find(d => (format(d, 'E', { locale: es }).charAt(0).toUpperCase() + format(d, 'E', { locale: es }).slice(1,3)) === dayData.name);
                if (dayDate && isValid(taskCreationDate) && isSameDay(taskCreationDate, dayDate)) {
                    dayData.ops += 1;
                }
            });
        });

        maintenanceData.forEach(maint => {
            if (maint.fecha_completada) {
                const maintCompletionDate = parseISO(maint.fecha_completada);
                 chartData.forEach(dayData => {
                    const dayDate = daysInWeek.find(d => (format(d, 'E', { locale: es }).charAt(0).toUpperCase() + format(d, 'E', { locale: es }).slice(1,3)) === dayData.name);
                    if (dayDate && isValid(maintCompletionDate) && isSameDay(maintCompletionDate, dayDate)) {
                        dayData.maint += 1;
                    }
                });
            }
        });
        setDailyOpsChartData(chartData);

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
        setActiveAlertsCount("Error");
        setRecentActivity([]);
        setDailyOpsChartData( Array(7).fill(null).map((_, i) => ({ name: format(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), i), 'E', { locale: es }).charAt(0).toUpperCase() + format(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), i), 'E', { locale: es }).slice(1,3), ops: 0, maint: 0 })) );
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
    const intervalId = setInterval(fetchDashboardData, 60000); // Refresh dashboard data every minute
    return () => clearInterval(intervalId);
  }, []);

  if (loading && recentActivity.length === 0) { // Show loading only on initial load
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        Cargando datos del panel...
      </div>
    );
  }

  if (error && recentActivity.length === 0) { // Show error only if it's the initial load error
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
          value={activeAlertsCount.toString()}
          icon={AlertTriangle}
          description={
            typeof activeAlertsCount === 'number' && activeAlertsCount > 0 
            ? "Requieren atención inmediata" 
            : "Sin alertas críticas"
          }
          iconClassName={
            typeof activeAlertsCount === 'number' && activeAlertsCount > 0 
            ? "text-red-500 animate-pulse" 
            : "text-green-500"
          }
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
                <BarChart data={dailyOpsChartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
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
            <CardTitle className="font-headline">Actividad Reciente y Alertas</CardTitle>
            <CardDescription>Registro de eventos importantes y alertas activas.</CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivity.length > 0 ? (
              <ul className="space-y-3 text-sm">
                {recentActivity.map((activity) => (
                  <li key={activity.id} className="flex items-start">
                    <activity.icon className={cn("h-4 w-4 mr-2 mt-0.5 flex-shrink-0", activity.iconClassName)} />
                    <div className="flex-grow">
                      <span className={cn(activity.type.startsWith('alert_') && "font-semibold")}>{activity.description}</span>
                      {isValid(activity.date) && (
                        <p className="text-xs text-muted-foreground">
                          {activity.type.startsWith('alert_') ? `Detectada ${formatDistanceToNow(activity.date, { addSuffix: true, locale: es })}` : formatDistanceToNow(activity.date, { addSuffix: true, locale: es })}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No hay actividad reciente ni alertas para mostrar.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

    