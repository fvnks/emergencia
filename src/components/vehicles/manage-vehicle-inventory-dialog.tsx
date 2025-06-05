
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
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { updateVehicle } from "@/services/vehicleService";
import type { Vehicle } from "@/types/vehicleTypes";
import { getAllInventoryItems, type InventoryItem } from "@/services/inventoryService";
import { Loader2, Search, Package } from "lucide-react";

const inventoryItemSchema = z.object({
  id_item: z.number(),
  nombre_item: z.string(),
  cantidad: z.coerce.number().min(0, "La cantidad no puede ser negativa.").optional(), // Cantidad a asignar
  selected: z.boolean().optional(),
  stock_disponible_original: z.number(), // Stock original del ítem
  cantidad_ya_asignada_a_este_vehiculo: z.number().default(0), // Cuánto ya estaba asignado a ESTE vehículo
});

const manageVehicleInventorySchema = z.object({
  items: z.array(inventoryItemSchema),
});

type ManageVehicleInventoryFormValues = z.infer<typeof manageVehicleInventorySchema>;

interface ManageVehicleInventoryDialogProps {
  vehicle: Vehicle | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAssignmentsUpdated: () => void;
}

export function ManageVehicleInventoryDialog({ vehicle, open, onOpenChange, onAssignmentsUpdated }: ManageVehicleInventoryDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allInventoryItems, setAllInventoryItems] = useState<InventoryItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const form = useForm<ManageVehicleInventoryFormValues>({
    resolver: zodResolver(manageVehicleInventorySchema),
    defaultValues: {
      items: [],
    },
  });

  useEffect(() => {
    async function fetchItems() {
      if (open && vehicle) {
        setLoadingItems(true);
        try {
          const itemsFromDb = await getAllInventoryItems();
          setAllInventoryItems(itemsFromDb);

          const itemsForForm = itemsFromDb.map(item => {
            const assignedToThisVehicle = vehicle.assignedInventoryItems?.find(ai => ai.id_item === item.id_item);
            return {
              id_item: item.id_item,
              nombre_item: `${item.nombre_item} (${item.codigo_item}) - Disp: ${item.cantidad_actual} ${item.unidad_medida}`,
              selected: !!assignedToThisVehicle,
              cantidad: assignedToThisVehicle ? assignedToThisVehicle.cantidad : 1,
              stock_disponible_original: item.cantidad_actual,
              cantidad_ya_asignada_a_este_vehiculo: assignedToThisVehicle ? assignedToThisVehicle.cantidad : 0,
            };
          });
          form.reset({ items: itemsForForm });

        } catch (error) {
          console.error("Error fetching inventory items:", error);
          toast({
            title: "Error al cargar ítems",
            description: "No se pudieron cargar los ítems de inventario.",
            variant: "destructive",
          });
        } finally {
          setLoadingItems(false);
        }
      }
    }
    fetchItems();
  }, [open, vehicle, form, toast]);

  const itemsInForm = form.watch('items');

  const filteredItems = useMemo(() => {
    if (!searchTerm) return itemsInForm || [];
    return (itemsInForm || []).filter(item =>
      item.nombre_item.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [itemsInForm, searchTerm]);

  async function onSubmit(values: ManageVehicleInventoryFormValues) {
    if (!vehicle) return;
    setIsSubmitting(true);

    const itemsToAssign = values.items
      .filter(item => item.selected && item.cantidad && item.cantidad > 0)
      .map(item => ({
        id_item: item.id_item,
        cantidad: item.cantidad as number, // Ya validado por el schema si selected y >0
      }));

    try {
      await updateVehicle(vehicle.id_vehiculo, { assignedInventoryItems: itemsToAssign });
      toast({
        title: "Inventario del Vehículo Actualizado",
        description: `Los ítems de inventario para ${vehicle.marca} ${vehicle.modelo} han sido actualizados.`,
      });
      onAssignmentsUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating vehicle inventory:", error);
      toast({
        title: "Error al Actualizar Inventario",
        description: error instanceof Error ? error.message : "No se pudo actualizar el inventario del vehículo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!vehicle) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Package className="mr-2 h-5 w-5 text-primary" />
            Gestionar Inventario para {vehicle.marca} {vehicle.modelo}
          </DialogTitle>
          <DialogDescription>
            Seleccione ítems y especifique cantidades para asignar al vehículo.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar ítem por nombre, código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            {loadingItems ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : filteredItems.length > 0 ? (
              <ScrollArea className="h-72 rounded-md border p-3">
                <div className="space-y-3">
                  {filteredItems.map((item, index) => {
                    // Necesitamos encontrar el índice original en el array 'items' del formulario
                    // ya que 'filteredItems' puede ser un subconjunto y 'index' no sería correcto.
                    const originalIndex = form.getValues('items').findIndex(formItem => formItem.id_item === item.id_item);
                    if (originalIndex === -1) return null; // No debería ocurrir

                    const maxQuantityAllowed = item.stock_disponible_original + item.cantidad_ya_asignada_a_este_vehiculo;

                    return (
                      <div key={item.id_item} className="flex items-center justify-between gap-3 p-2 border rounded-md">
                        <FormField
                          control={form.control}
                          name={`items.${originalIndex}.selected`}
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2 flex-grow">
                              <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                              <FormLabel htmlFor={`items.${originalIndex}.selected`} className="font-normal text-sm flex-grow min-w-0">
                                <span className="truncate block" title={item.nombre_item}>{item.nombre_item}</span>
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`items.${originalIndex}.cantidad`}
                          render={({ field }) => (
                            <FormItem className="w-28 flex-shrink-0">
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="Cant."
                                  {...field}
                                  value={field.value ?? 1}
                                  min={1}
                                  max={maxQuantityAllowed}
                                  disabled={!form.watch(`items.${originalIndex}.selected`)}
                                  className="h-8 text-sm"
                                  onChange={e => {
                                    const val = parseInt(e.target.value, 10);
                                    if (isNaN(val)) field.onChange(1);
                                    else if (val > maxQuantityAllowed) field.onChange(maxQuantityAllowed);
                                    else if (val < 1) field.onChange(1);
                                    else field.onChange(val);
                                  }}
                                />
                              </FormControl>
                              <FormMessage className="text-xs mt-1" />
                            </FormItem>
                          )}
                        />
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                {allInventoryItems.length === 0 ? "No hay ítems de inventario disponibles." : "No hay ítems que coincidan con la búsqueda."}
              </p>
            )}
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting || loadingItems}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Guardar Cambios"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
