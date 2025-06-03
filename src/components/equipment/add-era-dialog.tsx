
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { createEraEquipment } from "@/services/eraService";
import type { EraEquipmentCreateInput, EraEquipmentStatus } from "./era-types";
import { ALL_ERA_STATUSES } from "./era-types";
import { Loader2, PlusCircle } from "lucide-react";
import type { User } from "@/services/userService"; // Para el selector de asignación (opcional al crear)

const addEraFormSchema = z.object({
  codigo_era: z.string().min(1, "El código del ERA es requerido."),
  descripcion: z.string().optional(),
  marca: z.string().optional(),
  modelo: z.string().optional(),
  numero_serie: z.string().optional(),
  fecha_fabricacion: z.string().optional().refine(val => !val || /^\d{4}-\d{2}-\d{2}$/.test(val), { message: "Formato de fecha inválido (AAAA-MM-DD)." }),
  fecha_adquisicion: z.string().optional().refine(val => !val || /^\d{4}-\d{2}-\d{2}$/.test(val), { message: "Formato de fecha inválido (AAAA-MM-DD)." }),
  fecha_ultima_mantencion: z.string().optional().refine(val => !val || /^\d{4}-\d{2}-\d{2}$/.test(val), { message: "Formato de fecha inválido (AAAA-MM-DD)." }),
  fecha_proxima_inspeccion: z.string().optional().refine(val => !val || /^\d{4}-\d{2}-\d{2}$/.test(val), { message: "Formato de fecha inválido (AAAA-MM-DD)." }),
  estado_era: z.enum(ALL_ERA_STATUSES as [EraEquipmentStatus, ...EraEquipmentStatus[]], { required_error: "Debe seleccionar un estado." }),
  id_usuario_asignado: z.string().nullable().optional(), // string for form, will be parsed
  notas: z.string().optional(),
});

type AddEraFormValues = z.infer<typeof addEraFormSchema>;

interface AddEraDialogProps {
  onEraAdded: () => void;
  users: User[]; // Para el selector de asignación
}

export function AddEraDialog({ onEraAdded, users }: AddEraDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<AddEraFormValues>({
    resolver: zodResolver(addEraFormSchema),
    defaultValues: {
      codigo_era: "",
      descripcion: "",
      marca: "",
      modelo: "",
      numero_serie: "",
      fecha_fabricacion: "",
      fecha_adquisicion: "",
      fecha_ultima_mantencion: "",
      fecha_proxima_inspeccion: "",
      estado_era: "Disponible",
      id_usuario_asignado: null,
      notas: "",
    },
  });

  async function onSubmit(values: AddEraFormValues) {
    setIsSubmitting(true);
    try {
      const createData: EraEquipmentCreateInput = {
        ...values,
        fecha_fabricacion: values.fecha_fabricacion || undefined,
        fecha_adquisicion: values.fecha_adquisicion || undefined,
        fecha_ultima_mantencion: values.fecha_ultima_mantencion || undefined,
        fecha_proxima_inspeccion: values.fecha_proxima_inspeccion || undefined,
        id_usuario_asignado: values.id_usuario_asignado ? parseInt(values.id_usuario_asignado, 10) : null,
      };
      await createEraEquipment(createData);
      toast({
        title: "Equipo ERA Agregado",
        description: `El equipo ERA ${values.codigo_era} ha sido agregado.`,
      });
      onEraAdded();
      form.reset();
      setIsOpen(false);
    } catch (error) {
      console.error("Error creating ERA equipment:", error);
      toast({
        title: "Error al Agregar ERA",
        description: error instanceof Error ? error.message : "No se pudo agregar el equipo ERA.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-5 w-5" /> Agregar Nuevo ERA
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Agregar Nuevo Equipo ERA</DialogTitle>
          <DialogDescription>
            Complete los campos para registrar un nuevo equipo de respiración autónoma.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2 max-h-[75vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="codigo_era" render={({ field }) => (
                <FormItem>
                  <FormLabel>Código ERA</FormLabel>
                  <FormControl><Input placeholder="Ej: ERA-001" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="estado_era" render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Seleccione un estado" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {ALL_ERA_STATUSES.map(status => <SelectItem key={status} value={status}>{status}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField control={form.control} name="marca" render={({ field }) => (
                <FormItem>
                  <FormLabel>Marca (Opcional)</FormLabel>
                  <FormControl><Input placeholder="Ej: MSA, Scott" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="modelo" render={({ field }) => (
                <FormItem>
                  <FormLabel>Modelo (Opcional)</FormLabel>
                  <FormControl><Input placeholder="Ej: G1, Air-Pak" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="numero_serie" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nº Serie (Opcional)</FormLabel>
                  <FormControl><Input placeholder="Ej: SN12345" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <FormField control={form.control} name="descripcion" render={({ field }) => (
              <FormItem>
                <FormLabel>Descripción (Opcional)</FormLabel>
                <FormControl><Textarea placeholder="Detalles adicionales del equipo..." {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <FormField control={form.control} name="fecha_fabricacion" render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha Fabricación</FormLabel>
                  <FormControl><Input type="date" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="fecha_adquisicion" render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha Adquisición</FormLabel>
                  <FormControl><Input type="date" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="fecha_ultima_mantencion" render={({ field }) => (
                <FormItem>
                  <FormLabel>Última Mantención</FormLabel>
                  <FormControl><Input type="date" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="fecha_proxima_inspeccion" render={({ field }) => (
                <FormItem>
                  <FormLabel>Próxima Inspección</FormLabel>
                  <FormControl><Input type="date" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
             <FormField control={form.control} name="id_usuario_asignado" render={({ field }) => (
                <FormItem>
                  <FormLabel>Asignar A (Opcional)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Sin asignar" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="">Sin asignar</SelectItem>
                      {users.map(user => <SelectItem key={user.id_usuario} value={user.id_usuario.toString()}>{user.nombre_completo}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormDescription>Si el estado es 'Operativo', puede asignarlo directamente.</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
            <FormField control={form.control} name="notas" render={({ field }) => (
              <FormItem>
                <FormLabel>Notas (Opcional)</FormLabel>
                <FormControl><Textarea placeholder="Observaciones sobre el equipo..." {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isSubmitting}>Cancelar</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Agregar Equipo ERA"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
