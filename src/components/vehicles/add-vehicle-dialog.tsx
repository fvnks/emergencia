
"use client";

import { useState, useEffect } from "react";
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
import { createVehicle } from "@/services/vehicleService";
import type { VehicleCreateInput, VehicleStatus, VehicleType } from "@/types/vehicleTypes";
import { ALL_VEHICLE_STATUSES, ALL_VEHICLE_TYPES } from "@/types/vehicleTypes";
import { Loader2, PlusCircle } from "lucide-react";

const NULL_VEHICLE_TYPE_VALUE = "__NULL_VEHICLE_TYPE__";

const addVehicleFormSchema = z.object({
  identificador_interno: z.string().optional(),
  marca: z.string().min(1, "La marca es requerida."),
  modelo: z.string().min(1, "El modelo es requerido."),
  patente: z.string().optional(),
  tipo_vehiculo: z.enum(ALL_VEHICLE_TYPES as [VehicleType, ...VehicleType[]]).nullable().optional(),
  estado_vehiculo: z.enum(ALL_VEHICLE_STATUSES as [VehicleStatus, ...VehicleStatus[]], { required_error: "Debe seleccionar un estado." }),
  ano_fabricacion: z.coerce.number().optional().nullable(),
  fecha_adquisicion: z.string().optional().nullable().refine(val => !val || val === "" || /^\d{4}-\d{2}-\d{2}$/.test(val), { message: "Formato de fecha inválido (AAAA-MM-DD)." }),
  proxima_mantencion_programada: z.string().optional().nullable().refine(val => !val || val === "" || /^\d{4}-\d{2}-\d{2}$/.test(val), { message: "Formato de fecha inválido (AAAA-MM-DD)." }),
  vencimiento_documentacion: z.string().optional().nullable().refine(val => !val || val === "" || /^\d{4}-\d{2}-\d{2}$/.test(val), { message: "Formato de fecha inválido (AAAA-MM-DD)." }),
  url_imagen: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.string().url("URL de imagen inválida. Asegúrate que incluya http:// o https://").optional().nullable()
  ),
  notas: z.string().optional(),
});

type AddVehicleFormValues = z.infer<typeof addVehicleFormSchema>;

interface AddVehicleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVehicleAdded: () => void;
}

export function AddVehicleDialog({ open, onOpenChange, onVehicleAdded }: AddVehicleDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<AddVehicleFormValues>({
    resolver: zodResolver(addVehicleFormSchema),
    defaultValues: {
      identificador_interno: "",
      marca: "",
      modelo: "",
      patente: "",
      tipo_vehiculo: null,
      estado_vehiculo: "Operativo",
      ano_fabricacion: null,
      fecha_adquisicion: "",
      proxima_mantencion_programada: "",
      vencimiento_documentacion: "",
      url_imagen: "",
      notas: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        identificador_interno: "",
        marca: "",
        modelo: "",
        patente: "",
        tipo_vehiculo: null,
        estado_vehiculo: "Operativo",
        ano_fabricacion: null,
        fecha_adquisicion: "",
        proxima_mantencion_programada: "",
        vencimiento_documentacion: "",
        url_imagen: "",
        notas: "",
      });
    }
  }, [open, form]);

  async function onSubmit(values: AddVehicleFormValues) {
    setIsSubmitting(true);
    try {
      const createData: VehicleCreateInput = {
        ...values,
        tipo_vehiculo: values.tipo_vehiculo === NULL_VEHICLE_TYPE_VALUE ? null : values.tipo_vehiculo,
        ano_fabricacion: values.ano_fabricacion || undefined,
        fecha_adquisicion: values.fecha_adquisicion || undefined,
        proxima_mantencion_programada: values.proxima_mantencion_programada || undefined,
        vencimiento_documentacion: values.vencimiento_documentacion || undefined,
        url_imagen: values.url_imagen || undefined,
        // ai_hint_imagen ya no se incluye aquí
      };
      await createVehicle(createData);
      toast({
        title: "Vehículo Agregado",
        description: `El vehículo ${values.marca} ${values.modelo} ha sido agregado.`,
      });
      onVehicleAdded();
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating vehicle:", error);
      toast({
        title: "Error al Agregar Vehículo",
        description: error instanceof Error ? error.message : "No se pudo agregar el vehículo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[750px]">
        <DialogHeader>
          <DialogTitle>Agregar Nuevo Vehículo</DialogTitle>
          <DialogDescription>
            Complete los campos para registrar un nuevo vehículo.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2 max-h-[75vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="marca" render={({ field }) => (
                <FormItem><FormLabel>Marca</FormLabel><FormControl><Input placeholder="Ej: Mercedes-Benz" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="modelo" render={({ field }) => (
                <FormItem><FormLabel>Modelo</FormLabel><FormControl><Input placeholder="Ej: Atego 1726" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField control={form.control} name="identificador_interno" render={({ field }) => (
                <FormItem><FormLabel>ID Interno (Opcional)</FormLabel><FormControl><Input placeholder="Ej: M-01, B-02" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="patente" render={({ field }) => (
                <FormItem><FormLabel>Patente (Opcional)</FormLabel><FormControl><Input placeholder="Ej: ABCD-12" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="ano_fabricacion" render={({ field }) => (
                <FormItem><FormLabel>Año Fabricación (Opcional)</FormLabel><FormControl><Input type="number" placeholder="Ej: 2020" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? null : Number(e.target.value))} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="tipo_vehiculo" render={({ field }) => (
                    <FormItem><FormLabel>Tipo de Vehículo (Opcional)</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value === NULL_VEHICLE_TYPE_VALUE ? null : value)}
                      value={field.value || NULL_VEHICLE_TYPE_VALUE}
                    >
                        <FormControl><SelectTrigger><SelectValue placeholder="Seleccione un tipo" /></SelectTrigger></FormControl>
                        <SelectContent>
                        <SelectItem value={NULL_VEHICLE_TYPE_VALUE}>N/A (No especificado)</SelectItem>
                        {ALL_VEHICLE_TYPES.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                        </SelectContent>
                    </Select><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="estado_vehiculo" render={({ field }) => (
                    <FormItem><FormLabel>Estado</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
            <FormField control={form.control} name="url_imagen" render={({ field }) => (
                <FormItem><FormLabel>URL Imagen (Opcional)</FormLabel><FormControl><Input placeholder="https://ejemplo.com/imagen.png" {...field} value={field.value ?? ''} /></FormControl>
                <FormDescription>Pega la URL de una imagen para el vehículo.</FormDescription><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="notas" render={({ field }) => (
              <FormItem><FormLabel>Notas (Opcional)</FormLabel><FormControl><Textarea placeholder="Observaciones sobre el vehículo..." {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancelar</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Agregar Vehículo"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
    

    