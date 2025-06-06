
"use client";

import type { MaintenanceTask, MaintenanceStatus } from "@/types/maintenanceTypes";
import type { User } from "@/services/userService";
import { useEffect, useState, useCallback, useMemo } from "react";
import { getAllMaintenanceTasks } from "@/services/maintenanceService";
import { getAllUsers } from "@/services/userService";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { PlusCircle, Edit, Trash2, CheckSquare, Eye, Loader2, AlertTriangle, PackageSearch, CalendarIcon, FilterX } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AddMaintenanceDialog } from "@/components/maintenance/add-maintenance-dialog";
import { EditMaintenanceDialog } from "@/components/maintenance/edit-maintenance-dialog";
import { DeleteMaintenanceDialog } from "@/components/maintenance/delete-maintenance-dialog";
import { ViewMaintenanceDialog } from "@/components/maintenance/view-maintenance-dialog"; // Added ViewMaintenanceDialog
import { format, parseISO, isValid, isPast, differenceInDays, isBefore, isAfter, startOfDay, endOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from "@/lib/utils";

export default function MaintenancePage() {
  const [allMaintenanceTasks, setAllMaintenanceTasks] = useState<MaintenanceTask[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedTaskForEdit, setSelectedTaskForEdit] = useState<MaintenanceTask | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTaskForDelete, setSelectedTaskForDelete] = useState<MaintenanceTask | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTaskForView, setSelectedTaskForView] = useState<MaintenanceTask | null>(null); // State for View Dialog
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false); // State for View Dialog

  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});

  const fetchPageData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [tasks, fetchedUsers] = await Promise.all([
        getAllMaintenanceTasks(),
        getAllUsers()
      ]);
      setAllMaintenanceTasks(tasks);
      setUsers(fetchedUsers);
    } catch (err) {
      console.error("Error fetching maintenance tasks or users:", err);
      setError(err instanceof Error ? err.message : "No se pudieron cargar los datos de mantenciones.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPageData();
  }, [fetchPageData]);
  
  const filteredMaintenanceTasks = useMemo(() => {
    return allMaintenanceTasks
      .map(task => {
        if (task.estado_mantencion !== 'Completada' && task.estado_mantencion !== 'Cancelada' && task.fecha_programada) {
            const dueDate = parseISO(task.fecha_programada); 
            if (isValid(dueDate) && isPast(dueDate) && differenceInDays(new Date(), dueDate) > 0) {
                 return { ...task, estado_mantencion: 'Atrasada' as MaintenanceStatus };
            }
        }
        return task;
      })
      .filter(task => {
        if (!dateRange.from && !dateRange.to) return true;
        if (!task.fecha_programada) return false; // Tasks without a programmed date are hidden if a date filter is active

        let taskDate: Date;
        try {
            taskDate = parseISO(task.fecha_programada);
            if (!isValid(taskDate)) return false;
        } catch (e) {
            return false;
        }

        if (dateRange.from && isBefore(taskDate, startOfDay(dateRange.from))) {
            return false;
        }
        if (dateRange.to && isAfter(taskDate, endOfDay(dateRange.to))) {
            return false;
        }
        return true;
      });
  }, [allMaintenanceTasks, dateRange]);


  const handleTaskAddedOrUpdatedOrDeleted = () => {
    fetchPageData();
  };

  const openEditDialog = (task: MaintenanceTask) => {
    setSelectedTaskForEdit(task);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (task: MaintenanceTask) => {
    setSelectedTaskForDelete(task);
    setIsDeleteDialogOpen(true);
  };

  const openViewDialog = (task: MaintenanceTask) => { // Function to open View Dialog
    setSelectedTaskForView(task);
    setIsViewDialogOpen(true);
  };

  const formatDateTable = (dateString?: string | null) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString.includes('T') ? dateString : dateString + "T00:00:00");
      return format(date, "dd-MM-yyyy");
    } catch (e) {
      return dateString; 
    }
  };

  const getStatusBadgeVariant = (status: MaintenanceStatus): "default" | "secondary" | "outline" | "destructive" => {
    switch (status) {
      case "Completada": return "default";
      case "Programada": return "secondary";
      case "En Progreso": return "outline";
      case "Pendiente": return "destructive";
      case "Atrasada": return "destructive";
      case "Cancelada": return "outline";
      default: return "outline";
    }
  };

  const getStatusBadgeClassName = (status: MaintenanceStatus): string => {
    switch (status) {
      case "Completada": return "bg-green-500 hover:bg-green-600 text-white";
      case "Programada": return "bg-blue-500 hover:bg-blue-600 text-white";
      case "En Progreso": return "bg-yellow-500 hover:bg-yellow-600 text-black";
      case "Pendiente": return "bg-orange-500 hover:bg-orange-600 text-white";
      case "Atrasada": return "bg-red-600 hover:bg-red-700 text-white";
      case "Cancelada": return "bg-slate-500 hover:bg-slate-600 text-white";
      default: return "";
    }
  };
  
  if (loading && allMaintenanceTasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-10">
        <Loader2 className="h-12 w-12 animate-cool-loader-spin text-primary mb-4" />
        <p className="text-lg font-semibold">Cargando Mantenciones...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="max-w-2xl mx-auto">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error al Cargar Mantenciones</AlertTitle>
        <AlertDescription>
          {error.includes("La tabla 'Mantenciones' no existe")
            ? "La tabla 'Mantenciones' no existe en la base de datos. Por favor, ejecute el script SQL proporcionado para crearla."
            : error}
          <Button onClick={fetchPageData} variant="link" className="p-0 h-auto ml-2">Reintentar</Button>
        </AlertDescription>
      </Alert>
    );
  }


  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-4 mb-6 bg-card border rounded-lg shadow-sm">
        <h1 className="text-2xl font-headline font-bold">Mantención de Equipos</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <PlusCircle className="mr-2 h-5 w-5" /> Programar Nueva Mantención
        </Button>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-headline">Filtros</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4 items-center">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full sm:w-[240px] justify-start text-left font-normal",
                  !dateRange.from && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.from ? format(dateRange.from, "dd/MM/yyyy", { locale: es }) : <span>Fecha Desde</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateRange.from}
                onSelect={(date) => setDateRange(prev => ({ ...prev, from: date }))}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full sm:w-[240px] justify-start text-left font-normal",
                  !dateRange.to && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.to ? format(dateRange.to, "dd/MM/yyyy", { locale: es }) : <span>Fecha Hasta</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateRange.to}
                onSelect={(date) => setDateRange(prev => ({ ...prev, to: date }))}
                disabled={(date) => dateRange.from && isBefore(date, dateRange.from)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Button 
            variant="ghost" 
            onClick={() => setDateRange({})} 
            className="w-full sm:w-auto"
            disabled={!dateRange.from && !dateRange.to}
          >
            <FilterX className="mr-2 h-4 w-4" /> Limpiar Filtros
          </Button>
        </CardContent>
      </Card>
      
      {filteredMaintenanceTasks.length === 0 && !loading && (
         <Card className="shadow-md text-center">
          <CardHeader>
            <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full w-fit">
                <PackageSearch className="h-10 w-10" />
            </div>
            <CardTitle className="mt-4">
                {allMaintenanceTasks.length === 0 ? "No hay Mantenciones Programadas" : "No hay Mantenciones para este filtro"}
            </CardTitle>
            <CardDescription>
              {allMaintenanceTasks.length === 0
                ? "No hay tareas de mantención registradas en el sistema. Comienza programando una."
                : "Intenta ajustar los filtros de fecha o crea nuevas tareas de mantención."
              }
            </CardDescription>
          </CardHeader>
          {allMaintenanceTasks.length === 0 && (
            <CardContent>
             <Button onClick={() => setIsAddDialogOpen(true)}>
                <PlusCircle className="mr-2 h-5 w-5" /> Programar Nueva Mantención
            </Button>
          </CardContent>
          )}
        </Card>
      )}

      {filteredMaintenanceTasks.length > 0 && (
        <Card className="shadow-md">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ítem / Tipo</TableHead>
                  <TableHead>Fecha Programada</TableHead>
                  <TableHead>Responsable</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Última Realizada</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMaintenanceTasks.map((task) => (
                  <TableRow key={task.id_mantencion}>
                    <TableCell>
                      <div>{task.nombre_item_mantenimiento}</div>
                      <div className="text-xs text-muted-foreground">{task.tipo_item}</div>
                    </TableCell>
                    <TableCell>{formatDateTable(task.fecha_programada)}</TableCell>
                    <TableCell>{task.nombre_usuario_responsable || "N/A"}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={getStatusBadgeVariant(task.estado_mantencion)}
                        className={getStatusBadgeClassName(task.estado_mantencion)}
                      >
                        {task.estado_mantencion}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDateTable(task.fecha_ultima_realizada)}</TableCell>
                    <TableCell className="text-right space-x-1"> {/* Adjusted space-x-1 for new button */}
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8" 
                        title="Ver Detalles"
                        onClick={() => openViewDialog(task)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8" 
                        onClick={() => openEditDialog(task)} 
                        title="Editar / Completar Tarea"
                        disabled={task.estado_mantencion === 'Cancelada'}
                      >
                        {task.estado_mantencion === 'Completada' || task.estado_mantencion === 'Cancelada' ? <Edit className="h-4 w-4" /> : <CheckSquare className="h-4 w-4" />}
                      </Button>
                      <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => openDeleteDialog(task)} title="Eliminar Tarea">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
      <AddMaintenanceDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onTaskAdded={handleTaskAddedOrUpdatedOrDeleted}
        users={users}
      />
      {selectedTaskForEdit && (
        <EditMaintenanceDialog
            task={selectedTaskForEdit}
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            onTaskUpdated={handleTaskAddedOrUpdatedOrDeleted}
            users={users}
        />
      )}
      {selectedTaskForDelete && (
        <DeleteMaintenanceDialog
          task={selectedTaskForDelete}
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onTaskDeleted={handleTaskAddedOrUpdatedOrDeleted}
        />
      )}
      {selectedTaskForView && (
         <ViewMaintenanceDialog
            task={selectedTaskForView}
            open={isViewDialogOpen}
            onOpenChange={setIsViewDialogOpen}
        />
      )}
    </div>
  );
}

