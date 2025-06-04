
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
import { createTask, type TaskCreateInput, type TaskStatus } from "@/services/taskService";
import type { User } from "@/services/userService";
import { useAuth } from "@/contexts/auth-context";
import { Loader2, PlusCircle } from "lucide-react";

const ALL_TASK_STATUSES: TaskStatus[] = ["Pendiente", "Programada", "En Proceso", "Completada", "Atrasada"];
const UNASSIGNED_VALUE = "__UNASSIGNED_USER__";

const addTaskFormSchema = z.object({
  descripcion_tarea: z.string().min(3, { message: "La descripción debe tener al menos 3 caracteres." }),
  id_usuario_asignado: z.string().nullable().optional(), 
  fecha_vencimiento: z.preprocess(
    (val) => (val === "" ? null : val), 
    z.string().refine(val => val === null || /^\d{4}-\d{2}-\d{2}$/.test(val), {
      message: "Formato de fecha inválido. Use AAAA-MM-DD o déjelo vacío.",
    }).nullable().optional()
  ),
  estado_tarea: z.enum(ALL_TASK_STATUSES as [TaskStatus, ...TaskStatus[]], {
    required_error: "Debe seleccionar un estado.",
  }),
});

type AddTaskFormValues = z.infer<typeof addTaskFormSchema>;

interface AddTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskAdded: () => void;
  users: User[]; 
}

export function AddTaskDialog({ open, onOpenChange, onTaskAdded, users }: AddTaskDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user: currentUser } = useAuth();

  const form = useForm<AddTaskFormValues>({
    resolver: zodResolver(addTaskFormSchema),
    defaultValues: {
      descripcion_tarea: "",
      id_usuario_asignado: UNASSIGNED_VALUE, 
      fecha_vencimiento: null,
      estado_tarea: "Pendiente",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        descripcion_tarea: "",
        id_usuario_asignado: UNASSIGNED_VALUE,
        fecha_vencimiento: null, 
        estado_tarea: "Pendiente",
      });
    }
  }, [open, form]);

  async function onSubmit(values: AddTaskFormValues) {
    if (!currentUser) {
      toast({ title: "Error", description: "Debe estar autenticado para crear tareas.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      const taskData: TaskCreateInput = {
        descripcion_tarea: values.descripcion_tarea,
        id_usuario_asignado: values.id_usuario_asignado === UNASSIGNED_VALUE 
            ? null 
            : (values.id_usuario_asignado ? parseInt(values.id_usuario_asignado, 10) : null),
        fecha_vencimiento: values.fecha_vencimiento || null,
        estado_tarea: values.estado_tarea as TaskStatus,
      };
      await createTask(taskData, currentUser.id);
      toast({
        title: "Tarea Creada",
        description: "La nueva tarea ha sido creada exitosamente.",
      });
      onTaskAdded();
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating task:", error);
      toast({
        title: "Error al Crear Tarea",
        description: error instanceof Error ? error.message : "No se pudo crear la tarea.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Crear Nueva Tarea</DialogTitle>
          <DialogDescription>
            Complete los detalles de la nueva tarea.
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
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value || UNASSIGNED_VALUE} 
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar usuario" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={UNASSIGNED_VALUE}>Sin Asignar</SelectItem>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar estado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ALL_TASK_STATUSES.map(status => (
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
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                Crear Tarea
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
