
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
import { updateUserProfile } from "@/services/userService";
import { getAllRoles } from "@/services/roleService";
import { Loader2, Edit } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

const editFormSchema = z.object({
  nombre_completo: z.string().min(3, { message: "El nombre debe tener al menos 3 caracteres." }),
  email: z.string().email({ message: "Correo electrónico inválido." }),
  id_rol_fk: z.string().min(1, { message: "Debe seleccionar un rol." }), // ID del rol como string
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
  const { toast } = useToast();
  const { user: currentUser, setUser: setCurrentUserInAuth } = useAuth();

  const form = useForm<EditPersonnelFormValues>({
    resolver: zodResolver(editFormSchema),
    defaultValues: {
      nombre_completo: "",
      email: "",
      id_rol_fk: "",
      telefono: "",
    },
  });

  useEffect(() => {
    async function fetchRolesAndSetDefaults() {
        if (open && person) {
            try {
                const roles = await getAllRoles();
                // Permitir ver el rol actual del sistema, pero no seleccionar otros roles del sistema si no es el actual.
                setAvailableRoles(roles.filter(r => !r.es_rol_sistema || r.id_rol === person.id_rol_fk));
                form.reset({
                    nombre_completo: person.nombre_completo,
                    email: person.email,
                    id_rol_fk: person.id_rol_fk ? person.id_rol_fk.toString() : "",
                    telefono: person.telefono || "",
                });
            } catch (error) {
                console.error("Error fetching roles for personnel edit dialog:", error);
                toast({ title: "Error", description: "No se pudieron cargar los roles disponibles.", variant: "destructive" });
            }
        }
    }
    fetchRolesAndSetDefaults();
  }, [person, open, form, toast]);

  async function onSubmit(values: EditPersonnelFormValues) {
    setIsSubmitting(true);
    try {
      const selectedRole = availableRoles.find(r => r.id_rol.toString() === values.id_rol_fk);
      if (!selectedRole) {
          toast({ title: "Error", description: "Rol seleccionado no válido.", variant: "destructive" });
          setIsSubmitting(false);
          return;
      }
      // Verificar si se intenta cambiar el rol del usuario actual si es el único administrador
      if (currentUser?.id === person.id_usuario && currentUser.role === 'admin' && selectedRole.nombre_rol !== 'Administrador') {
        // Podríamos añadir una verificación más compleja para ver si hay otros admins.
        // Por ahora, si es el admin actual y el rol seleccionado NO es 'Administrador', lo prevenimos.
        const admins = (await getAllUsers()).filter(u => u.nombre_rol === 'Administrador');
        if (admins.length <= 1 && admins[0].id_usuario === currentUser.id) {
             toast({ title: "Acción no permitida", description: "No puedes cambiar tu propio rol si eres el único administrador.", variant: "destructive" });
             setIsSubmitting(false);
             return;
        }
      }


      const updateData: UserUpdateInput = {
        nombre_completo: values.nombre_completo,
        email: values.email,
        id_rol_fk: parseInt(values.id_rol_fk, 10),
        telefono: values.telefono || null,
        // avatar_seed se actualiza automáticamente en el backend si el nombre cambia y no se provee explícitamente
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
                        value={field.value}
                        disabled={(currentUser?.id === person.id_usuario && person.nombre_rol === 'Administrador')}
                    >
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Seleccione un rol" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableRoles.length === 0 && <SelectItem value="" disabled>Cargando roles...</SelectItem>}
                          {availableRoles.map(role => (
                            <SelectItem key={role.id_rol} value={role.id_rol.toString()} disabled={role.es_rol_sistema && role.id_rol !== person.id_rol_fk}>
                              {role.nombre_rol} {role.es_rol_sistema ? "(Sistema)" : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                    </Select>
                     {currentUser?.id === person.id_usuario && person.nombre_rol === 'Administrador' && (
                        <p className="text-xs text-muted-foreground pt-1">No puedes cambiar tu propio rol de Administrador.</p>
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
              <Button type="submit" disabled={isSubmitting || availableRoles.length === 0}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <><Edit className="mr-2 h-4 w-4" /> Actualizar Datos</>}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
