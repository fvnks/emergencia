
"use client";

import type { MaintenanceTask, MaintenanceStatus } from "@/types/maintenanceTypes";
import type { User } from "@/services/userService";
import { useEffect, useState, useCallback } from "react";
import { getAllMaintenanceTasks } from "@/services/maintenanceService";
import { getAllUsers } from "@/services/userService";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Edit, Trash2, CheckSquare, Clock, Loader2, AlertTriangle, PackageSearch, ListChecks } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AddMaintenanceDialog } from "@/components/maintenance/add-maintenance-dialog";
import { EditMaintenanceDialog } from "@/components/maintenance/edit-maintenance-dialog";
import { DeleteMaintenanceDialog } from "@/components/maintenance/delete-maintenance-dialog"; // Importar Delete Dialog
import { format, parseISO, isValid, isPast, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';

export default function MaintenancePage() {
  const [maintenanceTasks, setMaintenanceTasks] = useState<MaintenanceTask[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedTaskForEdit, setSelectedTaskForEdit] = useState<MaintenanceTask | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTaskForDelete, setSelectedTaskForDelete] = useState<MaintenanceTask | null>(null); // Estado para Delete Dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false); // Estado para Delete Dialog
  // States para View, Complete dialogs se agregarán después

  const fetchPageData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [tasks, fetchedUsers] = await Promise.all([
        getAllMaintenanceTasks(),
        getAllUsers()
      ]);
      setMaintenanceTasks(tasks.map(task => {
        if (task.estado_mantencion !== 'Completada' && task.estado_mantencion !== 'Cancelada' && task.fecha_programada) {
            const dueDate = parseISO(task.fecha_programada + "T00:00:00"); 
            if (isValid(dueDate) && isPast(dueDate) && differenceInDays(new Date(), dueDate) > 0) {
                 return { ...task, estado_mantencion: 'Atrasada' as MaintenanceStatus };
            }
        }
        return task;
      }));
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

  const handleTaskAddedOrUpdatedOrDeleted = () => {
    fetchPageData();
  };

  const openEditDialog = (task: MaintenanceTask) => {
    setSelectedTaskForEdit(task);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (task: MaintenanceTask) => { // Función para abrir Delete Dialog
    setSelectedTaskForDelete(task);
    setIsDeleteDialogOpen(true);
  };

  const formatDate = (dateString?: string | null) => {
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
  
  if (loading && maintenanceTasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-10">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
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
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-headline font-bold">Mantención de Equipos</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <PlusCircle className="mr-2 h-5 w-5" /> Programar Nueva Mantención
        </Button>
      </div>
      
      {maintenanceTasks.length === 0 && !loading && (
         <Card className="shadow-lg text-center">
          <CardHeader>
            <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full w-fit">
                <PackageSearch className="h-10 w-10" />
            </div>
            <CardTitle className="mt-4">No hay Mantenciones Programadas</CardTitle>
            <CardDescription>
              No hay tareas de mantención registradas en el sistema. Comienza programando una.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <Button onClick={() => setIsAddDialogOpen(true)}>
                <PlusCircle className="mr-2 h-5 w-5" /> Programar Nueva Mantención
            </Button>
          </CardContent>
        </Card>
      )}

      {maintenanceTasks.length > 0 && (
        <Card className="shadow-lg">
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
                {maintenanceTasks.map((task) => (
                  <TableRow key={task.id_mantencion}>
                    <TableCell>
                      <div>{task.nombre_item_mantenimiento}</div>
                      <div className="text-xs text-muted-foreground">{task.tipo_item}</div>
                    </TableCell>
                    <TableCell>{formatDate(task.fecha_programada)}</TableCell>
                    <TableCell>{task.nombre_usuario_responsable || "N/A"}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={getStatusBadgeVariant(task.estado_mantencion)}
                        className={getStatusBadgeClassName(task.estado_mantencion)}
                      >
                        {task.estado_mantencion}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(task.fecha_ultima_realizada)}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="icon" className="h-8 w-8" title={task.estado_mantencion === "Completada" ? "Ver Registro" : "Marcar Completada"} disabled> {/* TODO */}
                        {task.estado_mantencion === "Completada" ? <Clock className="h-4 w-4" /> : <CheckSquare className="h-4 w-4" />}
                      </Button>
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => openEditDialog(task)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => openDeleteDialog(task)}> {/* Habilitar botón y llamar openDeleteDialog */}
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
      {selectedTaskForDelete && ( // Renderizar Delete Dialog
        <DeleteMaintenanceDialog
          task={selectedTaskForDelete}
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onTaskDeleted={handleTaskAddedOrUpdatedOrDeleted}
        />
      )}
      {/* Otros dialogs (View, Complete) se agregarán aquí */}
    </div>
  );
}
