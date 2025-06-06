
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft, Fingerprint, PlusCircle, ShieldCheck, UserCircle2, Settings2, Edit as EditIcon, Trash2, Users, Loader2, AlertTriangle, DatabaseZap } from "lucide-react";
import { useState, useMemo, useEffect, useCallback } from "react";
import { AddRoleDialog } from "@/components/settings/roles/add-role-dialog";
import { DeleteRoleDialog } from "@/components/settings/roles/delete-role-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getAllRoles, getAllPermissions, createRole, updateRole, deleteRole, getRoleById, type Role, type Permission } from "@/services/roleService";
import { useToast } from "@/hooks/use-toast";


// Icons mapping based on role name for system roles, or default for custom.
const roleIcons: Record<string, React.ElementType> = {
  "Administrador": ShieldCheck,
  "Usuario Estándar": UserCircle2,
  "default": Settings2,
};

export default function RolesPermissionsPage() {
  const [rolesData, setRolesData] = useState<Role[]>([]);
  const [allAvailablePermissions, setAllAvailablePermissions] = useState<Permission[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [loadingPermissions, setLoadingPermissions] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const [isAddRoleDialogOpen, setIsAddRoleDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentEditingRole, setCurrentEditingRole] = useState<Role | null>(null);

  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);

  const fetchRolesAndPermissions = useCallback(async () => {
    setLoadingRoles(true);
    setLoadingPermissions(true);
    setError(null);
    try {
      const [fetchedRoles, fetchedPermissions] = await Promise.all([
        getAllRoles(),
        getAllPermissions(),
      ]);
      setRolesData(fetchedRoles);
      setAllAvailablePermissions(fetchedPermissions);
    } catch (err) {
      console.error("Error fetching roles or permissions:", err);
      const errorMessage = err instanceof Error ? err.message : "No se pudieron cargar los datos de roles y permisos.";
      setError(errorMessage);
    } finally {
      setLoadingRoles(false);
      setLoadingPermissions(false);
    }
  }, []);

  useEffect(() => {
    fetchRolesAndPermissions();
  }, [fetchRolesAndPermissions]);


  const handleSaveRole = async (
    roleData: { name: string; description: string; selectedPermissions: number[] },
    existingRoleId?: number
  ) => {
    try {
      if (existingRoleId) {
        await updateRole(existingRoleId, {
          nombre_rol: roleData.name,
          descripcion_rol: roleData.description,
          permission_ids: roleData.selectedPermissions,
        });
        toast({ title: "Rol Actualizado", description: `El rol "${roleData.name}" ha sido actualizado.` });
      } else {
        await createRole({
          nombre_rol: roleData.name,
          descripcion_rol: roleData.description,
          permission_ids: roleData.selectedPermissions,
        });
        toast({ title: "Rol Creado", description: `El rol "${roleData.name}" ha sido creado.` });
      }
      fetchRolesAndPermissions();
      setIsAddRoleDialogOpen(false);
      setCurrentEditingRole(null);
      setIsEditMode(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Ocurrió un error al guardar el rol.";
      toast({ title: "Error al Guardar Rol", description: errorMessage, variant: "destructive" });
    }
  };

  const openAddDialog = () => {
    setIsEditMode(false);
    setCurrentEditingRole(null);
    setIsAddRoleDialogOpen(true);
  };

  const openEditDialog = async (role: Role) => {
    if (role.es_rol_sistema) {
        toast({title: "Acción no permitida", description: "Los roles del sistema no pueden ser editados.", variant: "destructive"});
        return;
    }
    try {
        setLoadingRoles(true);
        const fullRoleDetails = await getRoleById(role.id_rol);
        if (!fullRoleDetails) {
            throw new Error("No se pudo cargar la información completa del rol para editar.");
        }
        setCurrentEditingRole(fullRoleDetails);
        setIsEditMode(true);
        setIsAddRoleDialogOpen(true);
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Error al cargar detalles del rol.";
        toast({ title: "Error", description: errorMessage, variant: "destructive" });
    } finally {
        setLoadingRoles(false);
    }
  };

  const openDeleteDialog = (role: Role) => {
    if (role.es_rol_sistema) {
        toast({title: "Acción no permitida", description: "Los roles del sistema no pueden ser eliminados.", variant: "destructive"});
        return;
    }
     if (role.user_count && role.user_count > 0) {
        toast({title: "Rol en Uso", description: `El rol "${role.nombre_rol}" está asignado a ${role.user_count} usuario(s) y no puede ser eliminado. Reasigne los usuarios primero.`, variant: "destructive"});
        return;
    }
    setRoleToDelete(role);
    setIsDeleteAlertOpen(true);
  };

  const handleConfirmDeleteRole = async () => {
    if (roleToDelete && !roleToDelete.es_rol_sistema) {
      try {
        await deleteRole(roleToDelete.id_rol);
        toast({ title: "Rol Eliminado", description: `El rol "${roleToDelete.nombre_rol}" ha sido eliminado.` });
        fetchRolesAndPermissions();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "No se pudo eliminar el rol.";
        toast({ title: "Error al Eliminar Rol", description: errorMessage, variant: "destructive" });
      }
    }
    setRoleToDelete(null);
    setIsDeleteAlertOpen(false);
  };

  if (loadingRoles || loadingPermissions) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-10">
        <Loader2 className="h-12 w-12 animate-cool-loader-spin text-primary mb-4" />
        <p className="text-lg font-semibold">Cargando Roles y Permisos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="max-w-2xl mx-auto">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error de Carga</AlertTitle>
        <AlertDescription>
          {error}
          <Button onClick={fetchRolesAndPermissions} variant="link" className="p-0 h-auto ml-2">Reintentar</Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="outline" asChild className="mb-4">
        <Link href="/settings"><ArrowLeft className="mr-2 h-4 w-4" /> Volver a Configuración</Link>
      </Button>
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-4 bg-card border rounded-lg shadow-sm">
        <div className="flex-grow">
          <h1 className="text-2xl font-headline font-bold inline-block align-middle">
            <Fingerprint className="mr-3 h-7 w-7 inline-block align-middle text-primary" />
            Gestión de Roles y Permisos
          </h1>
        </div>
        <Button onClick={openAddDialog} disabled={loadingPermissions || allAvailablePermissions.length === 0} className="flex-shrink-0">
          <PlusCircle className="mr-2 h-5 w-5" /> Agregar Nuevo Rol
        </Button>
      </div>
      <p className="text-muted-foreground -mt-2 px-1">
        Define roles personalizados y asigna permisos específicos a cada módulo.
        {loadingPermissions && allAvailablePermissions.length === 0 && <span className="text-destructive"> (Cargando permisos disponibles...)</span>}
         {allAvailablePermissions.length === 0 && !loadingPermissions && <span className="text-orange-600"> (No hay permisos definidos en la base de datos. Por favor, ejecute el script SQL de roles y permisos.)</span>}
      </p>

      {rolesData.length === 0 && !loadingRoles && !loadingPermissions && !error && (
        <Card className="shadow-md text-center">
          <CardHeader>
            <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full w-fit">
                <DatabaseZap className="h-10 w-10" />
            </div>
            <CardTitle className="mt-4">No hay Roles Definidos</CardTitle>
            <CardDescription>
              No se encontraron roles en el sistema. Comienza agregando uno para gestionar los permisos de los usuarios.
            </CardDescription>
          </CardHeader>
           <CardContent>
              <Button onClick={openAddDialog} disabled={loadingPermissions || allAvailablePermissions.length === 0}>
                  <PlusCircle className="mr-2 h-5 w-5" /> Agregar Nuevo Rol
              </Button>
           </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        {rolesData.map((role) => {
          const RoleIcon = roleIcons[role.nombre_rol] || roleIcons["default"];
          return (
            <Card key={role.id_rol} className="shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                      <RoleIcon className="h-8 w-8 text-primary" />
                      <div>
                      <CardTitle className="text-xl font-headline">{role.nombre_rol}</CardTitle>
                      <CardDescription>{role.descripcion_rol || "Sin descripción"}</CardDescription>
                      </div>
                  </div>
                  {!role.es_rol_sistema && (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(role)} disabled={allAvailablePermissions.length === 0}>
                        <EditIcon className="mr-2 h-4 w-4" /> Editar Rol
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => openDeleteDialog(role)} disabled={role.user_count != null && role.user_count > 0}>
                        <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm text-muted-foreground border-t pt-3">
                    <div className="flex items-center">
                        <ShieldCheck className="mr-1.5 h-4 w-4" />
                        Permisos Asignados: {role.permission_count ?? 'N/A'}
                    </div>
                    <div className="flex items-center">
                        <Users className="mr-1.5 h-4 w-4" />
                        Usuarios con este Rol: {role.user_count ?? 'N/A'}
                    </div>
                </div>

                {role.es_rol_sistema ? (
                  <div className="pt-1 text-xs text-muted-foreground italic">
                    (Rol del sistema - no editable/eliminable)
                  </div>
                ): (
                   <div className="pt-1 text-xs text-muted-foreground italic">
                    (Rol personalizado)
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

       <AddRoleDialog
        open={isAddRoleDialogOpen}
        onOpenChange={setIsAddRoleDialogOpen}
        onSaveRole={handleSaveRole}
        availablePermissions={allAvailablePermissions}
        existingRole={isEditMode ? currentEditingRole : null}
       />

       <DeleteRoleDialog
        open={isDeleteAlertOpen}
        onOpenChange={setIsDeleteAlertOpen}
        role={roleToDelete}
        onConfirmDelete={handleConfirmDeleteRole}
       />

    </div>
  );
}
