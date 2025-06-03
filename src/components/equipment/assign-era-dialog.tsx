
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { assignEra } from "@/services/eraService";
import type { EraEquipment } from "./era-types";
import type { User } from "@/services/userService";
import { Loader2, UserCheck, UserX } from "lucide-react";

const assignEraFormSchema = z.object({
  id_usuario_asignado: z.string().nullable().optional(), // string for form, will be parsed or null
});

type AssignEraFormValues = z.infer<typeof assignEraFormSchema>;

interface AssignEraDialogProps {
  era: EraEquipment | null;
  users: User[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEraAssigned: () => void; // Callback to refresh data
}

export function AssignEraDialog({ era, users, open, onOpenChange, onEraAssigned }: AssignEraDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<AssignEraFormValues>({
    resolver: zodResolver(assignEraFormSchema),
    defaultValues: {
      id_usuario_asignado: null,
    },
  });

  useEffect(() => {
    if (era && open) {
      form.reset({
        id_usuario_asignado: era.id_usuario_asignado ? era.id_usuario_asignado.toString() : null,
      });
    }
  }, [era, open, form]);

  async function onSubmit(values: AssignEraFormValues) {
    if (!era) return;
    setIsSubmitting(true);

    const newUserId = values.id_usuario_asignado ? parseInt(values.id_usuario_asignado, 10) : null;

    try {
      await assignEra(era.id_era, newUserId);
      toast({
        title: `ERA ${newUserId ? 'Asignado' : 'Desasignado'}`,
        description: `El equipo ERA ${era.codigo_era} ha sido ${newUserId ? 'asignado' : 'desasignado'} correctamente.`,
      });
      onEraAssigned();
      onOpenChange(false);
    } catch (error) {
      console.error("Error assigning/unassigning ERA:", error);
      toast({
        title: "Error en la Operación",
        description: error instanceof Error ? error.message : "No se pudo completar la operación.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }
  
  const handleDesasignar = async () => {
    if (!era) return;
    setIsSubmitting(true);
     try {
      await assignEra(era.id_era, null); // Pasar null para desasignar
      toast({
        title: "ERA Desasignado",
        description: `El equipo ERA ${era.codigo_era} ha sido desasignado correctamente.`,
      });
      onEraAssigned();
      onOpenChange(false);
    } catch (error) {
      console.error("Error unassigning ERA:", error);
      toast({
        title: "Error al Desasignar",
        description: error instanceof Error ? error.message : "No se pudo desasignar el equipo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!era) return null;

  const canBeAssigned = era.estado_era === 'Disponible';
  const isAssigned = !!era.id_usuario_asignado;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isAssigned ? `Desasignar ERA: ${era.codigo_era}` : `Asignar ERA: ${era.codigo_era}`}
          </DialogTitle>
          <DialogDescription>
            {isAssigned 
              ? `Este ERA está actualmente asignado a ${era.nombre_usuario_asignado}.`
              : `Seleccione un usuario para asignar este ERA. Estado actual: ${era.estado_era}.`}
          </DialogDescription>
        </DialogHeader>
        {!isAssigned && !canBeAssigned && (
            <p className="text-sm text-destructive py-4">
                Este ERA no puede ser asignado porque su estado es '{era.estado_era}'. Debe estar 'Disponible'.
            </p>
        )}
        
        {isAssigned ? (
          <div className="py-4">
            <Button 
                onClick={handleDesasignar} 
                disabled={isSubmitting} 
                className="w-full"
                variant="destructive"
            >
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserX className="mr-2 h-4 w-4" />}
              Confirmar Desasignación
            </Button>
          </div>
        ) : canBeAssigned ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-2">
              <FormField
                control={form.control}
                name="id_usuario_asignado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Asignar A</FormLabel>
                    <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value || ""}
                        disabled={!canBeAssigned || isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione un usuario" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {users.map(user => (
                          <SelectItem key={user.id_usuario} value={user.id_usuario.toString()}>
                            {user.nombre_completo}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {!isAssigned && canBeAssigned && (
                       <FormDescription>El estado del ERA cambiará a 'Operativo' al asignar.</FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting || !form.watch('id_usuario_asignado')}>
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserCheck className="mr-2 h-4 w-4" />}
                  Asignar ERA
                </Button>
              </DialogFooter>
            </form>
          </Form>
        ) : null}

        {(isAssigned || !canBeAssigned) && (
            <DialogFooter className="pt-0">
                 <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting} className="w-full sm:w-auto">
                  Cerrar
                </Button>
            </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
