
"use client";

import type { MaintenanceTask, MaintenanceTaskUpdateInput, MaintenanceItemType, MaintenanceStatus } from "@/types/maintenanceTypes";
import { ALL_MAINTENANCE_ITEM_TYPES, ALL_MAINTENANCE_STATUSES } from "@/types/maintenanceTypes";
import type { User } from "@/services/userService";
import { useEffect, useState } from "react";
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
import { updateMaintenanceTask } from "@/services/maintenanceService";
import { Loader2, Edit } from "lucide-react";

const NO_USER_ASSIGNED_VALUE = "__NO_USER_ASSIGNED__";

const editMaintenanceFormSchema = z.object({
  nombre_item_mantenimiento: z.string().min(1, "El nombre del ítem es requerido."),
  tipo_item: z.enum(ALL_MAINTENANCE_ITEM_TYPES as [MaintenanceItemType, ...MaintenanceItemType[]]),
  descripcion_mantencion: z.string().optional().nullable(),
  fecha_programada: z.string().nullable().optional().refine(val => !val || val === "" || /^\d{4}-\d{2}-\d{2}$/.test(val), { message: "Formato de fecha inválido (AAAA-MM-DD)." }),
  id_usuario_responsable: z.string().nullable().optional(),
  estado_mantencion: z.enum(ALL_MAINTENANCE_STATUSES as [MaintenanceStatus, ...MaintenanceStatus[]]),
  fecha_ultima_realizada: z.string().nullable().optional().refine(val => !val || val === "" || /^\d{4}-\d{2}-\d{2}$/.test(val), { message: "Formato de fecha inválido (AAAA-MM-DD)." }),
  fecha_completada: z.string().nullable().optional().refine(val => !val || val === "" || /^\d{4}-\d{2}-\d{2}$/.test(val), { message: "Formato de fecha inválido (AAAA-MM-DD)." }),
  notas_mantencion: z.string().optional().nullable(),
});

type EditMaintenanceFormValues = z.infer<typeof editMaintenanceFormSchema>;

interface EditMaintenanceDialogProps {
  task: MaintenanceTask | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskUpdated: () => void;
  users: User[];
}

export function EditMaintenanceDialog({ task, open, onOpenChange, onTaskUpdated, users }: EditMaintenanceDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<EditMaintenanceFormValues>({
    resolver: zodResolver(editMaintenanceFormSchema),
  });

  useEffect(() => {
    if (task && open) {
      form.reset({
        nombre_item_mantenimiento: task.nombre_item_mantenimiento,
        tipo_item: task.tipo_item,
        descripcion_mantencion: task.descripcion_mantencion || "",
        fecha_programada: task.fecha_programada || "",
        id_usuario_responsable: task.id_usuario_responsable ? task.id_usuario_responsable.toString() : NO_USER_ASSIGNED_VALUE,
        estado_mantencion: task.estado_mantencion,
        fecha_ultima_realizada: task.fecha_ultima_realizada || "",
        fecha_completada: task.fecha_completada || "",
        notas_mantencion: task.notas_mantencion || "",
      });
    }
  }, [task, open, form]);

  async function onSubmit(values: EditMaintenanceFormValues) {
    if (!task) return;
    setIsSubmitting(true);
    try {
      const updateData: MaintenanceTaskUpdateInput = {
        ...values,
        fecha_programada: values.fecha_programada || null,
        fecha_ultima_realizada: values.fecha_ultima_realizada || null,
        fecha_completada: values.fecha_completada || null,
        id_usuario_responsable: values.id_usuario_responsable === NO_USER_ASSIGNED_VALUE ? null : parseInt(values.id_usuario_responsable as string, 10),
        descripcion_mantencion: values.descripcion_mantencion || null,
        notas_mantencion: values.notas_mantencion || null,
      };
      await updateMaintenanceTask(task.id_mantencion, updateData);
      toast({
        title: "Tarea de Mantención Actualizada",
        description: `La tarea para ${values.nombre_item_mantenimiento} ha sido actualizada.`,
      });
      onTaskUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating maintenance task:", error);
      toast({
        title: "Error al Actualizar Tarea",
        description: error instanceof Error ? error.message : "No se pudo actualizar la tarea.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!task) return null;

  const isCompletedOrCancelled = task.estado_mantencion === 'Completada' || task.estado_mantencion === 'Cancelada';


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Editar Mantención: {task.nombre_item_mantenimiento}</DialogTitle>
          <DialogDescription>Modifique los campos para actualizar la tarea de mantención.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2 max-h-[75vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="nombre_item_mantenimiento" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre/ID del Ítem</FormLabel>
                  <FormControl><Input {...field} disabled={isCompletedOrCancelled} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="tipo_item" render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Ítem</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={isCompletedOrCancelled}>
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
                <FormControl><Textarea {...field} value={field.value ?? ''} disabled={isCompletedOrCancelled} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="fecha_programada" render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha Programada/Vencimiento</FormLabel>
                  <FormControl><Input type="date" {...field} value={field.value ?? ''} disabled={isCompletedOrCancelled} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="estado_mantencion" render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado Actual</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={isCompletedOrCancelled}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Seleccione un estado" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {ALL_MAINTENANCE_STATUSES.filter(s => s !== 'Atrasada').map(status => <SelectItem key={status} value={status}>{status}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormDescription>El estado 'Atrasada' se gestiona automáticamente. Si la tarea ya está 'Completada' o 'Cancelada', la mayoría de los campos no son editables.</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <FormField control={form.control} name="id_usuario_responsable" render={({ field }) => (
                <FormItem>
                  <FormLabel>Responsable (Opcional)</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value || NO_USER_ASSIGNED_VALUE}
                    disabled={isCompletedOrCancelled}
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
                  <FormControl><Input type="date" {...field} value={field.value ?? ''} disabled={isCompletedOrCancelled} /></FormControl>
                  <FormDescription>Si aplica, fecha de la última mantención similar.</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
             <FormField control={form.control} name="fecha_completada" render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha de Completitud (Si aplica)</FormLabel>
                  <FormControl><Input type="date" {...field} value={field.value ?? ''} disabled={form.getValues('estado_mantencion') !== 'Completada'} /></FormControl>
                   <FormDescription>Solo editable si el estado es 'Completada'.</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
            <FormField control={form.control} name="notas_mantencion" render={({ field }) => (
              <FormItem>
                <FormLabel>Notas / Registro de Tarea Realizada (Opcional)</FormLabel>
                <FormControl><Textarea placeholder="Observaciones, detalles de la mantención, repuestos usados..." {...field} value={field.value ?? ''} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancelar</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <><Edit className="mr-2 h-5 w-5" /> Actualizar Mantención</>}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
