
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
import { Input } from "@/components/ui/input"; // Added Input
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { DateRange } from "react-day-picker";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label"; // Added Label

// Asumimos que estos vienen de los types/services
const ALL_VEHICLE_STATUSES_REPORTS = ['Operativo', 'En Mantención', 'Fuera de Servicio'];
const ALL_VEHICLE_TYPES_REPORTS = ['Bomba', 'Escala', 'Rescate', 'Ambulancia', 'HazMat', 'Forestal', 'Utilitario', 'Transporte Personal', 'Otro'];
const ALL_ERA_STATUSES_REPORTS = ['Disponible', 'Operativo', 'En Mantención', 'Requiere Inspección', 'Fuera de Servicio'];
const ALL_MAINTENANCE_STATUSES_REPORTS = ['Programada', 'Pendiente', 'En Progreso', 'Completada', 'Cancelada', 'Atrasada'];


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


export default function ReportsPage() {
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState<string>("all");
  const [vehicleStatusFilter, setVehicleStatusFilter] = useState<string>("all");
  const [eraStatusFilter, setEraStatusFilter] = useState<string>("all");
  const [maintenanceStatusFilter, setMaintenanceStatusFilter] = useState<string>("all");
  
  // States for specific ID inputs (simulated multi-select)
  const [specificVehicleIds, setSpecificVehicleIds] = useState<string>("");
  const [specificEraIds, setSpecificEraIds] = useState<string>("");
  const [specificInventoryItemIds, setSpecificInventoryItemIds] = useState<string>("");


  const handleApplyFilters = () => {
    toast({
      title: "Filtros Aplicados (Simulado)",
      description: "En una aplicación real, los gráficos se actualizarían con los filtros seleccionados. Filtros específicos aplicados: Vehículos: " + specificVehicleIds + ", ERAs: " + specificEraIds + ", Ítems Inventario: " + specificInventoryItemIds,
      duration: 7000,
    });
  };

  const handleExport = (formatType: 'Excel' | 'PDF') => {
    toast({
      title: `Exportación a ${formatType} (Simulada)`,
      description: `Funcionalidad de exportación a ${formatType} no implementada en esta demostración.`,
    });
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
        Visualización detallada del estado y rendimiento de los recursos. Utilice los filtros para refinar los datos de los informes.
      </p>

      {/* Sección de Filtros */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center"><Filter className="mr-2 h-5 w-5 text-primary" /> Filtros de Informes</CardTitle>
          <CardDescription>Seleccione criterios para generar informes específicos.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
            <div>
              <Label htmlFor="date-range" className="text-sm font-medium text-muted-foreground mb-1 block">Rango de Fechas</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date-range"
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal h-10",
                      !dateRange?.from && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd, y", {locale: es})} -{" "}
                          {format(dateRange.to, "LLL dd, y", {locale: es})}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, y", {locale: es})
                      )
                    ) : (
                      <span>Seleccione un rango</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
                <Label htmlFor="vehicle-type-filter" className="text-sm font-medium text-muted-foreground mb-1 block">Tipo de Vehículo</Label>
                <Select value={vehicleTypeFilter} onValueChange={setVehicleTypeFilter}>
                    <SelectTrigger id="vehicle-type-filter" className="h-10">
                        <SelectValue placeholder="Todos los Tipos" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos los Tipos de Vehículo</SelectItem>
                        {ALL_VEHICLE_TYPES_REPORTS.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <div>
                <Label htmlFor="vehicle-status-filter" className="text-sm font-medium text-muted-foreground mb-1 block">Estado de Vehículo</Label>
                <Select value={vehicleStatusFilter} onValueChange={setVehicleStatusFilter}>
                    <SelectTrigger id="vehicle-status-filter" className="h-10">
                        <SelectValue placeholder="Todos los Estados" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos los Estados de Vehículo</SelectItem>
                        {ALL_VEHICLE_STATUSES_REPORTS.map(status => <SelectItem key={status} value={status}>{status}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <div>
                <Label htmlFor="era-status-filter" className="text-sm font-medium text-muted-foreground mb-1 block">Estado de ERA</Label>
                <Select value={eraStatusFilter} onValueChange={setEraStatusFilter}>
                    <SelectTrigger id="era-status-filter" className="h-10">
                        <SelectValue placeholder="Todos los Estados" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos los Estados de ERA</SelectItem>
                        {ALL_ERA_STATUSES_REPORTS.map(status => <SelectItem key={status} value={status}>{status}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <div>
                <Label htmlFor="maintenance-status-filter" className="text-sm font-medium text-muted-foreground mb-1 block">Estado de Mantención</Label>
                <Select value={maintenanceStatusFilter} onValueChange={setMaintenanceStatusFilter}>
                    <SelectTrigger id="maintenance-status-filter" className="h-10">
                        <SelectValue placeholder="Todos los Estados" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos los Estados de Mantención</SelectItem>
                        {ALL_MAINTENANCE_STATUSES_REPORTS.map(status => <SelectItem key={status} value={status}>{status}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
             <div className="lg:col-span-1"> {/* Ajustar el span si es necesario */}
                <Label htmlFor="specific-vehicle-ids" className="text-sm font-medium text-muted-foreground mb-1 block">
                    Vehículos Específicos (IDs)
                </Label>
                <Input
                    id="specific-vehicle-ids"
                    placeholder="Ej: 1, 5, 12 (separados por coma)"
                    value={specificVehicleIds}
                    onChange={(e) => setSpecificVehicleIds(e.target.value)}
                    className="h-10"
                />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end mt-4">
            <div>
                <Label htmlFor="specific-era-ids" className="text-sm font-medium text-muted-foreground mb-1 block">
                    Equipos ERA Específicos (IDs)
                </Label>
                <Input
                    id="specific-era-ids"
                    placeholder="Ej: 101, 105 (separados por coma)"
                    value={specificEraIds}
                    onChange={(e) => setSpecificEraIds(e.target.value)}
                    className="h-10"
                />
            </div>
            <div>
                <Label htmlFor="specific-inventory-item-ids" className="text-sm font-medium text-muted-foreground mb-1 block">
                    Ítems Inventario Específicos (IDs)
                </Label>
                <Input
                    id="specific-inventory-item-ids"
                    placeholder="Ej: 20, 25, 33 (separados por coma)"
                    value={specificInventoryItemIds}
                    onChange={(e) => setSpecificInventoryItemIds(e.target.value)}
                    className="h-10"
                />
            </div>
          </div>


          <div className="flex flex-col sm:flex-row gap-3 pt-6">
            <Button onClick={handleApplyFilters} className="w-full sm:w-auto">
                <Filter className="mr-2 h-4 w-4" /> Aplicar Filtros (Simulado)
            </Button>
            <Button variant="outline" onClick={() => handleExport('Excel')} className="w-full sm:w-auto">
                <Download className="mr-2 h-4 w-4" /> Exportar a Excel (Simulado)
            </Button>
            <Button variant="outline" onClick={() => handleExport('PDF')} className="w-full sm:w-auto">
                <Download className="mr-2 h-4 w-4" /> Exportar a PDF (Simulado)
            </Button>
          </div>
        </CardContent>
      </Card>


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
              <strong>Nota Importante:</strong> Todos los datos y gráficos presentados en esta sección son simulados y tienen fines demostrativos únicamente. La funcionalidad de filtrado y exportación real no está implementada.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
        
    

    