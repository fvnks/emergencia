
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
import { FileText, AlertTriangle, Filter, Download, CalendarIcon, Search, Loader2 } from "lucide-react"; // Added Loader2
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useState, useEffect, useMemo } from "react";
import { format, parseISO, isWithinInterval, isValid, startOfDay, endOfDay, isAfter, isBefore } from 'date-fns';
import { es } from 'date-fns/locale';
import type { DateRange } from "react-day-picker";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { getAllVehicles, type Vehicle } from "@/services/vehicleService"; // Added imports

// Constantes para tipos y estados usados en los filtros (pueden venir de types/services)
const ALL_VEHICLE_STATUSES_REPORTS: string[] = ['Operativo', 'En Mantención', 'Fuera de Servicio', 'En Ruta', 'En Emergencia'];
const ALL_VEHICLE_TYPES_REPORTS: string[] = ['Bomba', 'Escala', 'Rescate', 'Ambulancia', 'HazMat', 'Forestal', 'Utilitario', 'Transporte Personal', 'Otro'];
const ALL_ERA_STATUSES_REPORTS: string[] = ['Disponible', 'Operativo', 'En Mantención', 'Requiere Inspección', 'Fuera de Servicio'];
const ALL_MAINTENANCE_STATUSES_REPORTS: string[] = ['Programada', 'Pendiente', 'En Progreso', 'Completada', 'Cancelada', 'Atrasada'];

interface GenericChartDataItem {
  id?: number | string;
  name?: string;
  value?: number;
  count?: number;
  status?: string;
  fill?: string;
  [key: string]: any; // Para otros campos como 'mes', 'Tiempo Prom. (min)', etc.
}

// Configuración de colores para los gráficos
const vehicleAvailabilityChartConfig = {
  Operativo: { label: "Operativos", color: "hsl(var(--chart-1))" },
  "En Mantención": { label: "En Mantención", color: "hsl(var(--chart-2))" },
  "Fuera de Servicio": { label: "Fuera de Servicio", color: "hsl(var(--chart-4))" },
  "En Ruta": { label: "En Ruta", color: "hsl(var(--chart-5))"},
  "En Emergencia": { label: "En Emergencia", color: "hsl(var(--destructive))"}
} satisfies ChartConfig;

const eraAvailabilityChartConfig = {
  Disponibles: { label: "Disponibles", color: "hsl(var(--chart-1))" },
  "Operativos (Asignados)": { label: "Operativos", color: "hsl(var(--chart-2))" },
  "En Mantención": { label: "En Mantención", color: "hsl(var(--chart-3))" },
  "Requiere Inspección": { label: "Requiere Inspección", color: "hsl(var(--chart-4))" },
} satisfies ChartConfig;

const incidentResponseChartConfig = {
  tiempo: { label: "Tiempo Prom. (min)", color: "hsl(var(--primary))" },
} satisfies ChartConfig;

const maintenanceComplianceChartConfig = {
  completadas: { label: "Completadas a Tiempo", color: "hsl(var(--chart-1))" },
  vencidas: { label: "Vencidas/Pendientes", color: "hsl(var(--chart-4))" },
} satisfies ChartConfig;


