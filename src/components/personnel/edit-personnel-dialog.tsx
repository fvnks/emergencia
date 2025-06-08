
"use client";

import type { User, UserUpdateInput, UserRole as UserRoleKey } from "@/services/userService";
import type { Role } from "@/services/roleService";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { updateUserProfile, getAllUsers } from "@/services/userService"; // getAllUsers was missing, needed for admin check
import { getAllRoles } from "@/services/roleService";
import { Loader2, Edit } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

const editFormSchema = z.object({
  nombre_completo: z.string().min(3, { message: "El nombre debe tener al menos 3 caracteres." }),
  email: z.string().email({ message: "Correo electrónico inválido." }),
  id_rol_fk: z.string().min(1, { message: "Debe seleccionar un rol." }).optional(), // ID del rol como string, make optional for cases where admin might not change it
  telefono: z.string().optional().nullable(),
});

type EditPersonnelFormValues = z.infer<typeof editFormSchema>;

interface EditPersonnelDialogProps {
  person: User;
  onPersonnelUpdated: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditPersonnelDialog({ person, onPersonnelUpdated, open, onOpenChange }: EditPersonnelDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(true); // State for loading roles
  const { toast } = useToast();
  const { user: currentUser, setUser: setCurrentUserInAuth } = useAuth();

  const form = useForm<EditPersonnelFormValues>({
    resolver: zodResolver(editFormSchema),
    defaultValues: {
      nombre_completo: "",
      email: "",
      id_rol_fk: "", // Default to empty string to show placeholder
      telefono: "",
    },
  });

  useEffect(() => {
    async function fetchRolesAndSetDefaults() {
        if (open && person) {
            setLoadingRoles(true);
            try {
                const roles = await getAllRoles();
                // Allow current system role to be visible/selected, but filter out other system roles for selection
                setAvailableRoles(roles.filter(r => !r.es_rol_sistema || r.id_rol === person.id_rol_fk));
                form.reset({
                    nombre_completo: person.nombre_completo,
                    email: person.email,
                    id_rol_fk: person.id_rol_fk ? person.id_rol_fk.toString() : "", // Set to empty string if no role
                    telefono: person.telefono || "",
                });
            } catch (error) {
                console.error("Error fetching roles for personnel edit dialog:", error);
                toast({ title: "Error", description: "No se pudieron cargar los roles disponibles.", variant: "destructive" });
                setAvailableRoles([]); // Ensure it's empty on error
            } finally {
                setLoadingRoles(false);
            }
        } else if (!open) {
            setLoadingRoles(true); // Reset loading state when dialog closes
            setAvailableRoles([]); // Clear roles to avoid stale data
        }
    }
    fetchRolesAndSetDefaults();
  }, [person, open, form, toast]);

  async function onSubmit(values: EditPersonnelFormValues) {
    setIsSubmitting(true);
    try {
      const selectedRoleId = values.id_rol_fk ? parseInt(values.id_rol_fk, 10) : null;
      const selectedRole = availableRoles.find(r => r.id_rol === selectedRoleId);

      if (values.id_rol_fk && !selectedRole) { // Check if a role was selected but not found (should not happen with proper loading)
          toast({ title: "Error", description: "Rol seleccionado no válido.", variant: "destructive" });
          setIsSubmitting(false);
          return;
      }

      // Prevent admin from changing their own role if they are the only admin
      if (currentUser?.id === person.id_usuario && currentUser.role === 'admin' && selectedRole?.nombre_rol !== 'Administrador') {
        const allUsers = await getAllUsers();
        const admins = allUsers.filter(u => u.nombre_rol === 'Administrador');
        if (admins.length <= 1 && admins[0].id_usuario === currentUser.id) {
             toast({ title: "Acción no permitida", description: "No puedes cambiar tu propio rol si eres el único administrador.", variant: "destructive", duration: 7000 });
             setIsSubmitting(false);
             return;
        }
      }

      const updateData: UserUpdateInput = {
        nombre_completo: values.nombre_completo,
        email: values.email,
        id_rol_fk: selectedRoleId, // Use parsed ID or null
        telefono: values.telefono || null,
      };

      const updatedUser = await updateUserProfile(person.id_usuario, updateData);

      toast({
        title: "Personal Actualizado",
        description: `Los datos de ${values.nombre_completo} han sido actualizados exitosamente.`,
      });

      if (updatedUser && currentUser && currentUser.id === updatedUser.id_usuario) {
        const roleKey: UserRoleKey = updatedUser.nombre_rol === 'Administrador' ? 'admin' : 'usuario';
        const authUserToUpdate = {
            id: updatedUser.id_usuario,
            name: updatedUser.nombre_completo,
            email: updatedUser.email,
            role: roleKey,
            avatarSeed: updatedUser.avatar_seed
        };
        setCurrentUserInAuth(authUserToUpdate);
        localStorage.setItem('brigadeUser', JSON.stringify(authUserToUpdate));
      }

      onPersonnelUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating personnel:", error);
      toast({
        title: "Error al Actualizar Personal",
        description: error instanceof Error ? error.message : "No se pudo actualizar el usuario.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  // Determine if the role select should be disabled
  const isCurrentUserAdminEditingSelf = currentUser?.id === person.id_usuario && person.nombre_rol === 'Administrador';


  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (isSubmitting && !isOpen) return;
      onOpenChange(isOpen);
      if (!isOpen) form.reset();
    }}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Editar Datos del Personal</DialogTitle>
          <DialogDescription>
            Modifique los campos para actualizar los datos de {person.nombre_completo}.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
            <FormField
              control={form.control}
              name="nombre_completo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Juan Alberto Pérez Soto" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo Electrónico</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="juan.perez@ejemplo.cl" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="id_rol_fk"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Rol</FormLabel>
                    <Select
                        onValueChange={field.onChange}
                        value={field.value || ""} // Use empty string to show placeholder if value is null/undefined
                        disabled={isCurrentUserAdminEditingSelf}
                    >
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Seleccione un rol" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {loadingRoles ? (
                            <div className="p-2 text-sm text-muted-foreground flex items-center justify-center">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Cargando roles...
                            </div>
                          ) : availableRoles.length === 0 ? (
                            <div className="p-2 text-sm text-muted-foreground">No hay roles asignables.</div>
                          ) : (
                            availableRoles.map(role => (
                                <SelectItem
                                key={role.id_rol}
                                value={role.id_rol.toString()}
                                // Disable selection of system roles if it's not the person's current role
                                disabled={role.es_rol_sistema && role.id_rol !== person.id_rol_fk}
                                >
                                {role.nombre_rol} {role.es_rol_sistema ? "(Sistema)" : ""}
                                </SelectItem>
                            ))
                          )}
                        </SelectContent>
                    </Select>
                     {isCurrentUserAdminEditingSelf && (
                        <p className="text-xs text-muted-foreground pt-1">No puedes cambiar tu propio rol de Administrador aquí (por seguridad).</p>
                    )}
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="telefono"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Teléfono (Opcional)</FormLabel>
                    <FormControl>
                        <Input placeholder="Ej: 912345678" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting || loadingRoles}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <><Edit className="mr-2 h-4 w-4" /> Actualizar Datos</>}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

