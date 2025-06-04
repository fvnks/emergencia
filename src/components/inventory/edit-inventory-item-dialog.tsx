
"use client";

import type { InventoryItem } from "@/services/inventoryService";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { updateInventoryItem, type InventoryItemUpdateInput } from "@/services/inventoryService";
import { Loader2, Edit } from "lucide-react";

const formSchema = z.object({
  codigo_item: z.string().min(1, { message: "El código del ítem es requerido." }),
  nombre_item: z.string().min(3, { message: "El nombre del ítem debe tener al menos 3 caracteres." }),
  descripcion_item: z.string().nullable().optional(),
  categoria_item: z.string().min(1, { message: "La categoría es requerida." }),
  ubicacion_nombre: z.string().nullable().optional(),
  sub_ubicacion: z.string().nullable().optional(),
  cantidad_actual: z.coerce.number().min(0, { message: "La cantidad no puede ser negativa." }),
  unidad_medida: z.string().min(1, { message: "La unidad de medida es requerida." }),
  stock_minimo: z.coerce.number().min(0, { message: "El stock mínimo no puede ser negativo." }).nullable().optional(),
  es_epp: z.boolean().default(false),
  fecha_vencimiento_item: z.string().refine(val => !val || /^\d{4}-\d{2}-\d{2}$/.test(val), { message: "Formato de fecha inválido (AAAA-MM-DD)." }).nullable().optional(),
});

type EditInventoryItemFormValues = z.infer<typeof formSchema>;

interface EditInventoryItemDialogProps {
  item: InventoryItem;
  onItemUpdated: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditInventoryItemDialog({ item, onItemUpdated, open, onOpenChange }: EditInventoryItemDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<EditInventoryItemFormValues>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (item && open) {
      form.reset({
        codigo_item: item.codigo_item,
        nombre_item: item.nombre_item,
        descripcion_item: item.descripcion_item || "",
        categoria_item: item.categoria_item,
        ubicacion_nombre: item.ubicacion_nombre || "",
        sub_ubicacion: item.sub_ubicacion || "",
        cantidad_actual: item.cantidad_actual,
        unidad_medida: item.unidad_medida,
        stock_minimo: item.stock_minimo === null ? undefined : item.stock_minimo, 
        es_epp: item.es_epp,
        fecha_vencimiento_item: item.fecha_vencimiento_item ? item.fecha_vencimiento_item.split('T')[0] : "", 
      });
    }
  }, [item, open, form]);

  async function onSubmit(values: EditInventoryItemFormValues) {
    setIsSubmitting(true);
    try {
      const updateData: InventoryItemUpdateInput = {
        ...values,
        descripcion_item: values.descripcion_item || null,
        ubicacion_nombre: values.ubicacion_nombre || null,
        sub_ubicacion: values.sub_ubicacion || null,
        stock_minimo: values.stock_minimo === undefined || values.stock_minimo === null ? null : values.stock_minimo,
        fecha_vencimiento_item: values.fecha_vencimiento_item || null,
      };
      await updateInventoryItem(item.id_item, updateData);
      toast({
        title: "Ítem Actualizado",
        description: `El ítem ${values.nombre_item} ha sido actualizado.`,
      });
      onItemUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating inventory item:", error);
      toast({
        title: "Error al Actualizar Ítem",
        description: error instanceof Error ? error.message : "No se pudo actualizar el ítem.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (isSubmitting && !isOpen) return;
      onOpenChange(isOpen);
      if (!isOpen) form.reset(); 
    }}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Editar Ítem del Inventario</DialogTitle>
          <DialogDescription>
            Modifique los campos para actualizar los datos del ítem: {item.nombre_item}.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2 max-h-[70vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="codigo_item"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código Ítem</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: CAS-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="nombre_item"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre Ítem</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Casco de Seguridad Rojo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="descripcion_item"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Detalles adicionales del ítem..." {...field} value={field.value ?? ''}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="categoria_item"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoría</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: EPP, Herramientas, Médico" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cantidad_actual"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cantidad Actual</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="unidad_medida"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidad de Medida</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: unidad, caja, metro" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="stock_minimo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock Mínimo (Opcional)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="ubicacion_nombre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ubicación Principal (Opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Bodega A, Vehículo V01" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sub_ubicacion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sub-Ubicación (Opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Estante 1, Compartimiento Lateral" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="fecha_vencimiento_item"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha de Vencimiento (Opcional)</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormDescription>Formato: AAAA-MM-DD</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="es_epp"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 shadow">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      ¿Es un Equipo de Protección Personal (EPP)?
                    </FormLabel>
                    <FormDescription>
                      Marcar si este ítem se considera EPP y puede ser asignado a personal.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <><Edit className="mr-2 h-4 w-4" /> Actualizar Ítem</>}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
