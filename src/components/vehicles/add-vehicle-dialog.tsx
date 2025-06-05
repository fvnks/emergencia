
"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
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
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { createVehicle } from "@/services/vehicleService";
import type { VehicleCreateInput, VehicleStatus, VehicleType } from "@/types/vehicleTypes";
import { ALL_VEHICLE_STATUSES, ALL_VEHICLE_TYPES } from "@/types/vehicleTypes";
import { getAllEraEquipments, type EraEquipment } from "@/services/eraService";
import { getAllInventoryItems, type InventoryItem } from "@/services/inventoryService";
import { Loader2, Package, ShieldAlert } from "lucide-react";

const NULL_VEHICLE_TYPE_VALUE = "__NULL_VEHICLE_TYPE__";
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

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
  imagen_archivo: z.custom<File | null | undefined>(
      (val) => val === undefined || val === null || val instanceof File,
      "Debe ser un archivo"
    ).optional().nullable()
    .refine(file => !file || file.size <= MAX_FILE_SIZE_BYTES, `El archivo es demasiado grande (máx ${MAX_FILE_SIZE_MB}MB).`)
    .refine(file => !file || ACCEPTED_IMAGE_TYPES.includes(file.type), "Tipo de archivo no soportado (permitidos: JPG, PNG, WEBP, GIF)."),
  notas: z.string().optional(),
  assignedEraIds: z.array(z.number()).optional(),
  assignedInventoryItems: z.array(z.object({
    id_item: z.number(),
    nombre_item: z.string(), // Para mostrar en el formulario
    cantidad: z.coerce.number().min(1, "La cantidad debe ser al menos 1").max(z.number().optional()), // max se llenará dinámicamente
    selected: z.boolean().optional() // Para el checkbox
  })).optional(),
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
  const [eraEquipments, setEraEquipments] = useState<EraEquipment[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [loadingRelatedData, setLoadingRelatedData] = useState(false);

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
      imagen_archivo: null,
      notas: "",
      assignedEraIds: [],
      assignedInventoryItems: [],
    },
  });

  useEffect(() => {
    async function loadData() {
      if (open) {
        setLoadingRelatedData(true);
        try {
          const [eras, items] = await Promise.all([
            getAllEraEquipments(),
            getAllInventoryItems()
          ]);
          setEraEquipments(eras.filter(era => era.estado_era === 'Disponible')); // Solo ERAs disponibles
          
          const initialInventoryItems = items
            .filter(item => item.cantidad_actual > 0) // Solo items con stock
            .map(item => ({
              id_item: item.id_item,
              nombre_item: `${item.nombre_item} (${item.codigo_item}) - Disp: ${item.cantidad_actual} ${item.unidad_medida}`,
              cantidad: 1,
              selected: false,
              max_cantidad: item.cantidad_actual
            }));

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
            imagen_archivo: null,
            notas: "",
            assignedEraIds: [],
            assignedInventoryItems: initialInventoryItems,
          });
        } catch (error) {
          console.error("Error loading ERA or Inventory Items for vehicle creation:", error);
          toast({
            title: "Error al cargar datos",
            description: "No se pudieron cargar los equipos ERA o ítems de inventario.",
            variant: "destructive",
          });
        } finally {
          setLoadingRelatedData(false);
        }
      }
    }
    loadData();
  }, [open, form, toast]);


  async function onSubmit(values: AddVehicleFormValues) {
    setIsSubmitting(true);
    
    const { imagen_archivo, assignedInventoryItems: formInventoryItems, ...otherFormValues } = values;
    let imageUploadMessage = "";

    if (imagen_archivo) {
      console.log("Archivo de imagen seleccionado (backend no implementado):", imagen_archivo.name, imagen_archivo.size, imagen_archivo.type);
      imageUploadMessage = "La subida de la imagen seleccionada requiere implementación de backend.";
    }

    const finalAssignedInventoryItems = formInventoryItems
      ?.filter(item => item.selected && item.cantidad > 0)
      .map(item => ({ id_item: item.id_item, cantidad: item.cantidad }));

    try {
      const createData: VehicleCreateInput = {
        ...otherFormValues,
        tipo_vehiculo: otherFormValues.tipo_vehiculo === NULL_VEHICLE_TYPE_VALUE ? null : otherFormValues.tipo_vehiculo,
        ano_fabricacion: otherFormValues.ano_fabricacion || undefined,
        fecha_adquisicion: otherFormValues.fecha_adquisicion || undefined,
        proxima_mantencion_programada: otherFormValues.proxima_mantencion_programada || undefined,
        vencimiento_documentacion: otherFormValues.vencimiento_documentacion || undefined,
        url_imagen: null, 
        ai_hint_imagen: undefined,
        assignedEraIds: values.assignedEraIds,
        assignedInventoryItems: finalAssignedInventoryItems,
      };
      
      await createVehicle(createData);
      toast({
        title: "Vehículo Agregado",
        description: `El vehículo ${values.marca} ${values.modelo} ha sido agregado. ${imageUploadMessage}`,
        duration: imageUploadMessage ? 7000 : 5000,
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
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Agregar Nuevo Vehículo</DialogTitle>
          <DialogDescription>
            Complete los campos para registrar un nuevo vehículo y asigne equipos si es necesario.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-2 max-h-[80vh] overflow-y-auto pr-2">
            {/* Campos básicos del vehículo */}
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
             <FormField
                control={form.control}
                name="imagen_archivo"
                render={({ field: { onChange, value, ...restField } }) => (
                  <FormItem>
                    <FormLabel>Imagen del Vehículo (Opcional)</FormLabel>
                    <FormControl>
                      <Input
                        {...restField}
                        type="file"
                        accept={ACCEPTED_IMAGE_TYPES.join(",")}
                        onChange={(event) => onChange(event.target.files ? event.target.files[0] : null)}
                        className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                      />
                    </FormControl>
                    <FormDescription>
                      Seleccione un archivo de imagen (JPG, PNG, WEBP, GIF). Máx. {MAX_FILE_SIZE_MB}MB.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            <FormField control={form.control} name="notas" render={({ field }) => (
              <FormItem><FormLabel>Notas (Opcional)</FormLabel><FormControl><Textarea placeholder="Observaciones sobre el vehículo..." {...field} /></FormControl><FormMessage /></FormItem>
            )} />

            {/* Sección para asignar Equipos ERA */}
            <div className="space-y-2 pt-4 border-t">
              <h3 className="text-lg font-medium flex items-center"><ShieldAlert className="mr-2 h-5 w-5 text-primary" />Asignar Equipos ERA (Opcional)</h3>
              {loadingRelatedData ? <Loader2 className="h-5 w-5 animate-spin" /> :
                eraEquipments.length > 0 ? (
                  <ScrollArea className="h-40 rounded-md border p-2">
                    <FormField
                      control={form.control}
                      name="assignedEraIds"
                      render={({ field }) => (
                        <FormItem>
                          {eraEquipments.map((era) => (
                            <FormField
                              key={era.id_era}
                              control={form.control}
                              name="assignedEraIds"
                              render={({ field: itemField }) => {
                                return (
                                  <FormItem className="flex flex-row items-center space-x-3 space-y-0 py-1">
                                    <FormControl>
                                      <Checkbox
                                        checked={itemField.value?.includes(era.id_era)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? itemField.onChange([...(itemField.value || []), era.id_era])
                                            : itemField.onChange(
                                                (itemField.value || []).filter(
                                                  (id) => id !== era.id_era
                                                )
                                              );
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal text-sm">
                                      {era.codigo_era} - {era.marca} {era.modelo || ''} (S/N: {era.numero_serie || 'N/A'})
                                    </FormLabel>
                                  </FormItem>
                                );
                              }}
                            />
                          ))}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </ScrollArea>
                ) : <p className="text-sm text-muted-foreground">No hay equipos ERA disponibles para asignar.</p>
              }
            </div>

            {/* Sección para asignar Ítems de Inventario */}
            <div className="space-y-2 pt-4 border-t">
              <h3 className="text-lg font-medium flex items-center"><Package className="mr-2 h-5 w-5 text-primary" />Asignar Ítems de Inventario (Opcional)</h3>
              {loadingRelatedData ? <Loader2 className="h-5 w-5 animate-spin" /> :
                form.getValues('assignedInventoryItems') && form.getValues('assignedInventoryItems')!.length > 0 ? (
                  <ScrollArea className="h-48 rounded-md border p-2">
                    <div className="space-y-3">
                    {(form.getValues('assignedInventoryItems') || []).map((item, index) => (
                      <div key={item.id_item} className="flex items-center justify-between gap-3 p-2 border rounded-md">
                        <FormField
                          control={form.control}
                          name={`assignedInventoryItems.${index}.selected`}
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2">
                              <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                              <FormLabel htmlFor={`assignedInventoryItems.${index}.selected`} className="font-normal text-sm flex-grow">{item.nombre_item}</FormLabel>
                            </FormItem>
                          )}
                        />
                         <FormField
                          control={form.control}
                          name={`assignedInventoryItems.${index}.cantidad`}
                          render={({ field }) => (
                            <FormItem className="w-28">
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="Cant."
                                  {...field}
                                  min={1}
                                  max={ (form.getValues('assignedInventoryItems')![index] as any).max_cantidad }
                                  disabled={!form.watch(`assignedInventoryItems.${index}.selected`)}
                                  className="h-8"
                                />
                              </FormControl>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />
                      </div>
                    ))}
                    </div>
                  </ScrollArea>
                ) : <p className="text-sm text-muted-foreground">No hay ítems de inventario con stock disponibles para asignar.</p>
              }
            </div>


            <DialogFooter className="pt-6">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancelar</Button>
              <Button type="submit" disabled={isSubmitting || loadingRelatedData}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Agregar Vehículo"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
