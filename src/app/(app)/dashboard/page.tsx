
"use client";

import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckCircle2, Activity, Users, Truck, ShieldCheck, Wrench, Loader2, LucideIcon, ArchiveX, CalendarClock, ClipboardList } from "lucide-react";
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
import { useAuth } from "@/contexts/auth-context";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useAppData, type AlertNotificationItem } from "@/contexts/app-data-context"; 

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
  link?: string;
}

interface DailyOpsChartDataItem {
  name: string; // 'Lun', 'Mar', etc.
  ops: number;
  maint: number;
}


export default function DashboardPage() {
  const { user: currentUser } = useAuth();
  const { setActiveAlertsCount, setAlertNotifications } = useAppData(); 

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
  const [internalActiveAlertsCount, setInternalActiveAlertsCount] = useState<number | string>("N/A"); 
  const [currentUserTasks, setCurrentUserTasks] = useState<Task[]>([]);


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

        if (currentUser) {
          const userSpecificTasks = tasksData.filter(
            task => task.id_usuario_asignado === currentUser.id && ACTIVE_TASK_STATUSES.includes(task.estado_tarea)
          );
          setCurrentUserTasks(userSpecificTasks.sort((a, b) => new Date(a.fecha_vencimiento || 0).getTime() - new Date(b.fecha_vencimiento || 0).getTime()));
        }


        const erasReady = eraData.filter(era => READY_ERA_STATUSES.includes(era.estado_era)).length;
        setReadyEraCount(erasReady);
        
        const extinguishersReady = inventoryData.filter(
          item => item.categoria_item?.toLowerCase() === EXTINGUISHER_CATEGORY.toLowerCase() && item.cantidad_actual > 0
        ).length;
        setReadyExtinguisherCount(extinguishersReady);

        setTotalReadyEquipmentCount(erasReady + extinguishersReady);

        const activities: ActivityItem[] = [];
        const alertsForContext: AlertNotificationItem[] = [];
        const today = startOfDay(new Date());

        inventoryData.forEach(item => {
          if (item.stock_minimo && item.stock_minimo > 0 && item.cantidad_actual <= item.stock_minimo) {
            const alertItem: AlertNotificationItem = {
              id: `alert-stock-${item.id_item}`,
              date: new Date(), 
              description: `Stock bajo: ${item.nombre_item} (${item.codigo_item}). Actual: ${item.cantidad_actual}, Mín: ${item.stock_minimo}.`,
              icon: AlertTriangle,
              iconClassName: "text-orange-500",
              type: 'alert_stock',
              severity: 'warning',
              link: `/inventory#item-${item.id_item}`
            };
            activities.push(alertItem as ActivityItem);
            alertsForContext.push(alertItem);
          }
        });

        maintenanceData.forEach(maint => {
          if (maint.fecha_programada && isBefore(parseISO(maint.fecha_programada), today) && 
              maint.estado_mantencion !== 'Completada' && maint.estado_mantencion !== 'Cancelada') {
            const alertItem: AlertNotificationItem = {
              id: `alert-maint-${maint.id_mantencion}`,
              date: parseISO(maint.fecha_programada), 
              description: `Mantención Vencida: ${maint.nombre_item_mantenimiento}. Prog.: ${format(parseISO(maint.fecha_programada), 'dd-MM-yyyy', { locale: es })}.`,
              icon: Wrench, 
              iconClassName: "text-red-500",
              type: 'alert_maintenance_overdue',
              severity: 'error',
              link: `/maintenance#maint-${maint.id_mantencion}`
            };
            activities.push(alertItem as ActivityItem);
            alertsForContext.push(alertItem);
          }
        });

        vehiclesData.forEach(vehicle => {
          if (vehicle.estado_vehiculo === 'Fuera de Servicio') {
            const alertItem: AlertNotificationItem = {
              id: `alert-vehicle-${vehicle.id_vehiculo}`,
              date: new Date(), 
              description: `Vehículo Inoperativo: ${vehicle.marca} ${vehicle.modelo} (${vehicle.identificador_interno || vehicle.patente}) está 'Fuera de Servicio'.`,
              icon: ArchiveX, 
              iconClassName: "text-red-500",
              type: 'alert_vehicle_oos',
              severity: 'error',
              link: `/vehicles/${vehicle.id_vehiculo}`
            };
            activities.push(alertItem as ActivityItem);
            alertsForContext.push(alertItem);
          }
        });
        
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
              date: new Date(task.fecha_actualizacion),
              description: taskDesc,
              icon: Activity,
              iconClassName: "text-blue-500",
              type: 'task',
              severity: 'info',
              link: `/tasks#task-${task.id_tarea}`
            });
          });

        maintenanceData
          .filter(m => m.estado_mantencion === 'Completada' && m.fecha_completada) 
          .sort((a, b) => new Date(b.fecha_completada!).getTime() - new Date(a.fecha_completada!).getTime())
          .slice(0, 2)
          .forEach(maint => {
            activities.push({
              id: `maint-log-${maint.id_mantencion}`,
              date: parseISO(maint.fecha_completada!),
              description: `Mantención para "${maint.nombre_item_mantenimiento.substring(0,20)}..." completada.`,
              icon: CheckCircle2, 
              iconClassName: "text-green-500",
              type: 'maintenance_log',
              severity: 'info',
            });
          });
        
        setRecentActivity(
          activities
            .sort((a, b) => b.date.getTime() - a.date.getTime()) 
            .slice(0, 7) 
        );

        const currentActiveAlerts = activities.filter(a => a.type.startsWith('alert_')).length;
        setInternalActiveAlertsCount(currentActiveAlerts);
        setActiveAlertsCount(currentActiveAlerts); 
        setAlertNotifications(alertsForContext.sort((a,b) => b.date.getTime() - a.date.getTime())); 


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
        setInternalActiveAlertsCount("Error");
        setActiveAlertsCount(0); 
        setAlertNotifications([]); 
        setRecentActivity([]);
        setCurrentUserTasks([]);
        setDailyOpsChartData( Array(7).fill(null).map((_, i) => ({ name: format(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), i), 'E', { locale: es }).charAt(0).toUpperCase() + format(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), i), 'E', { locale: es }).slice(1,3), ops: 0, maint: 0 })) );
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
    const intervalId = setInterval(fetchDashboardData, 60000); 
    return () => clearInterval(intervalId);
  }, [currentUser, setActiveAlertsCount, setAlertNotifications]);

  const formatDate = (dateString?: string | null, dateFormat: string = "dd-MM-yyyy") => {
    if (!dateString) return "N/A";
    try {
      const date = parseISO(dateString);
      return format(date, dateFormat, { locale: es });
    } catch (e) {
      return dateString;
    }
  };
  
  const getTaskStatusBadgeClassName = (status: TaskStatus) => {
     switch (status) {
      case "Completada": return "bg-green-500 hover:bg-green-600 text-white";
      case "En Proceso": return "bg-yellow-500 hover:bg-yellow-600 text-black";
      case "Programada": return "bg-blue-500 hover:bg-blue-600 text-white";
      case "Pendiente": return "bg-slate-400 hover:bg-slate-500 text-white"; 
      case "Atrasada": return "border-red-700 bg-red-600 hover:bg-red-700 text-white";
      default: return "bg-gray-400";
    }
  };

  if (loading && recentActivity.length === 0) { 
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-cool-loader-spin text-primary mr-2" />
        Cargando datos del panel...
      </div>
    );
  }

  if (error && recentActivity.length === 0) { 
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
          title="Tareas Activas (Global)"
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
          value={internalActiveAlertsCount.toString()}
          icon={AlertTriangle}
          description={
            typeof internalActiveAlertsCount === 'number' && internalActiveAlertsCount > 0 
            ? "Requieren atención inmediata" 
            : "Sin alertas críticas"
          }
          iconClassName={
            typeof internalActiveAlertsCount === 'number' && internalActiveAlertsCount > 0 
            ? "text-red-500 animate-pulse" 
            : "text-green-500"
          }
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-md lg:col-span-1">
          <CardHeader>
            <CardTitle className="font-headline flex items-center"><ClipboardList className="mr-2 h-5 w-5 text-primary" /> Mis Tareas Pendientes</CardTitle>
            <CardDescription>Tus tareas activas asignadas.</CardDescription>
          </CardHeader>
          <CardContent>
            {currentUserTasks.length > 0 ? (
              <ul className="space-y-3 text-sm">
                {currentUserTasks.slice(0, 5).map((task) => ( 
                  <li key={`user-task-${task.id_tarea}`} className="flex flex-col p-2 border rounded-md hover:bg-muted/50">
                    <div className="flex justify-between items-start gap-2">
                       <Link href={`/tasks#task-${task.id_tarea}`} className="font-medium hover:underline flex-grow min-w-0" title={task.descripcion_tarea}>
                         <span className="block truncate">{task.descripcion_tarea}</span>
                       </Link>
                       <Badge className={cn("text-xs whitespace-nowrap flex-shrink-0", getTaskStatusBadgeClassName(task.estado_tarea))}>
                          {task.estado_tarea}
                        </Badge>
                    </div>
                    {task.fecha_vencimiento && isValid(parseISO(task.fecha_vencimiento)) && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Vence: {formatDate(task.fecha_vencimiento)}
                      </p>
                    )}
                  </li>
                ))}
                {currentUserTasks.length > 5 && (
                    <li className="text-center mt-3">
                        <Link href="/tasks" className="text-sm text-primary hover:underline">
                            Ver todas mis tareas ({currentUserTasks.length})
                        </Link>
                    </li>
                )}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No tienes tareas pendientes asignadas.</p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-md lg:col-span-1">
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

        <Card className="shadow-md lg:col-span-1">
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
                      {activity.link ? (
                         <Link href={activity.link} className={cn("hover:underline", activity.type.startsWith('alert_') && "font-semibold")}>
                            {activity.description}
                         </Link>
                      ) : (
                         <span className={cn(activity.type.startsWith('alert_') && "font-semibold")}>{activity.description}</span>
                      )}
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


    