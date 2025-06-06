
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
import { FileText, AlertTriangle, Filter, Download, CalendarIcon, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useState, useEffect, useMemo } from "react";
import { format, parseISO, isWithinInterval, isValid } from 'date-fns';
import { es } from 'date-fns/locale';
import type { DateRange } from "react-day-picker";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

// Constantes para tipos y estados usados en los filtros (pueden venir de types/services)
const ALL_VEHICLE_STATUSES_REPORTS: string[] = ['Operativo', 'En Mantención', 'Fuera de Servicio', 'En Ruta', 'En Emergencia'];
const ALL_VEHICLE_TYPES_REPORTS: string[] = ['Bomba', 'Escala', 'Rescate', 'Ambulancia', 'HazMat', 'Forestal', 'Utilitario', 'Transporte Personal', 'Otro'];
const ALL_ERA_STATUSES_REPORTS: string[] = ['Disponible', 'Operativo', 'En Mantención', 'Requiere Inspección', 'Fuera de Servicio'];
const ALL_MAINTENANCE_STATUSES_REPORTS: string[] = ['Programada', 'Pendiente', 'En Progreso', 'Completada', 'Cancelada', 'Atrasada'];

interface SimulatedVehicleReportItem {
  id: number;
  nombre: string;
  tipo_vehiculo: string;
  estado_vehiculo: string;
  fecha_registro_simulada: string; // YYYY-MM-DD
}

const allSimulatedVehiclesForReport: SimulatedVehicleReportItem[] = [
  { id: 1, nombre: "B-01", tipo_vehiculo: "Bomba", estado_vehiculo: "Operativo", fecha_registro_simulada: "2023-01-15" },
  { id: 2, nombre: "M-02", tipo_vehiculo: "Ambulancia", estado_vehiculo: "En Mantención", fecha_registro_simulada: "2023-02-10" },
  { id: 3, nombre: "R-03", tipo_vehiculo: "Rescate", estado_vehiculo: "Fuera de Servicio", fecha_registro_simulada: "2023-03-05" },
  { id: 4, nombre: "B-04", tipo_vehiculo: "Bomba", estado_vehiculo: "Operativo", fecha_registro_simulada: "2023-04-20" },
  { id: 5, nombre: "E-05", tipo_vehiculo: "Escala", estado_vehiculo: "Operativo", fecha_registro_simulada: "2023-05-12" },
  { id: 6, nombre: "H-06", tipo_vehiculo: "HazMat", estado_vehiculo: "En Mantención", fecha_registro_simulada: "2023-06-01" },
  { id: 7, nombre: "UT-07", tipo_vehiculo: "Utilitario", estado_vehiculo: "Operativo", fecha_registro_simulada: "2024-01-10" },
  { id: 8, nombre: "F-08", tipo_vehiculo: "Forestal", estado_vehiculo: "Operativo", fecha_registro_simulada: "2024-02-22" },
  { id: 9, nombre: "B-09", tipo_vehiculo: "Bomba", estado_vehiculo: "Fuera de Servicio", fecha_registro_simulada: "2024-03-15" },
  { id: 10, nombre: "TP-10", tipo_vehiculo: "Transporte Personal", estado_vehiculo: "Operativo", fecha_registro_simulada: "2024-04-01" },
  { id: 11, nombre: "B-11", tipo_vehiculo: "Bomba", estado_vehiculo: "Operativo", fecha_registro_simulada: "2024-05-05" },
  { id: 12, nombre: "R-12", tipo_vehiculo: "Rescate", estado_vehiculo: "En Mantención", fecha_registro_simulada: "2024-06-10" },
];

