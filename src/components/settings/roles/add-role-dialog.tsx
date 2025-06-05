
"use client";

import { useState, useEffect, useMemo } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Loader2, PlusCircle, Edit } from "lucide-react";
import type { Permission, Role } from "@/services/roleService";

const addRoleFormSchema = z.object({
  name: z.string().min(3, { message: "El nombre del rol debe tener al menos 3 caracteres." }),
  description: z.string().min(5, { message: "La descripción debe tener al menos 5 caracteres." }),
  selectedPermissions: z.array(z.number()).refine(value => value.length >= 0, { // Allow zero permissions for flexibility
    message: "Debe seleccionar al menos un permiso.", // This message might not be shown if length >= 0 is fine.
  }),
});

type AddRoleFormValues = z.infer<typeof addRoleFormSchema>;

interface AddRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaveRole: (
    roleData: { name: string; description: string; selectedPermissions: number[] },
    existingRoleId?: number
  ) => void;
  availablePermissions: Permission[];
  existingRole?: Role | null; 
}

export function AddRoleDialog({ open, onOpenChange, onSaveRole, availablePermissions, existingRole }: AddRoleDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!existingRole;

  const form = useForm<AddRoleFormValues>({
    resolver: zodResolver(addRoleFormSchema),
    defaultValues: {
      name: "",
      description: "",
      selectedPermissions: [],
    },
  });

  useEffect(() => {
    if (open) {
      if (isEditMode && existingRole) {
        form.reset({
          name: existingRole.nombre_rol,
          description: existingRole.descripcion_rol || "",
          selectedPermissions: existingRole.permissions?.map(p => p.id_permiso) || [],
        });
      } else {
        form.reset({
          name: "",
          description: "",
          selectedPermissions: [],
        });
      }
    }
  }, [open, form, isEditMode, existingRole]);

  async function onSubmit(values: AddRoleFormValues) {
    setIsSubmitting(true);
    try {
      await onSaveRole(values, isEditMode ? existingRole?.id_rol : undefined);
      // Toast and close dialog are handled by parent component after successful save.
    } catch (error) {
      // Error handling also in parent
      console.error("Error in AddRoleDialog onSubmit (should be caught by parent):", error);
    } finally {
      setIsSubmitting(false); // Parent will close dialog if successful
    }
  }

  const groupedPermissions = useMemo(() => {
    return availablePermissions.reduce((acc, perm) => {
      const module = perm.modulo_permiso || "General";
      if (!acc[module]) {
        acc[module] = [];
      }
      acc[module].push(perm);
      return acc;
    }, {} as Record<string, Permission[]>);
  }, [availablePermissions]);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
        if (isSubmitting && !isOpen) return; // Prevent closing while submitting
        onOpenChange(isOpen);
    }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Editar Rol" : "Agregar Nuevo Rol"}</DialogTitle>
          <DialogDescription>
            {isEditMode ? `Modifique los detalles del rol "${existingRole?.nombre_rol}".` : "Defina un nuevo rol y seleccione los permisos que tendrá."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Rol</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Jefe de Bodega" {...field} disabled={isEditMode && existingRole?.es_rol_sistema} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción del Rol</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe brevemente las responsabilidades de este rol..." {...field} disabled={isEditMode && existingRole?.es_rol_sistema} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="selectedPermissions"
              render={() => (
                <FormItem>
                  <div className="mb-2">
                    <FormLabel className="text-base">Permisos</FormLabel>
                    <FormMessage />
                  </div>
                  <ScrollArea className="h-60 rounded-md border p-3">
                    {Object.keys(groupedPermissions).length === 0 && <p className="text-sm text-muted-foreground">No hay permisos disponibles para asignar.</p>}
                    {Object.entries(groupedPermissions).map(([moduleName, permissionsInModule]) => (
                      <div key={moduleName} className="mb-3">
                        <h4 className="font-medium text-sm text-muted-foreground mb-1.5">{moduleName}</h4>
                        {permissionsInModule.map((permission) => (
                          <FormField
                            key={permission.id_permiso}
                            control={form.control}
                            name="selectedPermissions"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={permission.id_permiso}
                                  className="flex flex-row items-center space-x-3 space-y-0 py-1"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(permission.id_permiso)}
                                      onCheckedChange={(checked) => {
                                        const currentValues = field.value || [];
                                        return checked
                                          ? field.onChange([...currentValues, permission.id_permiso])
                                          : field.onChange(
                                              currentValues.filter(
                                                (value) => value !== permission.id_permiso
                                              )
                                            );
                                      }}
                                      disabled={isEditMode && existingRole?.es_rol_sistema}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal">
                                    {permission.nombre_amigable_permiso} ({permission.clave_permiso})
                                  </FormLabel>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                      </div>
                    ))}
                  </ScrollArea>
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting || (isEditMode && existingRole?.es_rol_sistema)}>
                {isSubmitting 
                  ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                  : isEditMode 
                    ? <><Edit className="mr-2 h-4 w-4" /> Guardar Cambios</>
                    : <><PlusCircle className="mr-2 h-4 w-4" /> Agregar Rol</>
                }
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

    