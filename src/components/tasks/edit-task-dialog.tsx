
"use client";

import type { Task, TaskStatus, TaskUpdateInput } from "@/services/taskService";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { updateTask } from "@/services/taskService";
import { Loader2, Edit } from "lucide-react";

const taskStatuses: TaskStatus[] = ["Pendiente", "Programada", "En Proceso", "Atrasada", "Completada"];

const editTaskFormSchema = z.object({
  descripcion_tarea: z.string().min(3, { message: "La descripción debe tener al menos 3 caracteres." }),
  id_usuario_asignado: z.string().nullable().optional(), // Viene como string del select
  fecha_vencimiento: z.preprocess(
    (val) => (val === "" ? null : val),
     z.string().refine(val => val === null || /^\d{4}-\d{2}-\d{2}$/.test(val), {
      message: "Formato de fecha inválido. Use AAAA-MM-DD o déjelo vacío.",
    }).nullable().optional()
  ),
  estado_tarea: z.enum(["Pendiente", "Programada", "En Proceso", "Atrasada", "Completada"], {
    required_error: "Debe seleccionar un estado.",
  }),
});

type EditTaskFormValues = z.infer<typeof editTaskFormSchema>;

interface EditTaskDialogProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskUpdated: () => void;
  users: User[];
}

export function EditTaskDialog({ task, open, onOpenChange, onTaskUpdated, users }: EditTaskDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<EditTaskFormValues>({
    resolver: zodResolver(editTaskFormSchema),
    defaultValues: {
      descripcion_tarea: "",
      id_usuario_asignado: null,
      fecha_vencimiento: null,
      estado_tarea: "Pendiente",
    },
  });

  useEffect(() => {
    if (task && open) {
      form.reset({
        descripcion_tarea: task.descripcion_tarea,
        id_usuario_asignado: task.id_usuario_asignado ? task.id_usuario_asignado.toString() : null,
        fecha_vencimiento: task.fecha_vencimiento ? task.fecha_vencimiento.split('T')[0] : null, // Formato YYYY-MM-DD para input date
        estado_tarea: task.estado_tarea,
      });
    }
  }, [task, open, form]);

  async function onSubmit(values: EditTaskFormValues) {
    if (!task) return;
    setIsSubmitting(true);
    try {
      const updateData: TaskUpdateInput = {
        descripcion_tarea: values.descripcion_tarea,
        id_usuario_asignado: values.id_usuario_asignado ? parseInt(values.id_usuario_asignado, 10) : null,
        fecha_vencimiento: values.fecha_vencimiento || null,
        estado_tarea: values.estado_tarea as TaskStatus,
      };
      await updateTask(task.id_tarea, updateData);
      toast({
        title: "Tarea Actualizada",
        description: "La tarea ha sido actualizada exitosamente.",
      });
      onTaskUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating task:", error);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Editar Tarea: T-{task.id_tarea.toString().padStart(3, '0')}</DialogTitle>
          <DialogDescription>
            Modifique los detalles de la tarea.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2 max-h-[70vh] overflow-y-auto pr-2">
            <FormField
              control={form.control}
              name="descripcion_tarea"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción de la Tarea</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Ej: Revisar extintores del ala norte" {...field} rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="id_usuario_asignado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Asignar A (Opcional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar usuario" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Sin Asignar</SelectItem>
                        {users.map((user) => (
                          <SelectItem key={user.id_usuario} value={user.id_usuario.toString()}>
                            {user.nombre_completo}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="estado_tarea"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar estado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {taskStatuses.map(status => (
                          <SelectItem key={status} value={status}>{status}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="fecha_vencimiento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha de Vencimiento (Opcional)</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormDescription>Formato: AAAA-MM-DD</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Edit className="mr-2 h-4 w-4" />}
                Actualizar Tarea
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
