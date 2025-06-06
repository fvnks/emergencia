
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

  // Estados para los datos de los gráficos, inicializados como vacíos
  const [vehicleReportData, setVehicleReportData] = useState<GenericChartDataItem[]>([]);
  const [eraAvailabilityData, setEraAvailabilityData] = useState<GenericChartDataItem[]>([]);
  const [incidentResponseData, setIncidentResponseData] = useState<GenericChartDataItem[]>([]);
  const [maintenanceComplianceData, setMaintenanceComplianceData] = useState<GenericChartDataItem[]>([]);

  // Efecto para cargar datos (reemplazar con llamadas a API reales)
  useEffect(() => {
    // Aquí irían las llamadas a los servicios para obtener datos reales y aplicar filtros del backend.
    // Por ahora, los gráficos permanecerán vacíos hasta que se integren datos reales.
    // Ejemplo conceptual:
    // const fetchReportData = async () => {
    //   const vehicleFilters = { dateRange, type: vehicleTypeFilter, status: vehicleStatusFilter, ids: specificVehicleIdsInput };
    //   const eraFilters = { status: eraStatusFilter, ids: specificEraIdsInput };
    //   const maintFilters = { status: maintenanceStatusFilter };
    //   // const inventoryFilters = { ids: specificInventoryItemIdsInput }; // Si se necesitara para un gráfico

    //   // const [vehicleData, eraData, incidentData, maintData] = await Promise.all([
    //   //   getVehicleReport(vehicleFilters),
    //   //   getEraReport(eraFilters),
    //   //   getIncidentReport({dateRange}),
    //   //   getMaintenanceReport(maintFilters)
    //   // ]);
    //   // setVehicleReportData(processVehicleDataForChart(vehicleData)); // Función para procesar
    //   // setEraAvailabilityData(processEraDataForChart(eraData));
    //   // setIncidentResponseData(processIncidentDataForChart(incidentData));
    //   // setMaintenanceComplianceData(processMaintDataForChart(maintData));
    // };
    // fetchReportData();
    
    // Como no hay datos reales, los filtros no afectarán los gráficos vacíos.
    // El gráfico de vehículos (el único que era dinámico con datos simulados) también estará vacío.
    setVehicleReportData([]); // Asegura que el gráfico de vehículos se vacíe

  }, [dateRange, vehicleTypeFilter, vehicleStatusFilter, specificVehicleIdsInput, eraStatusFilter, maintenanceStatusFilter, specificEraIdsInput, specificInventoryItemIdsInput]);


  const handleApplyFilters = () => {
    const specificVehicleIds = specificVehicleIdsInput.split(',').map(id => id.trim()).filter(id => id !== "");
    const specificEraIds = specificEraIdsInput.split(',').map(id => id.trim()).filter(id => id !== "");
    const specificInventoryIds = specificInventoryItemIdsInput.split(',').map(id => id.trim()).filter(id => id !== "");

    let filterSummary = "Filtros Aplicados (Simulación - Conexión a Backend Requerida):\n";
    if (dateRange?.from) filterSummary += ` - Rango Fechas: ${format(dateRange.from, "dd/MM/yy")} ${dateRange.to ? `- ${format(dateRange.to, "dd/MM/yy")}` : ''}\n`;
    if (vehicleTypeFilter !== "all") filterSummary += ` - Tipo Vehículo: ${vehicleTypeFilter}\n`;
    if (vehicleStatusFilter !== "all") filterSummary += ` - Estado Vehículo: ${vehicleStatusFilter}\n`;
    if (specificVehicleIds.length > 0) filterSummary += ` - IDs Vehículos: ${specificVehicleIds.join(', ')}\n`;
    if (eraStatusFilter !== "all") filterSummary += ` - Estado ERA: ${eraStatusFilter}\n`;
    if (specificEraIds.length > 0) filterSummary += ` - IDs ERA: ${specificEraIds.join(', ')}\n`;
    if (maintenanceStatusFilter !== "all") filterSummary += ` - Estado Mantención: ${maintenanceStatusFilter}\n`;
    if (specificInventoryIds.length > 0) filterSummary += ` - IDs Inventario: ${specificInventoryIds.join(', ')}\n`;
    
    if (filterSummary === "Filtros Aplicados (Simulación - Conexión a Backend Requerida):\n") {
      filterSummary = "No se han aplicado filtros específicos. Mostrando todos los datos (requiere backend).";
    }

    toast({
      title: "Filtros Seleccionados",
      description: <pre className="whitespace-pre-wrap text-xs">{filterSummary}</pre>,
      duration: 7000,
    });
    // Aquí se llamaría a la función para recargar los datos con los filtros aplicados.
  };

  const downloadCsv = (data: any[], filename: string) => {
    if (data.length === 0) {
      toast({ title: "Sin Datos", description: "No hay datos para exportar con los filtros actuales.", variant: "destructive" });
      return;
    }
    // Asumiendo que todos los objetos en 'data' tienen las mismas claves para las cabeceras
    const headers = Object.keys(data[0]).join(',');
    const csvRows = data.map(row => 
      Object.values(row).map(value => {
        const strValue = String(value);
        // Escapar comas y comillas dobles en los valores
        if (strValue.includes(',') || strValue.includes('"') || strValue.includes('\n')) {
          return `"${strValue.replace(/"/g, '""')}"`;
        }
        return strValue;
      }).join(',')
    );
    const csvString = `${headers}\n${csvRows.join('\n')}`;
    
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-t8;' });
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
        description: `Se está generando el archivo ${filename}. (Conexión a backend para datos reales necesaria)`,
      });
    } else {
        toast({ title: "Error de Exportación", description: "Tu navegador no soporta la descarga de archivos de esta manera.", variant: "destructive" });
    }
  };

  const handleExport = (formatType: 'CSV' | 'PDF') => {
    if (formatType === 'CSV') {
      // Idealmente, aquí se pasaría data real filtrada desde el backend.
      // Como no hay datos, se puede exportar un CSV vacío con cabeceras o un mensaje.
      // Para el ejemplo, si vehicleReportData está vacío, downloadCsv mostrará el toast de "Sin datos".
      downloadCsv(vehicleReportData, 'informe_vehiculos.csv');
    } else if (formatType === 'PDF') {
      toast({
        title: `Exportación a ${formatType} (Simulada)`,
        description: `La funcionalidad de exportación a ${formatType} requiere implementación de backend.`,
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
        Visualización del estado y rendimiento de los recursos. Esta sección requiere integración con backend para mostrar datos reales y funcionalidad completa de filtrado/exportación.
      </p>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center"><Filter className="mr-2 h-5 w-5 text-primary" /> Filtros de Informes</CardTitle>
          <CardDescription>Seleccione criterios para generar informes específicos (funcionalidad de backend pendiente).</CardDescription>
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
                <Label htmlFor="era-status-filter" className="text-sm font-medium text-muted-foreground mb-1 block">Estado de ERA</Label>
                <Select value={eraStatusFilter} onValueChange={setEraStatusFilter}>
                    <SelectTrigger id="era-status-filter" className="h-10"><SelectValue placeholder="Todos los Estados" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos los Estados de ERA</SelectItem>
                        {ALL_ERA_STATUSES_REPORTS.map(status => <SelectItem key={status} value={status}>{status}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <div>
                <Label htmlFor="maintenance-status-filter" className="text-sm font-medium text-muted-foreground mb-1 block">Estado de Mantención</Label>
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
                <Label htmlFor="specific-era-ids" className="text-sm font-medium text-muted-foreground mb-1 block">Equipos ERA Específicos (IDs)</Label>
                <Input id="specific-era-ids" placeholder="Ej: 101, 105" value={specificEraIdsInput} onChange={(e) => setSpecificEraIdsInput(e.target.value)} className="h-10"/>
            </div>
            <div>
                <Label htmlFor="specific-inventory-item-ids" className="text-sm font-medium text-muted-foreground mb-1 block">Ítems Inventario Específicos (IDs)</Label>
                <Input id="specific-inventory-item-ids" placeholder="Ej: 20, 25, 33" value={specificInventoryItemIdsInput} onChange={(e) => setSpecificInventoryItemIdsInput(e.target.value)} className="h-10"/>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 pt-6">
            <Button onClick={handleApplyFilters} className="w-full sm:w-auto"><Filter className="mr-2 h-4 w-4" /> Aplicar Filtros (Simulado)</Button>
            <Button variant="outline" onClick={() => handleExport('CSV')} className="w-full sm:w-auto"><Download className="mr-2 h-4 w-4" /> Exportar Vehículos (CSV)</Button>
            <Button variant="outline" onClick={() => handleExport('PDF')} className="w-full sm:w-auto"><Download className="mr-2 h-4 w-4" /> Exportar a PDF (Simulado)</Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Disponibilidad de Vehículos</CardTitle>
            <CardDescription>Distribución del estado de la flota vehicular (requiere datos reales).</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={vehicleAvailabilityChartConfig} className="h-[300px] w-full">
              {vehicleReportData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent hideLabel nameKey="status" />} />
                    <Pie data={vehicleReportData} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={100} labelLine={false} label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
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
                      {vehicleReportData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.fill} />))}
                    </Pie>
                    <ChartLegend content={<ChartLegendContent nameKey="status" />} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">Sin datos para mostrar.</div>
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
                <div className="flex items-center justify-center h-full text-muted-foreground">Sin datos para mostrar.</div>
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
                <div className="flex items-center justify-center h-full text-muted-foreground">Sin datos para mostrar.</div>
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
                <div className="flex items-center justify-center h-full text-muted-foreground">Sin datos para mostrar.</div>
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
              <strong>Nota:</strong> Esta página de informes es una plantilla. Para funcionalidad completa, se requiere integrar con un backend para obtener datos reales, procesar filtros y generar exportaciones complejas de Excel/PDF. La exportación CSV para vehículos es una simulación en cliente.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
    

    