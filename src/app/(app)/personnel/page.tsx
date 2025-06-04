
"use client";

import type { User } from "@/services/userService"; 
import type { EppAssignment } from "@/services/eppAssignmentService";
import { useEffect, useState, useCallback } from "react";
import { getAllUsers } from "@/services/userService";
import { getEppAssignedToUser } from "@/services/eppAssignmentService";
import { getActiveTasksForUser, type Task } from "@/services/taskService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Edit, Trash2, ShieldCheck, ClipboardList, Mail, Phone, Loader2, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AddPersonnelDialog } from "@/components/personnel/add-personnel-dialog";
import { DeletePersonnelDialog } from "@/components/personnel/delete-personnel-dialog";
import { EditPersonnelDialog } from "@/components/personnel/edit-personnel-dialog";
import { useAuth } from "@/contexts/auth-context";
import { Badge } from "@/components/ui/badge";

export default function PersonnelPage() {
  const [personnel, setPersonnel] = useState<User[]>([]);
  const [assignedEpp, setAssignedEpp] = useState<Record<number, EppAssignment[]>>({});
  const [assignedTasks, setAssignedTasks] = useState<Record<number, Task[]>>({}); 
  const [loading, setLoading] = useState(true); // Global loading for personnel list
  const [eppLoading, setEppLoading] = useState<Record<number, boolean>>({});
  const [tasksLoading, setTasksLoading] = useState<Record<number, boolean>>({}); 
  const [error, setError] = useState<string | null>(null);
  
  const [selectedPersonForDelete, setSelectedPersonForDelete] = useState<User | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const [selectedPersonForEdit, setSelectedPersonForEdit] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { user: currentUser } = useAuth();

  const fetchPersonnelDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    setPersonnel([]); 
    setAssignedEpp({});
    setAssignedTasks({});
    setEppLoading({});
    setTasksLoading({});

    try {
      const users = await getAllUsers();
      setPersonnel(users);

      if (users.length > 0) {
        const initialEppLoadingState: Record<number, boolean> = {};
        const initialTasksLoadingState: Record<number, boolean> = {};
        users.forEach(u => {
          initialEppLoadingState[u.id_usuario] = true;
          initialTasksLoadingState[u.id_usuario] = true;
        });
        setEppLoading(initialEppLoadingState);
        setTasksLoading(initialTasksLoadingState);

        // Fetch EPP and Tasks for each user
        for (const person of users) {
          getEppAssignedToUser(person.id_usuario)
            .then(eppItems => {
              setAssignedEpp(prev => ({ ...prev, [person.id_usuario]: eppItems }));
            })
            .catch(eppError => {
              console.error(`Error fetching EPP for user ${person.id_usuario}:`, eppError);
              setAssignedEpp(prev => ({ ...prev, [person.id_usuario]: [] })); // Set empty on error
            })
            .finally(() => {
              setEppLoading(prev => ({ ...prev, [person.id_usuario]: false }));
            });

          getActiveTasksForUser(person.id_usuario)
            .then(activeTasks => {
              setAssignedTasks(prev => ({ ...prev, [person.id_usuario]: activeTasks }));
            })
            .catch(taskError => {
              console.error(`Error fetching tasks for user ${person.id_usuario}:`, taskError);
              setAssignedTasks(prev => ({ ...prev, [person.id_usuario]: [] })); // Set empty on error
            })
            .finally(() => {
              setTasksLoading(prev => ({ ...prev, [person.id_usuario]: false }));
            });
        }
      }
    } catch (err) {
      console.error("Error fetching personnel list:", err);
      let errorMessage = "No se pudo cargar la lista de personal.";
       if (err instanceof Error && (err as any).code === 'ER_NO_SUCH_TABLE') {
           errorMessage = "Error: Una o más tablas requeridas para el personal no existen en la base de datos (Usuarios, EPP_Asignaciones_Actuales, Tareas).";
       } else if (err instanceof Error) {
           errorMessage = err.message;
       }
      setError(errorMessage);
    } finally {
      setLoading(false); 
    }
  }, []);


  useEffect(() => {
    fetchPersonnelDetails();
  }, [fetchPersonnelDetails]);

  const handlePersonnelAddedOrUpdatedOrDeleted = () => {
    fetchPersonnelDetails(); 
  };

  const openDeleteDialog = (person: User) => {
    setSelectedPersonForDelete(person);
    setIsDeleteDialogOpen(true);
  };

  const openEditDialog = (person: User) => {
    setSelectedPersonForEdit(person);
    setIsEditDialogOpen(true);
  };

  const getInitials = (name?: string) => {
    if (!name) return '??';
    const nameParts = name.split(' ');
    if (nameParts.length > 1) {
      return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  if (loading && personnel.length === 0) { 
    return (
      <div className="flex flex-col items-center justify-center h-full py-10">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg font-semibold">Cargando personal...</p>
      </div>
    );
  }

  if (error && personnel.length === 0) { 
    return (
      <Alert variant="destructive" className="max-w-2xl mx-auto">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error al Cargar Personal</AlertTitle>
        <AlertDescription>
          {error}
          <Button onClick={fetchPersonnelDetails} variant="link" className="p-0 h-auto ml-2">Reintentar</Button>
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-headline font-bold">Directorio de Personal</h1>
        <AddPersonnelDialog onPersonnelAdded={handlePersonnelAddedOrUpdatedOrDeleted} />
      </div>

      {personnel.length === 0 && !loading && (
        <Card className="shadow-lg">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">No hay personal registrado en el sistema.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Intenta agregar nuevo personal.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {personnel.map((person) => (
          <Card key={person.id_usuario} className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
            <CardHeader className="items-center text-center">
              <Avatar className="h-24 w-24 mb-3">
                <AvatarImage 
                  src={`https://placehold.co/100x100.png?text=${person.avatar_seed || getInitials(person.nombre_completo)}`} 
                  alt={person.nombre_completo}
                  data-ai-hint={person.rol === 'admin' ? "administrador avatar" : "usuario avatar"}
                />
                <AvatarFallback>{person.avatar_seed || getInitials(person.nombre_completo)}</AvatarFallback>
              </Avatar>
              <CardTitle className="font-headline text-xl">{person.nombre_completo}</CardTitle>
              <CardDescription className="capitalize">{person.rol}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-2 text-sm">
              <div className="flex items-center">
                <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                {person.email}
              </div>
              {person.telefono && (
                <div className="flex items-center">
                  <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                  {person.telefono}
                </div>
              )}
              <div className="flex items-start pt-1">
                <ShieldCheck className="mr-2 h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium">EPP Asignado: </span>
                  {eppLoading[person.id_usuario] && <span className="text-xs text-muted-foreground">Cargando EPP...</span>}
                  {!eppLoading[person.id_usuario] && (!assignedEpp[person.id_usuario] || assignedEpp[person.id_usuario]?.length === 0) && (
                    <span className="text-muted-foreground">Ninguno</span>
                  )}
                  {!eppLoading[person.id_usuario] && assignedEpp[person.id_usuario] && assignedEpp[person.id_usuario]?.length > 0 && (
                    <ul className="list-disc list-inside ml-0 space-y-0.5">
                      {assignedEpp[person.id_usuario]?.map(epp => (
                        <li key={epp.id_asignacion_epp} className="text-xs">
                           {epp.cantidad_asignada}x {epp.nombre_item_epp} ({epp.codigo_item_epp})
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              <div className="flex items-start pt-1">
                <ClipboardList className="mr-2 h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium">Tareas Activas: </span>
                  {tasksLoading[person.id_usuario] && <span className="text-xs text-muted-foreground">Cargando tareas...</span>}
                  {!tasksLoading[person.id_usuario] && (!assignedTasks[person.id_usuario] || assignedTasks[person.id_usuario]?.length === 0) && (
                    <span className="text-muted-foreground">Ninguna</span>
                  )}
                  {!tasksLoading[person.id_usuario] && assignedTasks[person.id_usuario] && assignedTasks[person.id_usuario]?.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {assignedTasks[person.id_usuario]?.length} {assignedTasks[person.id_usuario]?.length === 1 ? 'tarea activa' : 'tareas activas'}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2 border-t pt-4">
              <Button variant="outline" size="sm" onClick={() => openEditDialog(person)}> 
                <Edit className="mr-1 h-4 w-4" /> Editar
              </Button>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={() => openDeleteDialog(person)}
                disabled={currentUser?.id_usuario === person.id_usuario} 
              >
                <Trash2 className="mr-1 h-4 w-4" /> Eliminar
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      {selectedPersonForDelete && (
        <DeletePersonnelDialog
          person={selectedPersonForDelete}
          onPersonnelDeleted={handlePersonnelAddedOrUpdatedOrDeleted}
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        />
      )}
       {selectedPersonForEdit && (
        <EditPersonnelDialog
          person={selectedPersonForEdit}
          onPersonnelUpdated={handlePersonnelAddedOrUpdatedOrDeleted}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
        />
      )}
    </div>
  );
}
