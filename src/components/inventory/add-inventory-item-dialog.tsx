
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
  DialogTrigger,
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
import { useToast } from "@/hooks/use-toast";
import { createInventoryItem, InventoryItemCreateInput } from "@/services/inventoryService";
import { Loader2, PlusCircle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  codigo_item: z.string().min(1, { message: "El código del ítem es requerido." }),
  nombre_item: z.string().min(3, { message: "El nombre del ítem debe tener al menos 3 caracteres." }),
  descripcion_item: z.string().optional(),
  categoria_item: z.string().min(1, { message: "La categoría es requerida." }),
  ubicacion_nombre: z.string().optional(),
  sub_ubicacion: z.string().optional(),
  cantidad_actual: z.coerce.number().min(0, { message: "La cantidad no puede ser negativa." }),
  unidad_medida: z.string().min(1, { message: "La unidad de medida es requerida." }).default("unidad"),
  stock_minimo: z.coerce.number().min(0, { message: "El stock mínimo no puede ser negativo." }).optional(),
  es_epp: z.boolean().default(false),
  fecha_vencimiento_item: z.string().refine(val => !val || /^\d{4}-\d{2}-\d{2}$/.test(val), { message: "Formato de fecha inválido (AAAA-MM-DD)." }).optional(),
});

type AddInventoryItemFormValues = z.infer<typeof formSchema>;

interface AddInventoryItemDialogProps {
  onItemAdded: () => void;
}

export function AddInventoryItemDialog({ onItemAdded }: AddInventoryItemDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<AddInventoryItemFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      codigo_item: "",
      nombre_item: "",
      descripcion_item: "",
      categoria_item: "",
      ubicacion_nombre: "",
      sub_ubicacion: "",
      cantidad_actual: 0,
      unidad_medida: "unidad",
      stock_minimo: 0,
      es_epp: false,
      fecha_vencimiento_item: "",
    },
  });

  useEffect(() => {
    if(isOpen) {
        form.reset({
            codigo_item: "",
            nombre_item: "",
            descripcion_item: "",
            categoria_item: "",
            ubicacion_nombre: "",
            sub_ubicacion: "",
            cantidad_actual: 0,
            unidad_medida: "unidad",
            stock_minimo: 0,
            es_epp: false,
            fecha_vencimiento_item: "",
        });
    }
  }, [isOpen, form]);

  async function onSubmit(values: AddInventoryItemFormValues) {
    setIsSubmitting(true);
    try {
      const createData: InventoryItemCreateInput = {
        ...values,
        stock_minimo: values.stock_minimo || 0, 
        fecha_vencimiento_item: values.fecha_vencimiento_item || undefined,
      };
      await createInventoryItem(createData);
      toast({
        title: "Ítem Agregado",
        description: `El ítem ${values.nombre_item} ha sido agregado al inventario.`,
      });
      onItemAdded();
      setIsOpen(false);
    } catch (error) {
      console.error("Error creating inventory item:", error);
      toast({
        title: "Error al Agregar Ítem",
        description: error instanceof Error ? error.message : "No se pudo agregar el ítem.",
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
          <PlusCircle className="mr-2 h-5 w-5" /> Agregar Nuevo Ítem
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Agregar Nuevo Ítem al Inventario</DialogTitle>
          <DialogDescription>
            Complete los campos para registrar un nuevo ítem.
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
                    <Textarea placeholder="Detalles adicionales del ítem..." {...field} />
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
                name="ubicacion_nombre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ubicación Principal (Opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Bodega A, Vehículo V01" {...field} />
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
                      <Input placeholder="Ej: Estante 1, Compartimiento Lateral" {...field} />
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
                    <Input type="date" {...field} />
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
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Agregar Ítem"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