export default function ReportsPage() {
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState<string>("all");
  const [vehicleStatusFilter, setVehicleStatusFilter] = useState<string>("all");
  const [eraStatusFilter, setEraStatusFilter] = useState<string>("all");
  const [maintenanceStatusFilter, setMaintenanceStatusFilter] = useState<string>("all");
  
  const [specificVehicleIdsInput, setSpecificVehicleIdsInput] = useState<string>("");
  const [specificEraIdsInput, setSpecificEraIdsInput] = useState<string>("");
  const [specificInventoryItemIdsInput, setSpecificInventoryItemIdsInput] = useState<string>("");

  const [vehicleReportData, setVehicleReportData] = useState<GenericChartDataItem[]>([]);
  const [eraAvailabilityData, setEraAvailabilityData] = useState<GenericChartDataItem[]>([]);
  const [incidentResponseData, setIncidentResponseData] = useState<GenericChartDataItem[]>([]);
  const [maintenanceComplianceData, setMaintenanceComplianceData] = useState<GenericChartDataItem[]>([]);
  const [loadingReportData, setLoadingReportData] = useState(false);


  useEffect(() => {
    const fetchReportData = async () => {
      setLoadingReportData(true);
      try {
        const allVehicles = await getAllVehicles();
        
        const parsedVehicleIds = specificVehicleIdsInput
          .split(',')
          .map(id => parseInt(id.trim(), 10))
          .filter(id => !isNaN(id));

        const filteredVehicles = allVehicles.filter(vehicle => {
          let passes = true;

          if (parsedVehicleIds.length > 0 && !parsedVehicleIds.includes(vehicle.id_vehiculo)) {
            passes = false;
          }
          if (vehicleTypeFilter !== "all" && vehicle.tipo_vehiculo !== vehicleTypeFilter) {
            passes = false;
          }
          if (vehicleStatusFilter !== "all" && vehicle.estado_vehiculo !== vehicleStatusFilter) {
            passes = false;
          }

          if (dateRange?.from) {
            const vehicleDate = parseISO(vehicle.fecha_actualizacion || vehicle.fecha_creacion);
            if (!isValid(vehicleDate)) {
              passes = false;
            } else {
              const fromDate = startOfDay(dateRange.from);
              if (isBefore(vehicleDate, fromDate)) passes = false;
              if (dateRange.to) {
                const toDate = endOfDay(dateRange.to);
                if (isAfter(vehicleDate, toDate)) passes = false;
              }
            }
          }
          return passes;
        });

        const statusCounts: Record<string, number> = {};
        ALL_VEHICLE_STATUSES_REPORTS.forEach(status => statusCounts[status] = 0); // Initialize all statuses

        filteredVehicles.forEach(vehicle => {
          if (vehicle.estado_vehiculo && statusCounts.hasOwnProperty(vehicle.estado_vehiculo)) {
            statusCounts[vehicle.estado_vehiculo]++;
          } else if (vehicle.estado_vehiculo) {
             // Handle unexpected statuses, perhaps group them under 'Otro' or log
             console.warn(`Vehículo con estado inesperado: ${vehicle.estado_vehiculo}`);
             // if (!statusCounts['Otro']) statusCounts['Otro'] = 0;
             // statusCounts['Otro']++;
          }
        });
        
        const chartData = Object.entries(statusCounts)
          .map(([status, count]) => {
            const configEntry = vehicleAvailabilityChartConfig[status as keyof typeof vehicleAvailabilityChartConfig];
            return {
              status: configEntry?.label || status,
              count: count,
              fill: configEntry?.color || "#8884d8", // Default color
            };
          })
          .filter(item => item.count > 0); // Only include statuses with vehicles

        setVehicleReportData(chartData);

        // Placeholder for other chart data
        setEraAvailabilityData([]);
        setIncidentResponseData([]);
        setMaintenanceComplianceData([]);

      } catch (error) {
        console.error("Error fetching report data:", error);
        toast({
          title: "Error al Cargar Datos",
          description: error instanceof Error ? error.message : "No se pudieron cargar los datos para los informes.",
          variant: "destructive",
        });
        setVehicleReportData([]);
      } finally {
        setLoadingReportData(false);
      }
    };
    
    fetchReportData();
  }, [dateRange, vehicleTypeFilter, vehicleStatusFilter, specificVehicleIdsInput, toast]);


  const handleApplyFilters = () => {
    // The useEffect already re-fetches data when filter states change.
    // This button can be used to explicitly trigger a toast or if we later
    // move fetching outside useEffect.
    const specificVehicleIds = specificVehicleIdsInput.split(',').map(id => id.trim()).filter(id => id !== "");
    // ... (rest of the specific ID parsing)

    let filterSummary = "Filtros aplicados y datos recargados (si es necesario).\n";
     if (dateRange?.from) filterSummary += ` - Rango Fechas: ${format(dateRange.from, "dd/MM/yy")} ${dateRange.to ? `- ${format(dateRange.to, "dd/MM/yy")}` : ''}\n`;
    if (vehicleTypeFilter !== "all") filterSummary += ` - Tipo Vehículo: ${vehicleTypeFilter}\n`;
    if (vehicleStatusFilter !== "all") filterSummary += ` - Estado Vehículo: ${vehicleStatusFilter}\n`;
    if (specificVehicleIds.length > 0) filterSummary += ` - IDs Vehículos: ${specificVehicleIds.join(', ')}\n`;
    // ... (rest of the summary for other filters)
    
    toast({
      title: "Filtros Aplicados",
      description: <pre className="whitespace-pre-wrap text-xs">{filterSummary}</pre>,
      duration: 7000,
    });
  };

  const downloadCsv = (data: any[], filename: string) => {
    if (data.length === 0) {
      toast({ title: "Sin Datos", description: "No hay datos para exportar con los filtros actuales.", variant: "destructive" });
      return;
    }
    const headers = Object.keys(data[0]).filter(key => key !== 'fill').join(','); // Exclude 'fill' from CSV
    const csvRows = data.map(row => 
      Object.entries(row)
        .filter(([key]) => key !== 'fill')
        .map(([, value]) => {
          const strValue = String(value);
          if (strValue.includes(',') || strValue.includes('"') || strValue.includes('\n')) {
            return `"${strValue.replace(/"/g, '""')}"`;
          }
          return strValue;
        }).join(',')
    );
    const csvString = `${headers}\n${csvRows.join('\n')}`;
    
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast({
        title: "Exportación CSV Iniciada",
        description: `Se está generando el archivo ${filename}.`,
      });
    } else {
        toast({ title: "Error de Exportación", description: "Tu navegador no soporta la descarga de archivos de esta manera.", variant: "destructive" });
    }
  };

  const handleExport = (formatType: 'CSV' | 'PDF') => {
    if (formatType === 'CSV') {
      downloadCsv(vehicleReportData, 'informe_disponibilidad_vehiculos.csv');
    } else if (formatType === 'PDF') {
      toast({
        title: `Exportación a ${formatType} (Simulada)`,
        description: `La funcionalidad de exportación a ${formatType} requiere implementación adicional.`,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <h1 className="text-2xl font-headline font-bold md:text-3xl flex items-center">
          <FileText className="mr-3 h-7 w-7 text-primary" />
          Informes y Estadísticas
        </h1>
      </div>
      <p className="text-muted-foreground">
        Visualización del estado y rendimiento de los recursos. Otros gráficos requieren integración con backend.
      </p>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center"><Filter className="mr-2 h-5 w-5 text-primary" /> Filtros de Informes</CardTitle>
          <CardDescription>Seleccione criterios para generar informes específicos.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
            <div>
              <Label htmlFor="date-range" className="text-sm font-medium text-muted-foreground mb-1 block">Rango de Fechas (Vehículos)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date-range"
                    variant={"outline"}
                    className={cn("w-full justify-start text-left font-normal h-10", !dateRange?.from && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (dateRange.to ? (<>{format(dateRange.from, "LLL dd, y", {locale: es})} - {format(dateRange.to, "LLL dd, y", {locale: es})}</>) : format(dateRange.from, "LLL dd, y", {locale: es})) : (<span>Seleccione un rango</span>)}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar initialFocus mode="range" defaultMonth={dateRange?.from} selected={dateRange} onSelect={setDateRange} numberOfMonths={2} locale={es}/>
                </PopoverContent>
              </Popover>
            </div>
            <div>
                <Label htmlFor="vehicle-type-filter" className="text-sm font-medium text-muted-foreground mb-1 block">Tipo de Vehículo</Label>
                <Select value={vehicleTypeFilter} onValueChange={setVehicleTypeFilter}>
                    <SelectTrigger id="vehicle-type-filter" className="h-10"><SelectValue placeholder="Todos los Tipos" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos los Tipos de Vehículo</SelectItem>
                        {ALL_VEHICLE_TYPES_REPORTS.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <div>
                <Label htmlFor="vehicle-status-filter" className="text-sm font-medium text-muted-foreground mb-1 block">Estado de Vehículo</Label>
                <Select value={vehicleStatusFilter} onValueChange={setVehicleStatusFilter}>
                    <SelectTrigger id="vehicle-status-filter" className="h-10"><SelectValue placeholder="Todos los Estados" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos los Estados de Vehículo</SelectItem>
                        {ALL_VEHICLE_STATUSES_REPORTS.map(status => <SelectItem key={status} value={status}>{status}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <div>
                <Label htmlFor="era-status-filter" className="text-sm font-medium text-muted-foreground mb-1 block">Estado de ERA (No implementado)</Label>
                <Select value={eraStatusFilter} onValueChange={setEraStatusFilter} disabled>
                    <SelectTrigger id="era-status-filter" className="h-10"><SelectValue placeholder="Todos los Estados" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos los Estados de ERA</SelectItem>
                        {ALL_ERA_STATUSES_REPORTS.map(status => <SelectItem key={status} value={status}>{status}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <div>
                <Label htmlFor="maintenance-status-filter" className="text-sm font-medium text-muted-foreground mb-1 block">Estado de Mantención (No implementado)</Label>
                <Select value={maintenanceStatusFilter} onValueChange={setMaintenanceStatusFilter} disabled>
                    <SelectTrigger id="maintenance-status-filter" className="h-10"><SelectValue placeholder="Todos los Estados" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos los Estados de Mantención</SelectItem>
                        {ALL_MAINTENANCE_STATUSES_REPORTS.map(status => <SelectItem key={status} value={status}>{status}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <div>
                <Label htmlFor="specific-vehicle-ids" className="text-sm font-medium text-muted-foreground mb-1 block">Vehículos Específicos (IDs)</Label>
                <Input id="specific-vehicle-ids" placeholder="Ej: 1, 5, 12" value={specificVehicleIdsInput} onChange={(e) => setSpecificVehicleIdsInput(e.target.value)} className="h-10"/>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end mt-4">
            <div>
                <Label htmlFor="specific-era-ids" className="text-sm font-medium text-muted-foreground mb-1 block">Equipos ERA Específicos (IDs, No impl.)</Label>
                <Input id="specific-era-ids" placeholder="Ej: 101, 105" value={specificEraIdsInput} onChange={(e) => setSpecificEraIdsInput(e.target.value)} className="h-10" disabled/>
            </div>
            <div>
                <Label htmlFor="specific-inventory-item-ids" className="text-sm font-medium text-muted-foreground mb-1 block">Ítems Inventario Específicos (IDs, No impl.)</Label>
                <Input id="specific-inventory-item-ids" placeholder="Ej: 20, 25, 33" value={specificInventoryItemIdsInput} onChange={(e) => setSpecificInventoryItemIdsInput(e.target.value)} className="h-10" disabled/>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 pt-6">
            <Button onClick={handleApplyFilters} className="w-full sm:w-auto" disabled><Filter className="mr-2 h-4 w-4" /> Aplicar Otros Filtros (Simulado)</Button>
            <Button variant="outline" onClick={() => handleExport('CSV')} className="w-full sm:w-auto"><Download className="mr-2 h-4 w-4" /> Exportar Vehículos (CSV)</Button>
            <Button variant="outline" onClick={() => handleExport('PDF')} className="w-full sm:w-auto"><Download className="mr-2 h-4 w-4" /> Exportar a PDF (Simulado)</Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Disponibilidad de Vehículos</CardTitle>
            <CardDescription>Distribución del estado de la flota vehicular.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={vehicleAvailabilityChartConfig} className="h-[300px] w-full">
              {loadingReportData ? (
                <div className="flex items-center justify-center h-full text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin mr-2" />Cargando datos...</div>
              ) : vehicleReportData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent hideLabel nameKey="status" />} />
                    <Pie data={vehicleReportData} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={100} labelLine={false} label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                        const RADIAN = Math.PI / 180;
                        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                        const x = cx + radius * Math.cos(-midAngle * RADIAN);
                        const y = cy + radius * Math.sin(-midAngle * RADIAN);
                        return ( percent > 0.03 ? // Show label if percent is > 3%
                          <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="10px" fontWeight="bold">
                            {`${(percent * 100).toFixed(0)}%`}
                          </text> : null
                        );
                      }}>
                      {vehicleReportData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.fill} />))}
                    </Pie>
                    <ChartLegend content={<ChartLegendContent nameKey="status" />} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">Sin datos para mostrar con los filtros actuales.</div>
              )}
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Disponibilidad de Equipos ERA</CardTitle>
            <CardDescription>Estado de los equipos de respiración autónoma (requiere datos reales).</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={eraAvailabilityChartConfig} className="h-[300px] w-full">
             {eraAvailabilityData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent hideLabel nameKey="status"/>} />
                    <Pie data={eraAvailabilityData} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={100} labelLine={false} label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                        const RADIAN = Math.PI / 180;
                        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                        const x = cx + radius * Math.cos(-midAngle * RADIAN);
                        const y = cy + radius * Math.sin(-midAngle * RADIAN);
                        return ( percent > 0.02 ?
                          <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="10px">
                            {`${(percent * 100).toFixed(0)}%`}
                          </text> : null
                        );
                      }}>
                      {eraAvailabilityData.map((entry, index) => (<Cell key={`cell-era-${index}`} fill={entry.fill} /> ))}
                    </Pie>
                    <ChartLegend content={<ChartLegendContent nameKey="status" />} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">Sin datos para mostrar. (Funcionalidad pendiente)</div>
              )}
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-md lg:col-span-2">
          <CardHeader>
            <CardTitle>Tiempo de Respuesta a Incidentes</CardTitle>
            <CardDescription>Promedio mensual de tiempo de respuesta (requiere datos reales).</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={incidentResponseChartConfig} className="h-[350px] w-full">
              {incidentResponseData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={incidentResponseData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))"/>
                    <XAxis dataKey="month" stroke="hsl(var(--foreground))"/>
                    <YAxis stroke="hsl(var(--foreground))" label={{ value: 'Minutos', angle: -90, position: 'insideLeft', offset: 10, style: { textAnchor: 'middle', fill: 'hsl(var(--foreground))' } }}/>
                    <ChartTooltip cursor={true} content={<ChartTooltipContent indicator="line" labelKey="Tiempo Prom. (min)" className="bg-background text-foreground border-border shadow-lg" />}/>
                    <RechartsLegend verticalAlign="top" height={36} content={<ChartLegendContent nameKey="month" />} />
                    <Line type="monotone" dataKey="Tiempo Prom. (min)" stroke="var(--color-tiempo)" strokeWidth={2} dot={{ r: 4, fill: "var(--color-tiempo)" }} activeDot={{ r: 6 }}/>
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">Sin datos para mostrar. (Funcionalidad pendiente)</div>
              )}
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-md lg:col-span-2">
          <CardHeader>
            <CardTitle>Cumplimiento de Tareas de Mantención</CardTitle>
            <CardDescription>Tareas completadas vs. vencidas/pendientes (requiere datos reales).</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={maintenanceComplianceChartConfig} className="h-[350px] w-full">
              {maintenanceComplianceData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={maintenanceComplianceData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))"/>
                    <XAxis dataKey="name" stroke="hsl(var(--foreground))"/>
                    <YAxis stroke="hsl(var(--foreground))"/>
                    <ChartTooltip content={<ChartTooltipContent className="bg-background text-foreground border-border shadow-lg" />}/>
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar dataKey="completadas" stackId="a" fill="var(--color-completadas)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="vencidas" stackId="a" fill="var(--color-vencidas)" radius={[4, 4, 0, 0]}/>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">Sin datos para mostrar. (Funcionalidad pendiente)</div>
              )}
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
       <div className="mt-8 p-4 border-l-4 border-blue-400 bg-blue-50 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <FileText className="h-5 w-5 text-blue-500" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              <strong>Nota:</strong> Solo el gráfico "Disponibilidad de Vehículos" está conectado a datos (simulados/locales). Los demás gráficos y filtros avanzados requieren integración completa con backend para obtener datos reales, procesar filtros complejos y generar exportaciones. La exportación CSV para vehículos es funcional con los datos mostrados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
    

    

