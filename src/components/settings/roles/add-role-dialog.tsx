
"use client";

import { useState, useEffect } from "react";
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
import { Loader2, PlusCircle } from "lucide-react";
import type { AvailablePermission, Role } from "@/app/(app)/settings/roles-permissions/page";

const addRoleFormSchema = z.object({
  name: z.string().min(3, { message: "El nombre del rol debe tener al menos 3 caracteres." }),
  description: z.string().min(5, { message: "La descripción debe tener al menos 5 caracteres." }),
  selectedPermissions: z.array(z.string()).refine(value => value.length > 0, {
    message: "Debe seleccionar al menos un permiso.",
  }),
});

type AddRoleFormValues = z.infer<typeof addRoleFormSchema>;

interface AddRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRoleAdded: (newRole: Omit<Role, 'id' | 'icon' | 'isSystemRole'> & { selectedPermissions: string[] }) => void;
  availablePermissions: AvailablePermission[];
}

export function AddRoleDialog({ open, onOpenChange, onRoleAdded, availablePermissions }: AddRoleDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

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
      form.reset({
        name: "",
        description: "",
        selectedPermissions: [],
      });
    }
  }, [open, form]);

  function onSubmit(values: AddRoleFormValues) {
    setIsSubmitting(true);
    // Aquí, en una implementación real, llamarías a un servicio de backend.
    // Por ahora, solo pasamos los datos a la página principal para simulación.
    setTimeout(() => { // Simular delay de red
      onRoleAdded(values);
      toast({
        title: "Rol Agregado (Simulado)",
        description: `El rol "${values.name}" ha sido agregado a la vista actual.`,
      });
      setIsSubmitting(false);
      onOpenChange(false);
    }, 500);
  }

  const groupedPermissions = useMemo(() => {
    return availablePermissions.reduce((acc, perm) => {
      const module = perm.module || "General";
      if (!acc[module]) {
        acc[module] = [];
      }
      acc[module].push(perm);
      return acc;
    }, {} as Record<string, AvailablePermission[]>);
  }, [availablePermissions]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Agregar Nuevo Rol</DialogTitle>
          <DialogDescription>
            Defina un nuevo rol y seleccione los permisos que tendrá.
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
                    <Input placeholder="Ej: Jefe de Bodega" {...field} />
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
                    <Textarea placeholder="Describe brevemente las responsabilidades de este rol..." {...field} />
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
                    {Object.entries(groupedPermissions).map(([moduleName, permissionsInModule]) => (
                      <div key={moduleName} className="mb-3">
                        <h4 className="font-medium text-sm text-muted-foreground mb-1.5">{moduleName}</h4>
                        {permissionsInModule.map((permission) => (
                          <FormField
                            key={permission.id}
                            control={form.control}
                            name="selectedPermissions"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={permission.id}
                                  className="flex flex-row items-center space-x-3 space-y-0 py-1"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(permission.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, permission.id])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== permission.id
                                              )
                                            );
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal">
                                    {permission.label}
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
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                Agregar Rol
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
