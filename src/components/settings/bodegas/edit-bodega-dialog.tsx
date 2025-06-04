
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { updateBodega, type Bodega, type BodegaUpdateInput } from "@/services/bodegaService";
import { Loader2, Edit, Warehouse } from "lucide-react";

const editBodegaFormSchema = z.object({
  nombre_bodega: z.string().min(3, { message: "El nombre debe tener al menos 3 caracteres." }),
  direccion_bodega: z.string().min(5, { message: "La dirección debe tener al menos 5 caracteres." }),
  descripcion_bodega: z.string().nullable().optional(),
});

type EditBodegaFormValues = z.infer<typeof editBodegaFormSchema>;

interface EditBodegaDialogProps {
  bodega: Bodega | null;
  onBodegaUpdated: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditBodegaDialog({ bodega, onBodegaUpdated, open, onOpenChange }: EditBodegaDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<EditBodegaFormValues>({
    resolver: zodResolver(editBodegaFormSchema),
  });

  useEffect(() => {
    if (bodega && open) {
      form.reset({
        nombre_bodega: bodega.nombre_bodega,
        direccion_bodega: bodega.direccion_bodega,
        descripcion_bodega: bodega.descripcion_bodega || "",
      });
    }
  }, [bodega, open, form]);

  async function onSubmit(values: EditBodegaFormValues) {
    if (!bodega) return;
    setIsSubmitting(true);
    try {
      const updateData: BodegaUpdateInput = {
        nombre_bodega: values.nombre_bodega,
        direccion_bodega: values.direccion_bodega,
        descripcion_bodega: values.descripcion_bodega || null,
      };
      await updateBodega(bodega.id_bodega, updateData);
      toast({
        title: "Bodega Actualizada",
        description: `La bodega ${values.nombre_bodega} ha sido actualizada.`,
      });
      onBodegaUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error("Error actualizando bodega:", error);
      toast({
        title: "Error al Actualizar Bodega",
        description: error instanceof Error ? error.message : "No se pudo actualizar la bodega.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!bodega) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center"><Warehouse className="mr-2 h-5 w-5 text-primary" /> Editar Bodega: {bodega.nombre_bodega}</DialogTitle>
          <DialogDescription>Modifique los campos para actualizar los datos de la bodega.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
            <FormField
              control={form.control}
              name="nombre_bodega"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de la Bodega</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="direccion_bodega"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dirección de la Bodega</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="descripcion_bodega"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancelar</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <><Edit className="mr-2 h-4 w-4" /> Actualizar Bodega</>}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
