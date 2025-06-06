
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
import { useToast } from "@/hooks/use-toast";
import { Loader2, FilePlus2 } from "lucide-react";

const addChecklistFormSchema = z.object({
  name: z.string().min(3, { message: "El nombre del checklist debe tener al menos 3 caracteres." }),
  description: z.string().optional(),
  category: z.string().optional(),
});

export type NewChecklistData = z.infer<typeof addChecklistFormSchema>;

interface AddChecklistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChecklistAdded: (data: NewChecklistData) => void;
  existingCategories: string[]; // Para sugerencias o futuro autocompletado
}

export function AddChecklistDialog({ open, onOpenChange, onChecklistAdded, existingCategories }: AddChecklistDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<NewChecklistData>({
    resolver: zodResolver(addChecklistFormSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: "",
        description: "",
        category: "",
      });
    }
  }, [open, form]);

  async function onSubmit(values: NewChecklistData) {
    setIsSubmitting(true);
    // Simular guardado (no hay backend real aquí)
    try {
      // Aquí llamarías a tu servicio para crear el checklist
      // await createChecklistService(values); 
      
      onChecklistAdded(values);
      toast({
        title: "Checklist Creado",
        description: `El checklist "${values.name}" ha sido creado exitosamente.`,
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating checklist:", error);
      toast({
        title: "Error al Crear Checklist",
        description: error instanceof Error ? error.message : "No se pudo crear el checklist.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <FilePlus2 className="mr-2 h-5 w-5 text-primary" /> Crear Nuevo Checklist
          </DialogTitle>
          <DialogDescription>
            Complete los detalles para el nuevo checklist. Podrá agregar los ítems específicos después de crearlo.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Checklist</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Inspección Vehicular Diaria" {...field} />
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
                    <Textarea placeholder="Detalles sobre el propósito o alcance del checklist..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoría (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Vehicular, Equipos ERA, Procedimientos" {...field} list="existing-categories" />
                  </FormControl>
                  <datalist id="existing-categories">
                    {existingCategories.map(cat => <option key={cat} value={cat} />)}
                  </datalist>
                  <FormDescription>
                    Puede escribir una nueva categoría o seleccionar una existente.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Crear Checklist"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
