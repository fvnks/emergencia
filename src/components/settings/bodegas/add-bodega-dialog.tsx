
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { createBodega, type BodegaCreateInput } from "@/services/bodegaService";
import { Loader2, PlusCircle, Warehouse } from "lucide-react";

const addBodegaFormSchema = z.object({
  nombre_bodega: z.string().min(3, { message: "El nombre debe tener al menos 3 caracteres." }),
  direccion_bodega: z.string().min(5, { message: "La dirección debe tener al menos 5 caracteres." }),
  descripcion_bodega: z.string().optional(),
});

type AddBodegaFormValues = z.infer<typeof addBodegaFormSchema>;

interface AddBodegaDialogProps {
  onBodegaAdded: () => void;
  triggerButton?: React.ReactNode; 
}

export function AddBodegaDialog({ onBodegaAdded, triggerButton }: AddBodegaDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<AddBodegaFormValues>({
    resolver: zodResolver(addBodegaFormSchema),
    defaultValues: {
      nombre_bodega: "",
      direccion_bodega: "",
      descripcion_bodega: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        nombre_bodega: "",
        direccion_bodega: "",
        descripcion_bodega: "",
      });
    }
  }, [isOpen, form]);

  async function onSubmit(values: AddBodegaFormValues) {
    setIsSubmitting(true);
    try {
      const createData: BodegaCreateInput = {
        nombre_bodega: values.nombre_bodega,
        direccion_bodega: values.direccion_bodega,
        descripcion_bodega: values.descripcion_bodega || undefined,
      };
      await createBodega(createData);
      toast({
        title: "Bodega Agregada",
        description: `La bodega ${values.nombre_bodega} ha sido creada exitosamente.`,
      });
      onBodegaAdded();
      setIsOpen(false);
    } catch (error) {
      console.error("Error creando bodega:", error);
      toast({
        title: "Error al Agregar Bodega",
        description: error instanceof Error ? error.message : "No se pudo crear la bodega.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {triggerButton ? triggerButton : (
          <Button> {/* Eliminado onClick={() => setIsOpen(true)} */}
            <PlusCircle className="mr-2 h-5 w-5" /> Agregar Nueva Bodega
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center"><Warehouse className="mr-2 h-5 w-5 text-primary" /> Agregar Nueva Bodega</DialogTitle>
          <DialogDescription>
            Complete los campos para registrar una nueva bodega o centro de almacenamiento.
          </DialogDescription>
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
                    <Input placeholder="Ej: Bodega Central, Taller Principal" {...field} />
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
                    <Input placeholder="Ej: Av. Siempre Viva 742, Springfield" {...field} />
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
                    <Textarea placeholder="Detalles adicionales sobre la bodega, tipo de almacenamiento, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Agregar Bodega"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
