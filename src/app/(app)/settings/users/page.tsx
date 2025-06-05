
"use client";

import type { User } from "@/services/userService";
import { useEffect, useState, useCallback } from "react";
import { getAllUsers } from "@/services/userService";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Loader2, AlertTriangle, UserPlus, ArrowLeft, ShieldCheck, UserCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AddPersonnelDialog } from "@/components/personnel/add-personnel-dialog";
import { EditPersonnelDialog } from "@/components/personnel/edit-personnel-dialog";
import { DeletePersonnelDialog } from "@/components/personnel/delete-personnel-dialog";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";

export default function ManageUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedUserForEdit, setSelectedUserForEdit] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUserForDelete, setSelectedUserForDelete] = useState<User | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);

  const { user: currentUser } = useAuth();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedUsers = await getAllUsers();
      setUsers(fetchedUsers);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(err instanceof Error ? err.message : "No se pudieron cargar los usuarios.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleUserAddedOrUpdatedOrDeleted = () => {
    fetchUsers();
  };

  const openEditDialog = (userToEdit: User) => {
    setSelectedUserForEdit(userToEdit);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (userToDelete: User) => {
    setSelectedUserForDelete(userToDelete);
    setIsDeleteDialogOpen(true);
  };

  const getRoleBadgeVariant = (role: User["rol"]) => {
    return role === "admin" ? "default" : "secondary";
  };
  
  const getRoleBadgeClassName = (role: User["rol"]) => {
    return role === 'admin' ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground' : 'bg-blue-500 hover:bg-blue-600 text-white';
  }

  if (loading && users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-10">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg font-semibold">Cargando Usuarios...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Button variant="outline" asChild className="mb-4">
          <Link href="/settings"><ArrowLeft className="mr-2 h-4 w-4" /> Volver a Configuración</Link>
        </Button>
        <Alert variant="destructive" className="max-w-2xl mx-auto">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error al Cargar Usuarios</AlertTitle>
          <AlertDescription>
            {error.includes("La tabla 'Usuarios' no existe")
              ? "La tabla 'Usuarios' no existe en la base de datos. Por favor, ejecute el script SQL para crearla."
              : error}
            <Button onClick={fetchUsers} variant="link" className="p-0 h-auto ml-2">Reintentar</Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Button variant="outline" asChild className="mb-2 sm:mb-0 sm:mr-4">
            <Link href="/settings"><ArrowLeft className="mr-2 h-4 w-4" /> Volver a Configuración</Link>
          </Button>
          <h1 className="text-3xl font-headline font-bold inline-block align-middle">Gestionar Usuarios y Roles</h1>
        </div>
        <Button onClick={() => setIsAddUserDialogOpen(true)}>
          <UserPlus className="mr-2 h-5 w-5" /> Agregar Nuevo Usuario
        </Button>
      </div>
      <p className="text-muted-foreground">
        Administra los usuarios del sistema, sus roles y datos de contacto.
      </p>

      {users.length === 0 && !loading && (
         <Card className="shadow-md text-center">
          <CardHeader>
            <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full w-fit">
                <UserCircle className="h-10 w-10" />
            </div>
            <CardTitle className="mt-4">No hay Usuarios Registrados</CardTitle>
            <CardDescription>
              Comienza agregando el primer usuario al sistema.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setIsAddUserDialogOpen(true)}>
                <UserPlus className="mr-2 h-5 w-5" /> Agregar Usuario
            </Button>
          </CardContent>
        </Card>
      )}

      {users.length > 0 && (
        <Card className="shadow-md">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">ID</TableHead>
                  <TableHead>Nombre Completo</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead className="w-[150px] text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id_usuario}>
                    <TableCell className="font-medium">{user.id_usuario}</TableCell>
                    <TableCell>{user.nombre_completo}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(user.rol)} className={getRoleBadgeClassName(user.rol)}>
                        {user.rol === 'admin' ? <ShieldCheck className="mr-1 h-3 w-3" /> : <UserCircle className="mr-1 h-3 w-3" />}
                        {user.rol.charAt(0).toUpperCase() + user.rol.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.telefono || "N/A"}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => openEditDialog(user)} title="Editar Usuario">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="icon" 
                        className="h-8 w-8" 
                        onClick={() => openDeleteDialog(user)} 
                        title="Eliminar Usuario"
                        disabled={currentUser?.id_usuario === user.id_usuario}
                      >
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

      <AddPersonnelDialog
        onPersonnelAdded={handleUserAddedOrUpdatedOrDeleted}
        open={isAddUserDialogOpen}
        onOpenChange={setIsAddUserDialogOpen}
      />
      {selectedUserForEdit && (
        <EditPersonnelDialog
          person={selectedUserForEdit}
          onPersonnelUpdated={handleUserAddedOrUpdatedOrDeleted}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
        />
      )}
      {selectedUserForDelete && (
        <DeletePersonnelDialog
          person={selectedUserForDelete}
          onPersonnelDeleted={handleUserAddedOrUpdatedOrDeleted}
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        />
      )}
    </div>
  );
}

