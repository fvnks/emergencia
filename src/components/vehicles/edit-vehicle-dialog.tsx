
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
import { updateVehicle } from "@/services/vehicleService";
import type { Vehicle, VehicleUpdateInput, VehicleStatus, VehicleType } from "@/types/vehicleTypes";
import { ALL_VEHICLE_STATUSES, ALL_VEHICLE_TYPES } from "@/types/vehicleTypes";
import { Loader2, Edit } from "lucide-react";

const editVehicleFormSchema = z.object({
  identificador_interno: z.string().nullable().optional(),
  marca: z.string().min(1, "La marca es requerida."),
  modelo: z.string().min(1, "El modelo es requerido."),
  patente: z.string().nullable().optional(),
  tipo_vehiculo: z.enum(ALL_VEHICLE_TYPES as [VehicleType, ...VehicleType[]]).nullable().optional(),
  estado_vehiculo: z.enum(ALL_VEHICLE_STATUSES as [VehicleStatus, ...VehicleStatus[]], { required_error: "Debe seleccionar un estado." }),
  ano_fabricacion: z.coerce.number().nullable().optional(),
  fecha_adquisicion: z.string().nullable().optional().refine(val => !val || val === "" || /^\d{4}-\d{2}-\d{2}$/.test(val), { message: "Formato de fecha inválido (AAAA-MM-DD)." }),
  proxima_mantencion_programada: z.string().nullable().optional().refine(val => !val || val === "" || /^\d{4}-\d{2}-\d{2}$/.test(val), { message: "Formato de fecha inválido (AAAA-MM-DD)." }),
  vencimiento_documentacion: z.string().nullable().optional().refine(val => !val || val === "" || /^\d{4}-\d{2}-\d{2}$/.test(val), { message: "Formato de fecha inválido (AAAA-MM-DD)." }),
  url_imagen: z.string().url("URL de imagen inválida").nullable().optional(),
  ai_hint_imagen: z.string().max(50, "Máximo 50 caracteres para pista AI").nullable().optional(),
  notas: z.string().nullable().optional(),
});

type EditVehicleFormValues = z.infer<typeof editVehicleFormSchema>;

interface EditVehicleDialogProps {
  vehicle: Vehicle | null;
  onVehicleUpdated: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditVehicleDialog({ vehicle, onVehicleUpdated, open, onOpenChange }: EditVehicleDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<EditVehicleFormValues>({
    resolver: zodResolver(editVehicleFormSchema),
  });

  useEffect(() => {
    if (vehicle && open) {
      form.reset({
        identificador_interno: vehicle.identificador_interno || "",
        marca: vehicle.marca,
        modelo: vehicle.modelo,
        patente: vehicle.patente || "",
        tipo_vehiculo: vehicle.tipo_vehiculo || null,
        estado_vehiculo: vehicle.estado_vehiculo,
        ano_fabricacion: vehicle.ano_fabricacion || undefined,
        fecha_adquisicion: vehicle.fecha_adquisicion || "",
        proxima_mantencion_programada: vehicle.proxima_mantencion_programada || "",
        vencimiento_documentacion: vehicle.vencimiento_documentacion || "",
        url_imagen: vehicle.url_imagen || "",
        ai_hint_imagen: vehicle.ai_hint_imagen || "",
        notas: vehicle.notas || "",
      });
    }
  }, [vehicle, open, form]);

  async function onSubmit(values: EditVehicleFormValues) {
    if (!vehicle) return;
    setIsSubmitting(true);
    try {
      const updateData: VehicleUpdateInput = {
        ...values,
        ano_fabricacion: values.ano_fabricacion || null,
        fecha_adquisicion: values.fecha_adquisicion || null,
        proxima_mantencion_programada: values.proxima_mantencion_programada || null,
        vencimiento_documentacion: values.vencimiento_documentacion || null,
        url_imagen: values.url_imagen || null,
        ai_hint_imagen: values.ai_hint_imagen || null,
      };
      await updateVehicle(vehicle.id_vehiculo, updateData);
      toast({
        title: "Vehículo Actualizado",
        description: `El vehículo ${values.marca} ${values.modelo} ha sido actualizado.`,
      });
      onVehicleUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating vehicle:", error);
      toast({
        title: "Error al Actualizar Vehículo",
        description: error instanceof Error ? error.message : "No se pudo actualizar el vehículo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!vehicle) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[750px]">
        <DialogHeader>
          <DialogTitle>Editar Vehículo: {vehicle.marca} {vehicle.modelo}</DialogTitle>
          <DialogDescription>Modifique los campos para actualizar el vehículo.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2 max-h-[75vh] overflow-y-auto pr-2">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="marca" render={({ field }) => (
                <FormItem><FormLabel>Marca</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="modelo" render={({ field }) => (
                <FormItem><FormLabel>Modelo</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField control={form.control} name="identificador_interno" render={({ field }) => (
                <FormItem><FormLabel>ID Interno</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="patente" render={({ field }) => (
                <FormItem><FormLabel>Patente</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="ano_fabricacion" render={({ field }) => (
                <FormItem><FormLabel>Año Fabricación</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? null : Number(e.target.value))} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="tipo_vehiculo" render={({ field }) => (
                    <FormItem><FormLabel>Tipo de Vehículo</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Seleccione un tipo" /></SelectTrigger></FormControl>
                        <SelectContent>
                            <SelectItem value="">N/A</SelectItem>
                            {ALL_VEHICLE_TYPES.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                        </SelectContent>
                    </Select><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="estado_vehiculo" render={({ field }) => (
                    <FormItem><FormLabel>Estado</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Seleccione un estado" /></SelectTrigger></FormControl>
                        <SelectContent>{ALL_VEHICLE_STATUSES.map(status => <SelectItem key={status} value={status}>{status}</SelectItem>)}</SelectContent>
                    </Select><FormMessage /></FormItem>
                )} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField control={form.control} name="fecha_adquisicion" render={({ field }) => (
                <FormItem><FormLabel>Fecha Adquisición</FormLabel><FormControl><Input type="date" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="proxima_mantencion_programada" render={({ field }) => (
                <FormItem><FormLabel>Próx. Mantención</FormLabel><FormControl><Input type="date" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="vencimiento_documentacion" render={({ field }) => (
                <FormItem><FormLabel>Venc. Documentos</FormLabel><FormControl><Input type="date" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="url_imagen" render={({ field }) => (
                    <FormItem><FormLabel>URL Imagen</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl>
                    <FormDescription>Dejar vacío para placeholder automático.</FormDescription><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="ai_hint_imagen" render={({ field }) => (
                    <FormItem><FormLabel>Pista AI Imagen</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl>
                    <FormDescription>1-2 palabras para placeholder.</FormDescription><FormMessage /></FormItem>
                )} />
            </div>
            <FormField control={form.control} name="notas" render={({ field }) => (
              <FormItem><FormLabel>Notas</FormLabel><FormControl><Textarea {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
            )} />
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancelar</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <><Edit className="mr-2 h-4 w-4" /> Actualizar Vehículo</>}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
