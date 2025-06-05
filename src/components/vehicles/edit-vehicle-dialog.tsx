
"use client";

import { useEffect, useState, useMemo } from "react";
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
import { updateVehicle } from "@/services/vehicleService";
import type { Vehicle, VehicleUpdateInput, VehicleStatus, VehicleType } from "@/types/vehicleTypes";
import { ALL_VEHICLE_STATUSES, ALL_VEHICLE_TYPES } from "@/types/vehicleTypes";
import { getAllEraEquipments, type EraEquipment } from "@/services/eraService";
import { getAllInventoryItems, type InventoryItem } from "@/services/inventoryService";
import { Loader2, Edit, Package, ShieldAlert, Search } from "lucide-react";

const NULL_VEHICLE_TYPE_VALUE = "__NULL_VEHICLE_TYPE__";
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

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
  url_imagen: z.string().url("URL de imagen inválida si se provee.").nullable().optional(),
  imagen_archivo: z.custom<File | null | undefined>(
      (val) => val === undefined || val === null || val instanceof File,
      "Debe ser un archivo"
    ).optional().nullable()
    .refine(file => !file || file.size <= MAX_FILE_SIZE_BYTES, `El archivo es demasiado grande (máx ${MAX_FILE_SIZE_MB}MB).`)
    .refine(file => !file || ACCEPTED_IMAGE_TYPES.includes(file.type), "Tipo de archivo no soportado (permitidos: JPG, PNG, WEBP, GIF)."),
  notas: z.string().nullable().optional(),
  assignedEraIds: z.array(z.number()).optional(),
  assignedInventoryItems: z.array(z.object({
    id_item: z.number(),
    nombre_item: z.string(),
    cantidad: z.coerce.number().min(1, "La cantidad debe ser al menos 1").max(z.number().optional()),
    selected: z.boolean().optional(),
    max_cantidad: z.number().optional(),
  })).optional(),
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
  const [allEraEquipments, setAllEraEquipments] = useState<EraEquipment[]>([]);
  const [allInventoryItems, setAllInventoryItems] = useState<InventoryItem[]>([]);
  const [loadingRelatedData, setLoadingRelatedData] = useState(false);
  const [eraSearchTerm, setEraSearchTerm] = useState("");
  const [inventorySearchTerm, setInventorySearchTerm] = useState("");

  const form = useForm<EditVehicleFormValues>({
    resolver: zodResolver(editVehicleFormSchema),
    // Default values will be set in useEffect
  });

  useEffect(() => {
    async function loadInitialData() {
      if (open && vehicle) {
        setLoadingRelatedData(true);
        setEraSearchTerm("");
        setInventorySearchTerm("");
        try {
          const [eras, items] = await Promise.all([
            getAllEraEquipments(),
            getAllInventoryItems()
          ]);
          const availableEras = eras.filter(era => era.estado_era === 'Disponible' || vehicle.assignedEraIds?.includes(era.id_era)); // Include already assigned ones even if not 'Disponible'
          const availableItems = items.filter(item => item.cantidad_actual > 0 || vehicle.assignedInventoryItems?.some(ai => ai.id_item === item.id_item));

          setAllEraEquipments(availableEras);
          setAllInventoryItems(availableItems);

          // Prepare inventory items for form, pre-selecting and setting quantities for already assigned items
          const initialInventoryItemsForForm = availableItems.map(item => {
            const assignedItem = vehicle.assignedInventoryItems?.find(ai => ai.id_item === item.id_item);
            return {
              id_item: item.id_item,
              nombre_item: `${item.nombre_item} (${item.codigo_item}) - Disp: ${item.cantidad_actual} ${item.unidad_medida}`,
              cantidad: assignedItem ? assignedItem.cantidad : 1,
              selected: !!assignedItem,
              max_cantidad: item.cantidad_actual + (assignedItem ? assignedItem.cantidad : 0) // Max is current stock + already assigned to this vehicle
            };
          });

          form.reset({
            identificador_interno: vehicle.identificador_interno || "",
            marca: vehicle.marca,
            modelo: vehicle.modelo,
            patente: vehicle.patente || "",
            tipo_vehiculo: vehicle.tipo_vehiculo || null,
            estado_vehiculo: vehicle.estado_vehiculo,
            ano_fabricacion: vehicle.ano_fabricacion ?? null,
            fecha_adquisicion: vehicle.fecha_adquisicion || "",
            proxima_mantencion_programada: vehicle.proxima_mantencion_programada || "",
            vencimiento_documentacion: vehicle.vencimiento_documentacion || "",
            url_imagen: vehicle.url_imagen || "",
            imagen_archivo: null,
            notas: vehicle.notas || "",
            assignedEraIds: vehicle.assignedEraIds || [],
            assignedInventoryItems: initialInventoryItemsForForm,
          });
        } catch (error) {
          console.error("Error loading related data for vehicle edit:", error);
          toast({
            title: "Error al cargar datos relacionados",
            description: "No se pudieron cargar los equipos ERA o ítems de inventario.",
            variant: "destructive",
          });
        } finally {
          setLoadingRelatedData(false);
        }
      }
    }
    // For edit dialog, assume vehicle.assignedEraIds and vehicle.assignedInventoryItems
    // would be populated by getVehicleById if backend supports it.
    // For now, they will be empty arrays if not provided.
    if (!vehicle?.assignedEraIds) vehicle.assignedEraIds = [];
    if (!vehicle?.assignedInventoryItems) vehicle.assignedInventoryItems = [];
    loadInitialData();
  }, [vehicle, open, form, toast]);


  async function onSubmit(values: EditVehicleFormValues) {
    if (!vehicle) return;
    setIsSubmitting(true);

    let finalUrlImagen = values.url_imagen;
    let imageUploadMessage = "";

    if (values.imagen_archivo) {
      console.log("Nuevo archivo de imagen seleccionado para editar (backend no implementado):", values.imagen_archivo.name);
      finalUrlImagen = null; 
      imageUploadMessage = "La subida de la nueva imagen seleccionada requiere implementación de backend. La URL de imagen actual se eliminará o actualizará si el backend está preparado.";
    }
    
    const finalAssignedInventoryItems = values.assignedInventoryItems
      ?.filter(item => item.selected && item.cantidad > 0)
      .map(item => ({ id_item: item.id_item, cantidad: item.cantidad }));

    try {
      const updateData: VehicleUpdateInput = {
        identificador_interno: values.identificador_interno,
        marca: values.marca,
        modelo: values.modelo,
        patente: values.patente,
        tipo_vehiculo: values.tipo_vehiculo === NULL_VEHICLE_TYPE_VALUE ? null : values.tipo_vehiculo,
        estado_vehiculo: values.estado_vehiculo,
        ano_fabricacion: values.ano_fabricacion || null,
        fecha_adquisicion: values.fecha_adquisicion || null,
        proxima_mantencion_programada: values.proxima_mantencion_programada || null,
        vencimiento_documentacion: values.vencimiento_documentacion || null,
        url_imagen: finalUrlImagen,
        ai_hint_imagen: null, 
        notas: values.notas || null,
        assignedEraIds: values.assignedEraIds,
        assignedInventoryItems: finalAssignedInventoryItems,
      };
      await updateVehicle(vehicle.id_vehiculo, updateData);
      toast({
        title: "Vehículo Actualizado",
        description: `El vehículo ${values.marca} ${values.modelo} ha sido actualizado. ${imageUploadMessage}`,
        duration: imageUploadMessage ? 7000: 5000,
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

  const filteredEraEquipments = useMemo(() => {
    if (!eraSearchTerm) return allEraEquipments;
    return allEraEquipments.filter(era => 
      era.codigo_era.toLowerCase().includes(eraSearchTerm.toLowerCase()) ||
      era.marca?.toLowerCase().includes(eraSearchTerm.toLowerCase()) ||
      era.modelo?.toLowerCase().includes(eraSearchTerm.toLowerCase())
    );
  }, [allEraEquipments, eraSearchTerm]);

  const currentInventoryItemsInForm = form.watch('assignedInventoryItems') || [];

  const filteredInventoryItemsForDisplay = useMemo(() => {
    if (!inventorySearchTerm) return currentInventoryItemsInForm;
    return currentInventoryItemsInForm.filter(item =>
      item.nombre_item.toLowerCase().includes(inventorySearchTerm.toLowerCase())
    );
  }, [currentInventoryItemsInForm, inventorySearchTerm]);

  if (!vehicle) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Editar Vehículo: {vehicle.marca} {vehicle.modelo}</DialogTitle>
          <DialogDescription>Modifique los campos para actualizar el vehículo y su equipamiento.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-2 max-h-[80vh] overflow-y-auto pr-2">
             {/* Campos básicos del vehículo (igual que en AddVehicleDialog) */}
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
                <FormItem><FormLabel>ID Interno (Opcional)</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="patente" render={({ field }) => (
                <FormItem><FormLabel>Patente (Opcional)</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="ano_fabricacion" render={({ field }) => (
                <FormItem><FormLabel>Año Fabricación (Opcional)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? null : Number(e.target.value))} /></FormControl><FormMessage /></FormItem>
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
            <FormField control={form.control} name="url_imagen" render={({ field }) => (
                <FormItem><FormLabel>URL Imagen Actual (Opcional)</FormLabel><FormControl><Input {...field} value={field.value ?? ''} placeholder="https://ejemplo.com/imagen.png" /></FormControl>
                <FormDescription>Mantener o editar URL existente si no se sube una nueva imagen.</FormDescription><FormMessage /></FormItem>
            )} />
            <FormField
              control={form.control}
              name="imagen_archivo"
              render={({ field: { onChange, value, ...restField } }) => (
                <FormItem>
                  <FormLabel>Subir Nueva Imagen (Opcional)</FormLabel>
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
                    Si selecciona un archivo, reemplazará la URL de imagen actual (subida de archivo requiere backend). Máx. {MAX_FILE_SIZE_MB}MB.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField control={form.control} name="notas" render={({ field }) => (
              <FormItem><FormLabel>Notas (Opcional)</FormLabel><FormControl><Textarea placeholder="Observaciones sobre el vehículo..." {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
            )} />

            {/* Sección para asignar Equipos ERA */}
            <div className="space-y-2 pt-4 border-t">
              <h3 className="text-lg font-medium flex items-center"><ShieldAlert className="mr-2 h-5 w-5 text-primary" />Asignar Equipos ERA</h3>
              <div className="relative mb-2">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar ERA por código, marca, modelo..."
                  value={eraSearchTerm}
                  onChange={(e) => setEraSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              {loadingRelatedData ? <Loader2 className="h-5 w-5 animate-spin" /> :
                allEraEquipments.length > 0 ? (
                  <ScrollArea className="h-40 rounded-md border p-2">
                    {filteredEraEquipments.length > 0 ? (
                      <FormField
                        control={form.control}
                        name="assignedEraIds"
                        render={() => ( // No usamos field aquí directamente para el grupo
                          <FormItem>
                            {filteredEraEquipments.map((era) => (
                              <FormField
                                key={era.id_era}
                                control={form.control}
                                name="assignedEraIds"
                                render={({ field: itemField }) => { // field para el array completo
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
                    ) : <p className="text-sm text-muted-foreground p-2">No hay equipos ERA que coincidan con la búsqueda.</p>}
                  </ScrollArea>
                ) : <p className="text-sm text-muted-foreground">No hay equipos ERA disponibles para asignar.</p>
              }
            </div>

            {/* Sección para asignar Ítems de Inventario */}
            <div className="space-y-2 pt-4 border-t">
              <h3 className="text-lg font-medium flex items-center"><Package className="mr-2 h-5 w-5 text-primary" />Asignar Ítems de Inventario</h3>
               <div className="relative mb-2">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar ítem por nombre, código..."
                  value={inventorySearchTerm}
                  onChange={(e) => setInventorySearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              {loadingRelatedData ? <Loader2 className="h-5 w-5 animate-spin" /> :
                (form.getValues('assignedInventoryItems') || []).length > 0 ? (
                  <ScrollArea className="h-48 rounded-md border p-2">
                    <div className="space-y-3">
                    {filteredInventoryItemsForDisplay.length > 0 ? (
                      filteredInventoryItemsForDisplay.map((item, index) => {
                        const originalIndex = form.getValues('assignedInventoryItems')?.findIndex(fi => fi.id_item === item.id_item);
                        if (originalIndex === undefined || originalIndex === -1) return null;

                        return (
                          <div key={item.id_item} className="flex items-center justify-between gap-3 p-2 border rounded-md">
                            <FormField
                              control={form.control}
                              name={`assignedInventoryItems.${originalIndex}.selected`}
                              render={({ field }) => (
                                <FormItem className="flex items-center space-x-2 flex-grow">
                                  <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                  <FormLabel htmlFor={`assignedInventoryItems.${originalIndex}.selected`} className="font-normal text-sm flex-grow min-w-0">
                                    <span className="truncate block">{item.nombre_item}</span>
                                  </FormLabel>
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`assignedInventoryItems.${originalIndex}.cantidad`}
                              render={({ field }) => (
                                <FormItem className="w-28 flex-shrink-0">
                                  <FormControl>
                                    <Input
                                      type="number"
                                      placeholder="Cant."
                                      {...field}
                                      min={1}
                                      max={item.max_cantidad}
                                      disabled={!form.watch(`assignedInventoryItems.${originalIndex}.selected`)}
                                      className="h-8"
                                      onChange={(e) => {
                                          const val = parseInt(e.target.value, 10);
                                          if (isNaN(val)) {
                                              field.onChange(1);
                                          } else if (val > (item.max_cantidad ?? Infinity)) {
                                              field.onChange(item.max_cantidad);
                                          } else if (val < 1) {
                                              field.onChange(1);
                                          } else {
                                              field.onChange(val);
                                          }
                                      }}
                                    />
                                  </FormControl>
                                  <FormMessage className="text-xs" />
                                </FormItem>
                              )}
                            />
                          </div>
                        );
                      })
                    ) : <p className="text-sm text-muted-foreground p-2">No hay ítems de inventario que coincidan con la búsqueda.</p>}
                    </div>
                  </ScrollArea>
                ) : <p className="text-sm text-muted-foreground">No hay ítems de inventario con stock disponibles para asignar.</p>
              }
            </div>

            <DialogFooter className="pt-6">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancelar</Button>
              <Button type="submit" disabled={isSubmitting || loadingRelatedData}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <><Edit className="mr-2 h-4 w-4" /> Actualizar Vehículo</>}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
