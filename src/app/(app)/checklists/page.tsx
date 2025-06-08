
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, Trash2, ClipboardCheck, Search, Filter, ListChecks, History, CalendarIcon, FilterX, Truck, ShieldAlert } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format, parseISO, isValid, isBefore, isAfter, startOfDay, endOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
// AddChecklistDialog ya no se usa
import { EditChecklistDialog, type EditChecklistData } from "@/components/checklists/edit-checklist-dialog";
import { DeleteChecklistDialog } from "@/components/checklists/delete-checklist-dialog";
import { ViewChecklistDialog, type ChecklistCompletionData } from "@/components/checklists/view-checklist-dialog";
import { ChecklistHistoryDialog } from "@/components/checklists/checklist-history-dialog";
import type { ChecklistStatus, ChecklistCompletion, ChecklistCompletionStatus } from "@/types/checklistTypes";
import { ALL_CHECKLIST_STATUSES } from "@/types/checklistTypes";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import type { DateRange } from "react-day-picker";

// Ítems estándar para checklists de activos
export const VEHICLE_STANDARD_ITEMS: string[] = [
  "Revisar nivel de aceite motor",
  "Verificar presión de neumáticos",
  "Comprobar luces y sirenas",
  "Inspeccionar nivel de combustible",
  "Revisar estado de mangueras y pitones",
  "Verificar equipo de comunicación radial",
  "Inspeccionar extintor a bordo",
  "Comprobar botiquín de primeros auxilios",
];

export const ERA_STANDARD_ITEMS: string[] = [
  "Verificar presión de cilindro (mín. según norma)",
  "Inspeccionar máscara facial (sellos, visor, correas)",
  "Comprobar arnés y correas de sujeción",
  "Verificar funcionamiento de válvula a demanda",
  "Chequear manómetro y alarma de baja presión",
  "Limpieza y desinfección de máscara",
];

export interface Checklist {
  id: string;
  name: string;
  description?: string;
  items: string[];
  category?: string;
  lastModified: string;
  status: ChecklistStatus;
  // Nuevos campos para vincular a activos
  assetId?: string; // Ej: "veh1", "era2"
  assetType?: 'Vehicle' | 'ERA';
  assetName?: string; // Ej: "Bomba B-01", "ERA MSA-003"
}

const SIMULATED_CHECKLISTS: Checklist[] = [
  { 
    id: "chk-veh-b01", 
    name: "Checklist Diario - Bomba B-01", 
    description: "Revisión pre-operacional diaria para la unidad Bomba B-01.", 
    items: [...VEHICLE_STANDARD_ITEMS, ...ERA_STANDARD_ITEMS], 
    category: "Vehicular", 
    lastModified: "2024-07-30T08:00:00Z", 
    status: "Nuevo",
    assetId: "veh1", // Asumir que existe un vehículo con este ID
    assetType: "Vehicle",
    assetName: "Bomba B-01"
  },
  { 
    id: "chk-era-003", 
    name: "Inspección Semanal - ERA MSA-003", 
    description: "Verificación de estado y operatividad del equipo ERA MSA-003.", 
    items: ERA_STANDARD_ITEMS, 
    category: "Equipos ERA", 
    lastModified: "2024-07-28T14:30:00Z", 
    status: "En Progreso",
    assetId: "era3", // Asumir que existe un ERA con este ID
    assetType: "ERA",
    assetName: "ERA MSA-003"
  },
  { 
    id: "chk-proc-hazmat", 
    name: "Protocolo Incidente HazMat Nivel 1", 
    description: "Pasos a seguir para incidentes con materiales peligrosos. Plantilla general.", 
    items: ["Aislar la zona (mín. 50m)", "Identificar el producto (si es posible y seguro)", "Solicitar apoyo especializado", "Establecer zona de exclusión", "Verificar dirección del viento"], 
    category: "Procedimientos", 
    lastModified: "2024-06-15T09:00:00Z", 
    status: "Completado" 
    // Sin assetId, es una plantilla general
  },
  { 
    id: "chk-veh-ambu01", 
    name: "Checklist Operacional - Ambulancia SAMU-01", 
    description: "Revisión de equipamiento médico y estado general de la ambulancia.", 
    items: [...VEHICLE_STANDARD_ITEMS, ...ERA_STANDARD_ITEMS], // Actualizado para usar solo los ítems estándar combinados
    category: "Vehicular", 
    lastModified: "2024-07-29T08:15:00Z", 
    status: "Nuevo",
    assetId: "veh4",
    assetType: "Vehicle",
    assetName: "Ambulancia SAMU-01"
  },
];

