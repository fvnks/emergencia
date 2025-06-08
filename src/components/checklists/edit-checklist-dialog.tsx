
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
import { Loader2, Edit } from "lucide-react";
import type { Checklist } from "@/app/(app)/checklists/page";
import { VEHICLE_STANDARD_ITEMS, ERA_STANDARD_ITEMS } from "@/app/(app)/checklists/page";
import type { ChecklistStatus } from "@/types/checklistTypes";
import { ALL_CHECKLIST_STATUSES } from "@/types/checklistTypes";

const editChecklistFormSchema = z.object({
  name: z.string().min(3, { message: "El nombre del checklist debe tener al menos 3 caracteres." }),
  description: z.string().optional(),
  category: z.string().optional(),
  itemCount: z.coerce.number().min(0, { message: "El número de ítems no puede ser negativo." }).default(0),
  status: z.enum(ALL_CHECKLIST_STATUSES as [ChecklistStatus, ...ChecklistStatus[]], {
    required_error: "Debe seleccionar un estado.",
  }),
});

export type EditChecklistData = z.infer<typeof editChecklistFormSchema>;

interface EditChecklistDialogProps {
  checklist: Checklist | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChecklistUpdated: (id: string, data: EditChecklistData) => void;
  existingCategories: string[];
}

export function EditChecklistDialog({ checklist, open, onOpenChange, onChecklistUpdated, existingCategories }: EditChecklistDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const isAssetChecklist = !!checklist?.assetId;

  const form = useForm<EditChecklistData>({
    resolver: zodResolver(editChecklistFormSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      itemCount: 0,
      status: "Nuevo",
    },
  });

  useEffect(() => {
    if (checklist && open) {
      let itemsToCount = checklist.items;
      if (checklist.assetType === 'Vehicle') {
        itemsToCount = VEHICLE_STANDARD_ITEMS;
      } else if (checklist.assetType === 'ERA') {
        itemsToCount = ERA_STANDARD_ITEMS;
      }

      form.reset({
        name: checklist.name,
        description: checklist.description || "",
        category: checklist.category || "",
        itemCount: itemsToCount.length,
        status: checklist.status,
      });
    }
  }, [checklist, open, form]);

  async function onSubmit(values: EditChecklistData) {
    if (!checklist) return;
    setIsSubmitting(true);
    
    try {
      onChecklistUpdated(checklist.id, values);
    } catch (error) {
      console.error("Error updating checklist:", error);
      toast({
        title: "Error al Actualizar Checklist",
        description: error instanceof Error ? error.message : "No se pudo actualizar el checklist.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!checklist) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Edit className="mr-2 h-5 w-5 text-primary" /> 
            {isAssetChecklist ? "Ver Configuración Checklist de Activo" : `Editar Checklist: ${checklist.name}`}
          </DialogTitle>
          <DialogDescription>
            {isAssetChecklist 
              ? `Configuración del checklist para ${checklist.assetName}. Los ítems son estándar para este tipo de activo.`
              : "Modifique los detalles del checklist. La gestión detallada de ítems se hará en un paso futuro."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2 max-h-[70vh] overflow-y-auto pr-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Checklist</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Inspección Vehicular Diaria" {...field} readOnly={isAssetChecklist} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Detalles sobre el propósito o alcance del checklist..." {...field} readOnly={isAssetChecklist} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoría (Opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Vehicular" {...field} list="edit-existing-categories" readOnly={isAssetChecklist} />
                    </FormControl>
                    {!isAssetChecklist && (
                      <datalist id="edit-existing-categories">
                        {existingCategories.map(cat => <option key={cat} value={cat} />)}
                      </datalist>
                    )}
                    <FormDescription>
                      {isAssetChecklist ? "La categoría se deriva del tipo de activo." : "Escriba una nueva o seleccione una existente."}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="itemCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de Ítems</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" placeholder="Ej: 15" {...field} readOnly />
                    </FormControl>
                     <FormDescription>
                      {isAssetChecklist ? `Ítems estándar: ${field.value}` : `Cantidad actual: ${checklist.items.length}. Si modifica este número, se generarán ítems de ejemplo.`}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado de la Plantilla</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={isAssetChecklist}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione un estado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ALL_CHECKLIST_STATUSES.map(status => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                {isAssetChecklist ? "Cerrar" : "Cancelar"}
              </Button>
              {!isAssetChecklist && (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Guardar Cambios"}
                </Button>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
