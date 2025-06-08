
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Eye, Edit, Trash2, ClipboardCheck, Search, Filter, FilePlus2, ListChecks, History, CalendarIcon, FilterX } from "lucide-react";
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
import { AddChecklistDialog, type NewChecklistData } from "@/components/checklists/add-checklist-dialog";
import { EditChecklistDialog, type EditChecklistData } from "@/components/checklists/edit-checklist-dialog";
import { DeleteChecklistDialog } from "@/components/checklists/delete-checklist-dialog";
import { ViewChecklistDialog } from "@/components/checklists/view-checklist-dialog";
import { ChecklistHistoryDialog } from "@/components/checklists/checklist-history-dialog";
import type { ChecklistStatus, ChecklistCompletion, ChecklistCompletionStatus } from "@/types/checklistTypes";
import { ALL_CHECKLIST_STATUSES } from "@/types/checklistTypes";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import type { DateRange } from "react-day-picker";


export interface Checklist {
  id: string;
  name: string;
  description?: string;
  itemCount: number;
  category?: string;
  lastModified: string;
  status: ChecklistStatus; // Status of the template itself
}

const SIMULATED_CHECKLISTS: Checklist[] = [
  { id: "chk1", name: "Inspección Pre-Operacional Bomba B-01", description: "Checklist diario antes de sacar la unidad.", itemCount: 15, category: "Vehicular", lastModified: "2024-07-28T10:00:00Z", status: "Nuevo" },
  { id: "chk2", name: "Revisión Semanal Equipos ERA", description: "Verificación de presión, estado de máscaras y cilindros.", itemCount: 8, category: "Equipos ERA", lastModified: "2024-07-25T14:30:00Z", status: "En Progreso" },
  { id: "chk3", name: "Procedimiento Incidente HazMat Nivel 1", description: "Pasos a seguir para incidentes con materiales peligrosos.", itemCount: 22, category: "Procedimientos", lastModified: "2024-06-15T09:00:00Z", status: "Completado" },
  { id: "chk4", name: "Checklist de Ambulancia SAMU-01", description: "Revisión de equipamiento médico y estado general.", itemCount: 30, category: "Vehicular", lastModified: "2024-07-29T08:15:00Z", status: "Nuevo" },
];

const SIMULATED_CHECKLIST_COMPLETIONS: ChecklistCompletion[] = [
  { id: "comp1-1", checklistTemplateId: "chk1", completionDate: "2024-07-27T09:00:00Z", status: "Completado", completedByUserName: "Juan Pérez", notes: "Todo OK en la revisión de la Bomba B-01." },
  { id: "comp1-2", checklistTemplateId: "chk1", completionDate: "2024-07-26T08:30:00Z", status: "Completado", completedByUserName: "Juan Pérez", notes: "Bomba con presión ligeramente baja, ajustada." },
  { id: "comp1-3", checklistTemplateId: "chk1", completionDate: "2024-07-25T08:35:00Z", status: "Incompleto", completedByUserName: "Carlos Silva", notes: "Faltó revisar nivel de aceite." },
  { id: "chk2-1", checklistTemplateId: "chk2", completionDate: "2024-07-24T10:00:00Z", status: "Completado", completedByUserName: "Ana Gómez", notes: "Todos los equipos ERA operativos." },
  { id: "chk2-2", checklistTemplateId: "chk2", completionDate: "2024-07-17T10:15:00Z", status: "Completado", completedByUserName: "Ana Gómez" },
  { id: "chk3-1", checklistTemplateId: "chk3", completionDate: "2024-06-10T11:00:00Z", status: "Pendiente Revisión", completedByUserName: "Equipo HazMat Alfa", notes: "Protocolo ejecutado, pendiente revisión de supervisor." },
  { id: "chk4-1", checklistTemplateId: "chk4", completionDate: "2024-07-28T08:00:00Z", status: "Completado", completedByUserName: "Paramédico Luis Torres", notes: "Ambulancia lista para turno." },
];