const INITIAL_CHECKLIST_COMPLETIONS: ChecklistCompletion[] = [
  { id: "comp-veh-b01-1", checklistTemplateId: "chk-veh-b01", completionDate: "2024-07-29T09:00:00Z", status: "Completado", completedByUserName: "Juan Pérez", notes: "Todo OK en Bomba B-01." },
  { id: "comp-veh-b01-2", checklistTemplateId: "chk-veh-b01", completionDate: "2024-07-28T08:30:00Z", status: "Incompleto", completedByUserName: "Juan Pérez", notes: "Bomba con presión ligeramente baja en neumático delantero derecho, ajustada. Faltó verificar nivel de aceite." },
  { id: "comp-era-003-1", checklistTemplateId: "chk-era-003", completionDate: "2024-07-27T10:00:00Z", status: "Completado", completedByUserName: "Ana Gómez", notes: "ERA MSA-003 operativo." },
  { id: "comp-proc-hazmat-1", checklistTemplateId: "chk-proc-hazmat", completionDate: "2024-06-10T11:00:00Z", status: "Pendiente Revisión", completedByUserName: "Equipo HazMat Alfa", notes: "Protocolo ejecutado, pendiente revisión de supervisor." },
];


export default function ChecklistsPage() {
  const [checklists, setChecklists] = useState<Checklist[]>(SIMULATED_CHECKLISTS);
  const [checklistCompletions, setChecklistCompletions] = useState<ChecklistCompletion[]>(INITIAL_CHECKLIST_COMPLETIONS);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateRangeFilter, setDateRangeFilter] = useState<DateRange | undefined>(undefined);
  // isAddDialogOpen y handleChecklistAdded ya no se usan
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [checklistToEdit, setChecklistToEdit] = useState<Checklist | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [checklistToDelete, setChecklistToDelete] = useState<Checklist | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedChecklistForView, setSelectedChecklistForView] = useState<Checklist | null>(null);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [selectedChecklistForHistory, setSelectedChecklistForHistory] = useState<Checklist | null>(null);

  const { toast } = useToast();

  const handleSaveChecklistCompletion = (data: ChecklistCompletionData) => {
    const newCompletion: ChecklistCompletion = {
      id: `comp-${data.checklistId}-${new Date().getTime()}`, // Simple unique ID
      checklistTemplateId: data.checklistId,
      completionDate: data.completionDate.toISOString(),
      status: "Completado", // TODO: Status real debería depender de los ítems
      completedByUserName: "Usuario Actual (Simulado)", // Reemplazar con usuario real
      notes: data.notes,
    };
    setChecklistCompletions(prev => [newCompletion, ...prev].sort((a, b) => new Date(b.completionDate).getTime() - new Date(a.completionDate).getTime()));
    toast({
      title: "Completitud de Checklist Guardada",
      description: `La revisión para "${data.assetName || data.checklistId}" del ${format(data.completionDate, "PPP", { locale: es })} ha sido registrada.`,
    });
  };

  const handleChecklistUpdated = (id: string, updatedData: EditChecklistData) => {
    setChecklists(prev =>
      prev.map(c =>
        c.id === id
          ? {
              ...c,
              name: c.assetName ? `Checklist - ${c.assetName}` : updatedData.name, // Nombre derivado si es de activo
              description: c.assetId ? c.description : updatedData.description, // Descripción no editable si es de activo
              category: c.assetId ? c.category : updatedData.category, // Categoría no editable si es de activo
              items: c.assetType === 'Vehicle' ? [...VEHICLE_STANDARD_ITEMS, ...ERA_STANDARD_ITEMS] 
                   : c.assetType === 'ERA' ? ERA_STANDARD_ITEMS
                   : Array(updatedData.itemCount).fill(null).map((_, i) => c.items[i] || `Ítem de ejemplo ${i + 1}`),
              status: updatedData.status as ChecklistStatus,
              lastModified: new Date().toISOString(),
            }
          : c
      )
    );
    toast({ title: "Checklist Actualizado", description: `El checklist "${updatedData.name}" ha sido actualizado.` });
    setIsEditDialogOpen(false);
    setChecklistToEdit(null);
  };

  const handleViewChecklist = (checklist: Checklist) => {
    setSelectedChecklistForView(checklist);
    setIsViewDialogOpen(true);
  };
  
  const handleEditChecklist = (checklist: Checklist) => {
    setChecklistToEdit(checklist);
    setIsEditDialogOpen(true);
  };
  
  const handleDeleteChecklist = (checklist: Checklist) => {
    setChecklistToDelete(checklist);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDeleteChecklist = () => {
    if (!checklistToDelete) return;
    setChecklists(prev => prev.filter(c => c.id !== checklistToDelete.id));
    toast({ title: "Checklist Eliminado", description: `El checklist "${checklistToDelete.name}" ha sido eliminado.` });
    setIsDeleteDialogOpen(false);
    setChecklistToDelete(null);
  };

  const handleViewHistory = (checklist: Checklist) => {
    setSelectedChecklistForHistory(checklist);
    setIsHistoryDialogOpen(true);
  };

  const filteredChecklists = checklists.filter(checklist => {
    const matchesSearchTerm =
      checklist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (checklist.description && checklist.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (checklist.assetName && checklist.assetName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === "all" || checklist.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || checklist.status === statusFilter;
    
    const matchesDateRange = (() => {
        if (!dateRangeFilter?.from) return true; 
        const itemDate = parseISO(checklist.lastModified);
        if (!isValid(itemDate)) return false; 
        const fromDate = startOfDay(dateRangeFilter.from);
        if (isBefore(itemDate, fromDate)) return false;
        if (dateRangeFilter.to) {
          const toDate = endOfDay(dateRangeFilter.to);
          if (isAfter(itemDate, toDate)) return false;
        }
        return true;
    })();

    return matchesSearchTerm && matchesCategory && matchesStatus && matchesDateRange;
  });

  const uniqueCategories = Array.from(new Set(checklists.map(c => c.category).filter(Boolean))) as string[];
  const uniqueStatuses = Array.from(new Set(checklists.map(c => c.status))) as ChecklistStatus[];

  const getStatusBadgeClassName = (status: Checklist['status']) => {
    switch (status) {
      case 'Completado': return 'bg-green-500 text-primary-foreground hover:bg-green-600';
      case 'En Progreso': return 'bg-yellow-500 text-black hover:bg-yellow-600';
      case 'Nuevo': return 'border-primary text-primary hover:bg-primary/10';
      default: return 'border-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-4 mb-6 bg-card border rounded-lg shadow-sm">
        <h1 className="text-2xl font-headline font-bold flex items-center">
          <ListChecks className="mr-3 h-7 w-7 text-primary" />
          Gestión de Checklists de Activos
        </h1>
        {/* Botón de crear eliminado */}
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Filtros de Checklists</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4 items-center">
          <div className="relative w-full sm:w-auto sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, activo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-background"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter} disabled={uniqueCategories.length === 0}>
            <SelectTrigger className="w-full sm:w-[200px] bg-background">
              <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las Categorías</SelectItem>
              {uniqueCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
            </SelectContent>
          </Select>
           <Select value={statusFilter} onValueChange={setStatusFilter} disabled={uniqueStatuses.length === 0}>
            <SelectTrigger className="w-full sm:w-[180px] bg-background">
              <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Estado Plantilla" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los Estados</SelectItem>
              {uniqueStatuses.map(stat => <SelectItem key={stat} value={stat}>{stat}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="flex flex-col sm:flex-row gap-2 items-center w-full sm:w-auto">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date-filter-checklists"
                  variant={"outline"}
                  className={cn(
                    "w-full sm:w-[270px] justify-start text-left font-normal bg-background",
                    !dateRangeFilter && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRangeFilter?.from ? (
                    dateRangeFilter.to ? (
                      <>
                        {format(dateRangeFilter.from, "LLL dd, y", { locale: es })} -{" "}
                        {format(dateRangeFilter.to, "LLL dd, y", { locale: es })}
                      </>
                    ) : (
                      format(dateRangeFilter.from, "LLL dd, y", { locale: es })
                    )
                  ) : (
                    <span>Fecha Modificación</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRangeFilter?.from}
                  selected={dateRangeFilter}
                  onSelect={setDateRangeFilter}
                  numberOfMonths={2}
                  locale={es}
                />
              </PopoverContent>
            </Popover>
            {dateRangeFilter?.from && (
                <Button
                    variant="ghost"
                    onClick={() => setDateRangeFilter(undefined)}
                    className="h-9 px-3"
                >
                    <FilterX className="mr-1.5 h-4 w-4" /> Limpiar
                </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <p>Cargando checklists...</p>
      ) : filteredChecklists.length === 0 ? (
        <Card className="text-center">
          <CardHeader>
             <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full w-fit">
                <ClipboardCheck className="h-10 w-10" />
            </div>
            <CardTitle className="mt-4">
                {checklists.length === 0 ? "No hay Checklists de Activos" : "No se encontraron checklists"}
            </CardTitle>
            <CardDescription>
              {checklists.length === 0
                ? "Los checklists se generarán automáticamente al crear vehículos o equipos ERA (funcionalidad futura)."
                : "Intenta ajustar los filtros o el término de búsqueda."
              }
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <Card className="shadow-md">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">Nombre Checklist / Activo</TableHead>
                  <TableHead className="hidden lg:table-cell">Categoría</TableHead>
                  <TableHead className="text-center">Ítems</TableHead>
                  <TableHead>Estado (Plantilla)</TableHead>
                  <TableHead className="hidden sm:table-cell">Últ. Modificación</TableHead>
                  <TableHead className="text-right w-[200px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredChecklists.map((checklist) => (
                  <TableRow key={checklist.id}>
                    <TableCell className="font-medium">
                      <div>{checklist.name}</div>
                      {checklist.assetName && (
                        <div className="text-xs text-muted-foreground flex items-center">
                          {checklist.assetType === 'Vehicle' ? <Truck className="h-3 w-3 mr-1"/> : <ShieldAlert className="h-3 w-3 mr-1"/>}
                          {checklist.assetName}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {checklist.category ? <Badge variant="outline">{checklist.category}</Badge> : "N/A"}
                    </TableCell>
                    <TableCell className="text-center">{checklist.items.length}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={checklist.status === 'Completado' ? 'default' : checklist.status === 'En Progreso' ? 'secondary' : 'outline'}
                        className={cn("text-xs", getStatusBadgeClassName(checklist.status))}
                      >
                        {checklist.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground hidden sm:table-cell">
                      {format(parseISO(checklist.lastModified), "dd MMM, yyyy HH:mm", { locale: es })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex flex-col space-y-1 items-end">
                        <div className="flex space-x-1">
                          <Button variant="outline" size="sm" className="h-8 px-2 py-1 text-xs" onClick={() => handleViewChecklist(checklist)}>
                            <Eye className="mr-1 h-3.5 w-3.5" /> Ver / Completar
                          </Button>
                          <Button variant="outline" size="sm" className="h-8 px-2 py-1 text-xs" onClick={() => handleViewHistory(checklist)}>
                            <History className="mr-1 h-3.5 w-3.5" /> Historial
                          </Button>
                        </div>
                        <div className="flex space-x-1">
                          <Button variant="outline" size="sm" className="h-8 px-2 py-1 text-xs" onClick={() => handleEditChecklist(checklist)}>
                            <Edit className="mr-1 h-3.5 w-3.5" /> {checklist.assetId ? "Ver Config." : "Editar"}
                          </Button>
                           {!checklist.assetId && ( // Solo permitir eliminar plantillas generales
                            <Button variant="destructive" size="sm" className="h-8 px-2 py-1 text-xs" onClick={() => handleDeleteChecklist(checklist)}>
                                <Trash2 className="mr-1 h-3.5 w-3.5" /> Eliminar
                            </Button>
                           )}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
      {/* AddChecklistDialog ya no se usa */}
      {checklistToEdit && (
        <EditChecklistDialog
          checklist={checklistToEdit}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onChecklistUpdated={handleChecklistUpdated}
          existingCategories={uniqueCategories}
        />
      )}
      <DeleteChecklistDialog
        checklist={checklistToDelete}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirmDelete={handleConfirmDeleteChecklist}
      />
      <ViewChecklistDialog
        checklist={selectedChecklistForView}
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        onSaveCompletion={handleSaveChecklistCompletion}
      />
      <ChecklistHistoryDialog
        checklistTemplate={selectedChecklistForHistory}
        completions={checklistCompletions.filter(
          c => c.checklistTemplateId === selectedChecklistForHistory?.id
        )}
        open={isHistoryDialogOpen}
        onOpenChange={setIsHistoryDialogOpen}
      />
    </div>
  );
}


    

    