// Datos simulados para otros gráficos (estáticos por ahora)
const eraAvailabilityDataStatic = [
  { status: "Disponibles", count: 25, fill: "hsl(var(--chart-1))" },
  { status: "Operativos (Asignados)", count: 18, fill: "hsl(var(--chart-2))" },
  { status: "En Mantención", count: 5, fill: "hsl(var(--chart-3))" },
  { status: "Requiere Inspección", count: 2, fill: "hsl(var(--chart-4))" },
];
const incidentResponseDataStatic = [
  { month: "Ene", "Tiempo Prom. (min)": 5.2 }, { month: "Feb", "Tiempo Prom. (min)": 4.8 },
  { month: "Mar", "Tiempo Prom. (min)": 5.5 }, { month: "Abr", "Tiempo Prom. (min)": 4.5 },
  { month: "May", "Tiempo Prom. (min)": 5.0 }, { month: "Jun", "Tiempo Prom. (min)": 5.3 },
];
const maintenanceComplianceDataStatic = [
  { name: "Vehículos", completadas: 30, vencidas: 5 }, { name: "ERAs", completadas: 45, vencidas: 8 },
  { name: "Extintores", completadas: 80, vencidas: 3 }, { name: "Otros Equipos", completadas: 22, vencidas: 2 },
];

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

  const [filteredVehicleReportData, setFilteredVehicleReportData] = useState<SimulatedVehicleReportItem[]>(allSimulatedVehiclesForReport);
  const [currentVehicleChartData, setCurrentVehicleChartData] = useState<any[]>([]);

  useEffect(() => {
    // Initial chart data calculation
    const initialCounts: Record<string, number> = {};
    allSimulatedVehiclesForReport.forEach(vehicle => {
      initialCounts[vehicle.estado_vehiculo] = (initialCounts[vehicle.estado_vehiculo] || 0) + 1;
    });
    setCurrentVehicleChartData(
      Object.entries(initialCounts).map(([status, count]) => ({ status, count, fill: vehicleAvailabilityChartConfig[status as keyof typeof vehicleAvailabilityChartConfig]?.color || "hsl(var(--muted))" }))
    );
  }, []);


  useEffect(() => {
    let filtered = [...allSimulatedVehiclesForReport];
    const specificVehicleIds = specificVehicleIdsInput.split(',').map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id));

    // Filter by Date Range
    if (dateRange?.from) {
      filtered = filtered.filter(vehicle => {
        const vehicleDate = parseISO(vehicle.fecha_registro_simulada);
        if (!isValid(vehicleDate)) return false;
        const toDate = dateRange.to || dateRange.from; // If no 'to', use 'from' for single day
        return isWithinInterval(vehicleDate, { start: dateRange.from!, end: toDate! });
      });
    }

    // Filter by Vehicle Type
    if (vehicleTypeFilter !== "all") {
      filtered = filtered.filter(vehicle => vehicle.tipo_vehiculo === vehicleTypeFilter);
    }

    // Filter by Vehicle Status
    if (vehicleStatusFilter !== "all") {
      filtered = filtered.filter(vehicle => vehicle.estado_vehiculo === vehicleStatusFilter);
    }
    
    // Filter by Specific Vehicle IDs
    if (specificVehicleIds.length > 0) {
      filtered = filtered.filter(vehicle => specificVehicleIds.includes(vehicle.id));
    }

    setFilteredVehicleReportData(filtered);

    const statusCounts: Record<string, number> = {};
    filtered.forEach(vehicle => {
      statusCounts[vehicle.estado_vehiculo] = (statusCounts[vehicle.estado_vehiculo] || 0) + 1;
    });
    
    const newChartData = Object.entries(statusCounts)
        .map(([status, count]) => ({
            status,
            count,
            fill: vehicleAvailabilityChartConfig[status as keyof typeof vehicleAvailabilityChartConfig]?.color || "hsl(var(--muted))"
        }))
        .filter(item => item.count > 0); // Only include statuses with counts

    setCurrentVehicleChartData(newChartData);

  }, [dateRange, vehicleTypeFilter, vehicleStatusFilter, specificVehicleIdsInput]);


  const handleApplyFilters = () => {
    toast({
      title: "Filtros Procesados (Parcial)",
      description: "Filtros de vehículos aplicados y gráfico actualizado. Otros filtros son visuales.",
      duration: 5000,
    });
  };

  const downloadCsv = (data: any[], filename: string) => {
    if (data.length === 0) {
      toast({ title: "Sin datos", description: "No hay datos para exportar con los filtros actuales.", variant: "destructive" });
      return;
    }
    const headers = Object.keys(data[0]).join(',');
    const csvRows = data.map(row => Object.values(row).join(','));
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
    }
  };

  const handleExport = (formatType: 'CSV' | 'PDF') => {
    if (formatType === 'CSV') {
      downloadCsv(filteredVehicleReportData, 'informe_vehiculos.csv');
      toast({
        title: "Exportación CSV Iniciada",
        description: "Se está generando el archivo CSV para los vehículos filtrados.",
      });
    } else if (formatType === 'PDF') {
      toast({
        title: `Exportación a ${formatType} (Simulada)`,
        description: `Funcionalidad de exportación a ${formatType} no implementada en esta demostración.`,
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
        Visualización del estado y rendimiento de los recursos. El informe de vehículos es dinámico y exportable a CSV.
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
                <Label htmlFor="era-status-filter" className="text-sm font-medium text-muted-foreground mb-1 block">Estado de ERA (Visual)</Label>
                <Select value={eraStatusFilter} onValueChange={setEraStatusFilter}>
                    <SelectTrigger id="era-status-filter" className="h-10"><SelectValue placeholder="Todos los Estados" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos los Estados de ERA</SelectItem>
                        {ALL_ERA_STATUSES_REPORTS.map(status => <SelectItem key={status} value={status}>{status}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <div>
                <Label htmlFor="maintenance-status-filter" className="text-sm font-medium text-muted-foreground mb-1 block">Estado de Mantención (Visual)</Label>
                <Select value={maintenanceStatusFilter} onValueChange={setMaintenanceStatusFilter}>
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
                <Label htmlFor="specific-era-ids" className="text-sm font-medium text-muted-foreground mb-1 block">Equipos ERA Específicos (IDs - Visual)</Label>
                <Input id="specific-era-ids" placeholder="Ej: 101, 105" value={specificEraIdsInput} onChange={(e) => setSpecificEraIdsInput(e.target.value)} className="h-10"/>
            </div>
            <div>
                <Label htmlFor="specific-inventory-item-ids" className="text-sm font-medium text-muted-foreground mb-1 block">Ítems Inventario Específicos (IDs - Visual)</Label>
                <Input id="specific-inventory-item-ids" placeholder="Ej: 20, 25, 33" value={specificInventoryItemIdsInput} onChange={(e) => setSpecificInventoryItemIdsInput(e.target.value)} className="h-10"/>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 pt-6">
            <Button onClick={handleApplyFilters} className="w-full sm:w-auto"><Filter className="mr-2 h-4 w-4" /> Aplicar Filtros</Button>
            <Button variant="outline" onClick={() => handleExport('CSV')} className="w-full sm:w-auto"><Download className="mr-2 h-4 w-4" /> Exportar Vehículos (CSV)</Button>
            <Button variant="outline" onClick={() => handleExport('PDF')} className="w-full sm:w-auto"><Download className="mr-2 h-4 w-4" /> Exportar a PDF (Simulado)</Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Disponibilidad de Vehículos</CardTitle>
            <CardDescription>Distribución del estado actual de la flota vehicular (filtrado).</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={vehicleAvailabilityChartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent hideLabel nameKey="status" />} />
                   <Pie data={currentVehicleChartData} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={100} labelLine={false} label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
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
                    {currentVehicleChartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.fill} />))}
                  </Pie>
                  <ChartLegend content={<ChartLegendContent nameKey="status" />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Disponibilidad de Equipos ERA (Simulado)</CardTitle>
            <CardDescription>Estado actual de los equipos de respiración autónoma.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={eraAvailabilityChartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent hideLabel nameKey="status"/>} />
                  <Pie data={eraAvailabilityDataStatic} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={100} labelLine={false} label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
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
                    {eraAvailabilityDataStatic.map((entry, index) => (<Cell key={`cell-era-${index}`} fill={entry.fill} /> ))}
                  </Pie>
                  <ChartLegend content={<ChartLegendContent nameKey="status" />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-md lg:col-span-2">
          <CardHeader>
            <CardTitle>Tiempo de Respuesta a Incidentes (Simulado)</CardTitle>
            <CardDescription>Promedio mensual simulado de tiempo de respuesta en minutos.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={incidentResponseChartConfig} className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={incidentResponseDataStatic} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))"/>
                  <XAxis dataKey="month" stroke="hsl(var(--foreground))"/>
                  <YAxis stroke="hsl(var(--foreground))" label={{ value: 'Minutos', angle: -90, position: 'insideLeft', offset: 10, style: { textAnchor: 'middle', fill: 'hsl(var(--foreground))' } }}/>
                  <ChartTooltip cursor={true} content={<ChartTooltipContent indicator="line" labelKey="Tiempo Prom. (min)" className="bg-background text-foreground border-border shadow-lg" />}/>
                  <RechartsLegend verticalAlign="top" height={36} content={<ChartLegendContent nameKey="month" />} />
                  <Line type="monotone" dataKey="Tiempo Prom. (min)" stroke="var(--color-tiempo)" strokeWidth={2} dot={{ r: 4, fill: "var(--color-tiempo)" }} activeDot={{ r: 6 }}/>
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-md lg:col-span-2">
          <CardHeader>
            <CardTitle>Cumplimiento de Tareas de Mantención (Simulado)</CardTitle>
            <CardDescription>Número de tareas de mantención completadas versus vencidas/pendientes por tipo de ítem.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={maintenanceComplianceChartConfig} className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={maintenanceComplianceDataStatic} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))"/>
                  <XAxis dataKey="name" stroke="hsl(var(--foreground))"/>
                  <YAxis stroke="hsl(var(--foreground))"/>
                  <ChartTooltip content={<ChartTooltipContent className="bg-background text-foreground border-border shadow-lg" />}/>
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
              <strong>Nota Importante:</strong> El gráfico de disponibilidad de vehículos y su exportación a CSV son funcionales con datos simulados y filtros en el frontend. Otros gráficos y la exportación a PDF son demostrativos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

    