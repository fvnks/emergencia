
"use client";

import type { Task, TaskStatus } from "@/services/taskService";
import type { User } from "@/services/userService";
import { useEffect, useState, useCallback, useMemo } from "react";
import { getAllTasks } from "@/services/taskService";
import { getAllUsers } from "@/services/userService";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Edit, Trash2, Eye, Loader2, AlertTriangle, PackageSearch } from "lucide-react"; 
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AddTaskDialog } from "@/components/tasks/add-task-dialog";
import { EditTaskDialog } from "@/components/tasks/edit-task-dialog";
import { DeleteTaskDialog } from "@/components/tasks/delete-task-dialog";
import { ViewTaskDialog } from "@/components/tasks/view-task-dialog";
import { format, parseISO, isValid } from 'date-fns';
import { es } from 'date-fns/locale';


export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [usersForFilter, setUsersForFilter] = useState<User[]>([]);
  const [selectedUserIdFilter, setSelectedUserIdFilter] = useState<string>("all"); // 'all', or user_id as string
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedTaskForEdit, setSelectedTaskForEdit] = useState<Task | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTaskForDelete, setSelectedTaskForDelete] = useState<Task | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTaskForView, setSelectedTaskForView] = useState<Task | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);


  const fetchPageData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [fetchedTasks, fetchedUsers] = await Promise.all([
        getAllTasks(),
        getAllUsers(),
      ]);
      setTasks(fetchedTasks);
      setUsersForFilter(fetchedUsers);
    } catch (err) {
      console.error("Error fetching tasks or users:", err);
      setError(err instanceof Error ? err.message : "No se pudieron cargar los datos para la página de tareas.");
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

  const openEditDialog = (task: Task) => {
    setSelectedTaskForEdit(task);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (task: Task) => {
    setSelectedTaskForDelete(task);
    setIsDeleteDialogOpen(true);
  };
  
  const openViewDialog = (task: Task) => {
    setSelectedTaskForView(task);
    setIsViewDialogOpen(true);
  };

  const filteredTasks = useMemo(() => {
    if (selectedUserIdFilter === "all") {
      return tasks;
    }
    // No filter for "unassigned" yet, as DB schema does not directly support it without a specific value.
    // For now, filtering by specific user ID.
    const userId = parseInt(selectedUserIdFilter, 10);
    return tasks.filter(task => task.id_usuario_asignado === userId);
  }, [tasks, selectedUserIdFilter]);

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "N/A";
    try {
      // Ensure date is parsed correctly if only YYYY-MM-DD
      const date = new Date(dateString.includes('T') ? dateString : dateString + "T00:00:00");
      return format(date, "dd-MM-yyyy", { locale: es });
    } catch (e) {
      return dateString; // Fallback to original string if formatting fails
    }
  };

  const getStatusBadgeVariant = (status: TaskStatus) => {
    switch (status) {
      case "Completada": return "default"; 
      case "En Proceso": return "secondary"; 
      case "Programada": return "outline"; 
      case "Pendiente": return "destructive"; 
      case "Atrasada": return "destructive"; 
      default: return "outline";
    }
  };

  const getStatusBadgeClassName = (status: TaskStatus) => {
     switch (status) {
      case "Completada": return "bg-green-500 hover:bg-green-600 text-white";
      case "En Proceso": return "bg-yellow-500 hover:bg-yellow-600 text-black";
      case "Programada": return "bg-blue-500 hover:bg-blue-600 text-white";
      case "Pendiente": return "bg-slate-400 hover:bg-slate-500 text-white"; 
      case "Atrasada": return "border-red-700 bg-red-600 hover:bg-red-700 text-white";
      default: return "";
    }
  }

  if (loading && tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-10">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg font-semibold">Cargando tareas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="max-w-2xl mx-auto">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error al Cargar Tareas</AlertTitle>
        <AlertDescription>
          {error.includes("La tabla 'Tareas' no existe") 
            ? "La tabla 'Tareas' no existe en la base de datos. Por favor, ejecute el script SQL proporcionado para crearla."
            : error}
          <Button onClick={fetchPageData} variant="link" className="p-0 h-auto ml-2">Reintentar</Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-4 mb-6 bg-card border rounded-lg shadow-sm">
        <h1 className="text-2xl font-headline font-bold">Gestión de Tareas</h1>
        <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center w-full sm:w-auto">
          <Select value={selectedUserIdFilter} onValueChange={setSelectedUserIdFilter}>
            <SelectTrigger className="w-full sm:w-[220px] bg-background"> {/* Cambiado bg-card a bg-background */}
              <SelectValue placeholder="Filtrar por asignado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todo el Personal</SelectItem>
              {usersForFilter.map(user => (
                <SelectItem key={user.id_usuario} value={user.id_usuario.toString()}>
                  {user.nombre_completo}
                </SelectItem>
              ))}
              {/* <SelectItem value="unassigned">Sin Asignar</SelectItem>  // TODO: Implementar si la lógica de "Sin Asignar" es necesaria */}
            </SelectContent>
          </Select>
          <Button className="w-full sm:w-auto" onClick={() => setIsAddDialogOpen(true)}>
            <PlusCircle className="mr-2 h-5 w-5" /> Crear Nueva Tarea
          </Button>
        </div>
      </div>

      {filteredTasks.length === 0 && !loading && (
         <Card className="shadow-md text-center">
          <CardHeader>
            <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full w-fit">
                <PackageSearch className="h-10 w-10" />
            </div>
            <CardTitle className="mt-4">No hay tareas</CardTitle>
            <CardDescription>
              {selectedUserIdFilter === "all" ? "No hay tareas registradas en el sistema." : "No hay tareas que coincidan con el filtro actual."}
              {selectedUserIdFilter === "all" && " Comienza creando una."}
            </CardDescription>
          </CardHeader>
          {selectedUserIdFilter === "all" && (
            <CardContent>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                    <PlusCircle className="mr-2 h-5 w-5" /> Crear Nueva Tarea
                </Button>
            </CardContent>
          )}
        </Card>
      )}

      {filteredTasks.length > 0 && (
        <Card className="shadow-md">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">ID</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead className="w-[180px]">Asignado A</TableHead>
                  <TableHead className="w-[150px]">Fecha Vencimiento</TableHead>
                  <TableHead className="w-[130px]">Estado</TableHead>
                  <TableHead className="text-right w-[150px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.map((task) => (
                  <TableRow key={task.id_tarea}>
                    <TableCell className="font-medium">{`T-${task.id_tarea.toString().padStart(3, '0')}`}</TableCell>
                    <TableCell>{task.descripcion_tarea}</TableCell>
                    <TableCell>{task.nombre_usuario_asignado || <span className="text-muted-foreground italic">Sin Asignar</span>}</TableCell>
                    <TableCell>{formatDate(task.fecha_vencimiento)}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={getStatusBadgeVariant(task.estado_tarea)}
                        className={getStatusBadgeClassName(task.estado_tarea)}
                      >
                        {task.estado_tarea}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-1"> {/* Ajustado space-x-1 */}
                      <Button variant="outline" size="icon" className="h-8 w-8" title="Ver Detalles" onClick={() => openViewDialog(task)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" className="h-8 w-8" title="Editar Tarea" onClick={() => openEditDialog(task)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="icon" className="h-8 w-8" title="Eliminar Tarea" onClick={() => openDeleteDialog(task)}>
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

      <AddTaskDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen} 
        onTaskAdded={handleTaskAddedOrUpdatedOrDeleted} 
        users={usersForFilter}
      />
      {selectedTaskForEdit && (
        <EditTaskDialog 
            task={selectedTaskForEdit} 
            open={isEditDialogOpen} 
            onOpenChange={setIsEditDialogOpen} 
            onTaskUpdated={handleTaskAddedOrUpdatedOrDeleted}
            users={usersForFilter}
        />
      )}
      {selectedTaskForDelete && (
        <DeleteTaskDialog 
            task={selectedTaskForDelete} 
            open={isDeleteDialogOpen} 
            onOpenChange={setIsDeleteDialogOpen} 
            onTaskDeleted={handleTaskAddedOrUpdatedOrDeleted}
        />
      )}
      {selectedTaskForView && (
        <ViewTaskDialog 
            task={selectedTaskForView}
            open={isViewDialogOpen}
            onOpenChange={setIsViewDialogOpen}
        />
      )}
    </div>
  );
}

    

    