export default function ChecklistsPage() {
  const [checklists, setChecklists] = useState<Checklist[]>(SIMULATED_CHECKLISTS);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateRangeFilter, setDateRangeFilter] = useState<DateRange | undefined>(undefined);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [checklistToEdit, setChecklistToEdit] = useState<Checklist | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [checklistToDelete, setChecklistToDelete] = useState<Checklist | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedChecklistForView, setSelectedChecklistForView] = useState<Checklist | null>(null);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [selectedChecklistForHistory, setSelectedChecklistForHistory] = useState<Checklist | null>(null);


  const { toast } = useToast();

  const handleChecklistAdded = (newChecklistData: NewChecklistData) => {
    const newChecklist: Checklist = {
      id: `chk${checklists.length + 1}-${Date.now()}`,
      name: newChecklistData.name,
      description: newChecklistData.description,
      category: newChecklistData.category,
      itemCount: 0, 
      lastModified: new Date().toISOString(),
      status: "Nuevo",
    };
    setChecklists(prev => [newChecklist, ...prev]);
  };

  const handleChecklistUpdated = (id: string, updatedData: EditChecklistData) => {
    setChecklists(prev =>
      prev.map(c =>
        c.id === id
          ? {
              ...c,
              name: updatedData.name,
              description: updatedData.description,
              category: updatedData.category,
              itemCount: updatedData.itemCount,
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
      (checklist.description && checklist.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === "all" || checklist.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || checklist.status === statusFilter;
    
    const matchesDateRange = (() => {
        if (!dateRangeFilter?.from) {
          return true; 
        }
        const itemDate = parseISO(checklist.lastModified);
        if (!isValid(itemDate)) return false; 

        const fromDate = startOfDay(dateRangeFilter.from);
        if (isBefore(itemDate, fromDate)) {
          return false;
        }

        if (dateRangeFilter.to) {
          const toDate = endOfDay(dateRangeFilter.to);
          if (isAfter(itemDate, toDate)) {
            return false;
          }
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
      case 'En Progreso': return 'bg-yellow-500 text-black hover:bg-yellow-600'; // text-black for yellow bg
      case 'Nuevo': return 'border-primary text-primary hover:bg-primary/10';
      default: return 'border-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-4 mb-6 bg-card border rounded-lg shadow-sm">
        <h1 className="text-2xl font-headline font-bold flex items-center">
          <ListChecks className="mr-3 h-7 w-7 text-primary" />
          Gestión de Checklists y Formularios
        </h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <FilePlus2 className="mr-2 h-5 w-5" /> Crear Nuevo Checklist
        </Button>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Filtros de Checklists</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4 items-center">
          <div className="relative w-full sm:w-auto sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre o descripción..."
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
              <SelectValue placeholder="Estado" />
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
                {checklists.length === 0 ? "No hay Checklists Creados" : "No se encontraron checklists"}
            </CardTitle>
            <CardDescription>
              {checklists.length === 0
                ? "Comienza creando tu primer checklist digital."
                : "Intenta ajustar los filtros o el término de búsqueda."
              }
            </CardDescription>
          </CardHeader>
           {checklists.length === 0 && (
            <CardContent>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <FilePlus2 className="mr-2 h-5 w-5" /> Crear Nuevo Checklist
              </Button>
            </CardContent>
          )}
        </Card>
      ) : (
        <Card className="shadow-md">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">Nombre</TableHead>
                  <TableHead className="min-w-[250px] hidden md:table-cell">Descripción</TableHead>
                  <TableHead className="hidden lg:table-cell">Categoría</TableHead>
                  <TableHead className="text-center">Ítems</TableHead>
                  <TableHead>Estado (Plantilla)</TableHead>
                  <TableHead className="hidden sm:table-cell">Últ. Modificación</TableHead>
                  <TableHead className="text-right w-[300px] sm:w-[320px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredChecklists.map((checklist) => (
                  <TableRow key={checklist.id}>
                    <TableCell className="font-medium">{checklist.name}</TableCell>
                    <TableCell className="text-xs text-muted-foreground hidden md:table-cell truncate max-w-xs" title={checklist.description}>
                      {checklist.description}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {checklist.category ? <Badge variant="outline">{checklist.category}</Badge> : "N/A"}
                    </TableCell>
                    <TableCell className="text-center">{checklist.itemCount}</TableCell>
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
                    <TableCell className="text-right space-x-1">
                      <Button variant="outline" size="sm" className="h-8 px-2 py-1 text-xs" onClick={() => handleViewChecklist(checklist)}>
                        <Eye className="mr-1 h-3.5 w-3.5" /> Ver
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 px-2 py-1 text-xs" onClick={() => handleViewHistory(checklist)}>
                        <History className="mr-1 h-3.5 w-3.5" /> Historial
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 px-2 py-1 text-xs" onClick={() => handleEditChecklist(checklist)}>
                        <Edit className="mr-1 h-3.5 w-3.5" /> Editar
                      </Button>
                      <Button variant="destructive" size="sm" className="h-8 px-2 py-1 text-xs" onClick={() => handleDeleteChecklist(checklist)}>
                        <Trash2 className="mr-1 h-3.5 w-3.5" /> Eliminar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
      <AddChecklistDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onChecklistAdded={handleChecklistAdded}
        existingCategories={uniqueCategories}
      />
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
      />
      <ChecklistHistoryDialog
        checklistTemplate={selectedChecklistForHistory}
        completions={SIMULATED_CHECKLIST_COMPLETIONS.filter(
          c => c.checklistTemplateId === selectedChecklistForHistory?.id
        )}
        open={isHistoryDialogOpen}
        onOpenChange={setIsHistoryDialogOpen}
      />
    </div>
  );
}
