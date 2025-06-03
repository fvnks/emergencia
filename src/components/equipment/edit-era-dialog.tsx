
"use client";

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
import { updateEraEquipment } from "@/services/eraService";
import type { EraEquipment, EraEquipmentUpdateInput, EraEquipmentStatus } from "./era-types";
import { ALL_ERA_STATUSES } from "./era-types";
import { Loader2, Edit } from "lucide-react";
import type { User } from "@/services/userService";

const editEraFormSchema = z.object({
  codigo_era: z.string().min(1, "El código del ERA es requerido."),
  descripcion: z.string().nullable().optional(),
  marca: z.string().nullable().optional(),
  modelo: z.string().nullable().optional(),
  numero_serie: z.string().nullable().optional(),
  fecha_fabricacion: z.string().nullable().optional().refine(val => !val || /^\d{4}-\d{2}-\d{2}$/.test(val), { message: "Formato de fecha inválido (AAAA-MM-DD)." }),
  fecha_adquisicion: z.string().nullable().optional().refine(val => !val || /^\d{4}-\d{2}-\d{2}$/.test(val), { message: "Formato de fecha inválido (AAAA-MM-DD)." }),
  fecha_ultima_mantencion: z.string().nullable().optional().refine(val => !val || /^\d{4}-\d{2}-\d{2}$/.test(val), { message: "Formato de fecha inválido (AAAA-MM-DD)." }),
  fecha_proxima_inspeccion: z.string().nullable().optional().refine(val => !val || /^\d{4}-\d{2}-\d{2}$/.test(val), { message: "Formato de fecha inválido (AAAA-MM-DD)." }),
  estado_era: z.enum(ALL_ERA_STATUSES as [EraEquipmentStatus, ...EraEquipmentStatus[]], { required_error: "Debe seleccionar un estado." }),
  id_usuario_asignado: z.string().nullable().optional(),
  notas: z.string().nullable().optional(),
});

type EditEraFormValues = z.infer<typeof editEraFormSchema>;

interface EditEraDialogProps {
  era: EraEquipment | null;
  onEraUpdated: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  users: User[];
}

export function EditEraDialog({ era, onEraUpdated, open, onOpenChange, users }: EditEraDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<EditEraFormValues>({
    resolver: zodResolver(editEraFormSchema),
  });

  useEffect(() => {
    if (era && open) {
      form.reset({
        codigo_era: era.codigo_era,
        descripcion: era.descripcion || "",
        marca: era.marca || "",
        modelo: era.modelo || "",
        numero_serie: era.numero_serie || "",
        fecha_fabricacion: era.fecha_fabricacion || "",
        fecha_adquisicion: era.fecha_adquisicion || "",
        fecha_ultima_mantencion: era.fecha_ultima_mantencion || "",
        fecha_proxima_inspeccion: era.fecha_proxima_inspeccion || "",
        estado_era: era.estado_era,
        id_usuario_asignado: era.id_usuario_asignado ? era.id_usuario_asignado.toString() : null,
        notas: era.notas || "",
      });
    }
  }, [era, open, form]);

  async function onSubmit(values: EditEraFormValues) {
    if (!era) return;
    setIsSubmitting(true);
    try {
      const updateData: EraEquipmentUpdateInput = {
        ...values,
        // Convert empty strings from form to null for optional fields
        descripcion: values.descripcion || null,
        marca: values.marca || null,
        modelo: values.modelo || null,
        numero_serie: values.numero_serie || null,
        fecha_fabricacion: values.fecha_fabricacion || null,
        fecha_adquisicion: values.fecha_adquisicion || null,
        fecha_ultima_mantencion: values.fecha_ultima_mantencion || null,
        fecha_proxima_inspeccion: values.fecha_proxima_inspeccion || null,
        id_usuario_asignado: values.id_usuario_asignado ? parseInt(values.id_usuario_asignado, 10) : null,
        notas: values.notas || null,
      };
      await updateEraEquipment(era.id_era, updateData);
      toast({
        title: "Equipo ERA Actualizado",
        description: `El equipo ERA ${values.codigo_era} ha sido actualizado.`,
      });
      onEraUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating ERA equipment:", error);
      toast({
        title: "Error al Actualizar ERA",
        description: error instanceof Error ? error.message : "No se pudo actualizar el equipo ERA.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!era) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Editar Equipo ERA: {era.codigo_era}</DialogTitle>
          <DialogDescription>Modifique los campos para actualizar el equipo.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2 max-h-[75vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="codigo_era" render={({ field }) => (
                <FormItem><FormLabel>Código ERA</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="estado_era" render={({ field }) => (
                <FormItem><FormLabel>Estado</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Seleccione un estado" /></SelectTrigger></FormControl>
                    <SelectContent>{ALL_ERA_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select><FormMessage />
                </FormItem>
              )} />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField control={form.control} name="marca" render={({ field }) => (
                <FormItem><FormLabel>Marca</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="modelo" render={({ field }) => (
                <FormItem><FormLabel>Modelo</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="numero_serie" render={({ field }) => (
                <FormItem><FormLabel>Nº Serie</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <FormField control={form.control} name="descripcion" render={({ field }) => (
              <FormItem><FormLabel>Descripción</FormLabel><FormControl><Textarea {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
            )} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <FormField control={form.control} name="fecha_fabricacion" render={({ field }) => (
                <FormItem><FormLabel>Fecha Fabricación</FormLabel><FormControl><Input type="date" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="fecha_adquisicion" render={({ field }) => (
                <FormItem><FormLabel>Fecha Adquisición</FormLabel><FormControl><Input type="date" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="fecha_ultima_mantencion" render={({ field }) => (
                <FormItem><FormLabel>Última Mantención</FormLabel><FormControl><Input type="date" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="fecha_proxima_inspeccion" render={({ field }) => (
                <FormItem><FormLabel>Próxima Inspección</FormLabel><FormControl><Input type="date" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <FormField control={form.control} name="id_usuario_asignado" render={({ field }) => (
              <FormItem>
                <FormLabel>Asignado A (Opcional)</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ""}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Sin asignar" /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="">Sin asignar</SelectItem>
                    {users.map(user => <SelectItem key={user.id_usuario} value={user.id_usuario.toString()}>{user.nombre_completo}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="notas" render={({ field }) => (
              <FormItem><FormLabel>Notas</FormLabel><FormControl><Textarea {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
            )} />
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancelar</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <><Edit className="mr-2 h-4 w-4" /> Actualizar ERA</>}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
