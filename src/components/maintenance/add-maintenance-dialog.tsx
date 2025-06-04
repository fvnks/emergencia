
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { createMaintenanceTask } from "@/services/maintenanceService";
import type { MaintenanceTaskCreateInput, MaintenanceItemType, MaintenanceStatus } from "@/types/maintenanceTypes";
import { ALL_MAINTENANCE_ITEM_TYPES, ALL_MAINTENANCE_STATUSES } from "@/types/maintenanceTypes";
import type { User } from "@/services/userService";
import { useAuth } from "@/contexts/auth-context";
import { Loader2, PlusCircle } from "lucide-react";

const NO_USER_ASSIGNED_VALUE = "__NO_USER_ASSIGNED__";

const addMaintenanceFormSchema = z.object({
  nombre_item_mantenimiento: z.string().min(1, "El nombre del ítem es requerido."),
  tipo_item: z.enum(ALL_MAINTENANCE_ITEM_TYPES as [MaintenanceItemType, ...MaintenanceItemType[]], { required_error: "Debe seleccionar un tipo de ítem." }),
  descripcion_mantencion: z.string().optional(),
  fecha_programada: z.string().nullable().optional().refine(val => !val || val === "" || /^\d{4}-\d{2}-\d{2}$/.test(val), { message: "Formato de fecha inválido (AAAA-MM-DD)." }),
  id_usuario_responsable: z.string().nullable().optional(),
  estado_mantencion: z.enum(ALL_MAINTENANCE_STATUSES as [MaintenanceStatus, ...MaintenanceStatus[]], { required_error: "Debe seleccionar un estado." }),
  fecha_ultima_realizada: z.string().nullable().optional().refine(val => !val || val === "" || /^\d{4}-\d{2}-\d{2}$/.test(val), { message: "Formato de fecha inválido (AAAA-MM-DD)." }),
  notas_mantencion: z.string().optional(),
});

type AddMaintenanceFormValues = z.infer<typeof addMaintenanceFormSchema>;

interface AddMaintenanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskAdded: () => void;
  users: User[];
}

export function AddMaintenanceDialog({ open, onOpenChange, onTaskAdded, users }: AddMaintenanceDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user: currentUser } = useAuth();

  const form = useForm<AddMaintenanceFormValues>({
    resolver: zodResolver(addMaintenanceFormSchema),
    defaultValues: {
      nombre_item_mantenimiento: "",
      tipo_item: "Otro",
      descripcion_mantencion: "",
      fecha_programada: "",
      id_usuario_responsable: NO_USER_ASSIGNED_VALUE,
      estado_mantencion: "Programada",
      fecha_ultima_realizada: "",
      notas_mantencion: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        nombre_item_mantenimiento: "",
        tipo_item: "Otro",
        descripcion_mantencion: "",
        fecha_programada: "",
        id_usuario_responsable: NO_USER_ASSIGNED_VALUE,
        estado_mantencion: "Programada",
        fecha_ultima_realizada: "",
        notas_mantencion: "",
      });
    }
  }, [open, form]);

  async function onSubmit(values: AddMaintenanceFormValues) {
    if (!currentUser) {
        toast({ title: "Error", description: "Usuario no autenticado.", variant: "destructive" });
        return;
    }
    setIsSubmitting(true);
    try {
      const createData: MaintenanceTaskCreateInput = {
        ...values,
        fecha_programada: values.fecha_programada || null,
        fecha_ultima_realizada: values.fecha_ultima_realizada || null,
        id_usuario_responsable: values.id_usuario_responsable === NO_USER_ASSIGNED_VALUE ? null : parseInt(values.id_usuario_responsable as string, 10),
      };
      await createMaintenanceTask(createData, currentUser.id);
      toast({
        title: "Tarea de Mantención Agregada",
        description: `La tarea para ${values.nombre_item_mantenimiento} ha sido agregada.`,
      });
      onTaskAdded();
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating maintenance task:", error);
      toast({
        title: "Error al Agregar Tarea",
        description: error instanceof Error ? error.message : "No se pudo agregar la tarea de mantención.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Programar Nueva Mantención</DialogTitle>
          <DialogDescription>
            Complete los campos para registrar una nueva tarea de mantención.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2 max-h-[75vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="nombre_item_mantenimiento" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre/ID del Ítem</FormLabel>
                  <FormControl><Input placeholder="Ej: ERA-001, Extintor Pasillo B" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="tipo_item" render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Ítem</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Seleccione un tipo" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {ALL_MAINTENANCE_ITEM_TYPES.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <FormField control={form.control} name="descripcion_mantencion" render={({ field }) => (
              <FormItem>
                <FormLabel>Descripción de la Mantención (Opcional)</FormLabel>
                <FormControl><Textarea placeholder="Ej: Revisión anual, cambio de manómetro, recarga..." {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="fecha_programada" render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha Programada/Vencimiento</FormLabel>
                  <FormControl><Input type="date" {...field} value={field.value ?? ''} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="estado_mantencion" render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado Actual</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Seleccione un estado" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {ALL_MAINTENANCE_STATUSES.filter(s => s !== 'Atrasada').map(status => <SelectItem key={status} value={status}>{status}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormDescription>El estado 'Atrasada' se gestiona automáticamente.</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <FormField control={form.control} name="id_usuario_responsable" render={({ field }) => (
                <FormItem>
                  <FormLabel>Asignar Responsable (Opcional)</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value || NO_USER_ASSIGNED_VALUE}
                  >
                    <FormControl><SelectTrigger><SelectValue placeholder="Sin asignar responsable" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value={NO_USER_ASSIGNED_VALUE}>Sin asignar</SelectItem>
                      {users.map(user => <SelectItem key={user.id_usuario} value={user.id_usuario.toString()}>{user.nombre_completo}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="fecha_ultima_realizada" render={({ field }) => (
                <FormItem>
                  <FormLabel>Última vez Realizada (Opcional)</FormLabel>
                  <FormControl><Input type="date" {...field} value={field.value ?? ''} /></FormControl>
                  <FormDescription>Si aplica, fecha de la última mantención similar.</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <FormField control={form.control} name="notas_mantencion" render={({ field }) => (
              <FormItem>
                <FormLabel>Notas Adicionales (Opcional)</FormLabel>
                <FormControl><Textarea placeholder="Observaciones, detalles específicos..." {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancelar</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <><PlusCircle className="mr-2 h-5 w-5" /> Programar Mantención</>}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
