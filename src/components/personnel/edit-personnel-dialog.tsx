
"use client";

import type { User } from "@/services/userService";
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
import { updateUserProfile, UserUpdateInput, UserRole } from "@/services/userService";
import { Loader2, Edit } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

const editFormSchema = z.object({
  nombre_completo: z.string().min(3, { message: "El nombre debe tener al menos 3 caracteres." }),
  email: z.string().email({ message: "Correo electrónico inválido." }),
  rol: z.enum(["admin", "usuario"], { required_error: "Debe seleccionar un rol." }),
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
  const { toast } = useToast();
  const { user: currentUser, setUser: setCurrentUser } = useAuth(); // For updating current user info if they edit themselves

  const form = useForm<EditPersonnelFormValues>({
    resolver: zodResolver(editFormSchema),
    defaultValues: {
      nombre_completo: "",
      email: "",
      rol: "usuario",
      telefono: "",
    },
  });

  useEffect(() => {
    if (person && open) {
      form.reset({
        nombre_completo: person.nombre_completo,
        email: person.email,
        rol: person.rol,
        telefono: person.telefono || "",
      });
    }
  }, [person, open, form]);

  async function onSubmit(values: EditPersonnelFormValues) {
    setIsSubmitting(true);
    try {
      const updateData: UserUpdateInput = {
        nombre_completo: values.nombre_completo,
        email: values.email,
        rol: values.rol as UserRole,
        telefono: values.telefono || null,
      };
      
      const updatedUser = await updateUserProfile(person.id_usuario, updateData);
      
      toast({
        title: "Personal Actualizado",
        description: `Los datos de ${values.nombre_completo} han sido actualizados exitosamente.`,
      });

      if (updatedUser && currentUser && currentUser.id === updatedUser.id_usuario) {
         // Update user in AuthContext if they edited themselves
        const authUser = {
            id: updatedUser.id_usuario,
            name: updatedUser.nombre_completo,
            email: updatedUser.email,
            role: updatedUser.rol,
            avatarSeed: updatedUser.avatar_seed
        };
        setCurrentUser(authUser); // This would require setUser in AuthContext, or a dedicated updateUser function
        localStorage.setItem('brigadeUser', JSON.stringify(authUser));
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
      if (isSubmitting && !isOpen) return; // Prevent closing while submitting
      onOpenChange(isOpen);
      if (!isOpen) form.reset(); // Reset form if dialog is closed
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
                name="rol"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Rol</FormLabel>
                    <Select 
                        onValueChange={field.onChange} 
                        value={field.value} 
                        disabled={currentUser?.id === person.id_usuario && person.rol === 'admin'} // Admin cannot demote self
                    >
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Seleccione un rol" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        <SelectItem value="usuario">Usuario</SelectItem>
                        <SelectItem value="admin">Administrador</SelectItem>
                        </SelectContent>
                    </Select>
                    {currentUser?.id === person.id_usuario && person.rol === 'admin' && (
                        <p className="text-xs text-muted-foreground pt-1">No puedes cambiar tu propio rol de administrador.</p>
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
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <><Edit className="mr-2 h-4 w-4" /> Actualizar Datos</>}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
