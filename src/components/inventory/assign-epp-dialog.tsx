
"use client";

import type { InventoryItem } from "@/services/inventoryService";
import type { User } from "@/services/userService";
import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
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
  DialogTrigger, // Will be controlled from parent page
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
import { assignEppToUser, type EppAssignmentCreateInput } from "@/services/eppAssignmentService";
import { getAllUsers } from "@/services/userService";
import { useAuth } from "@/contexts/auth-context";
import { Loader2, UserPlus } from "lucide-react";
import { format } from 'date-fns';


const assignEppFormSchema = z.object({
  id_usuario: z.string().min(1, { message: "Debe seleccionar un usuario." }),
  cantidad_asignada: z.coerce.number().min(1, { message: "La cantidad debe ser al menos 1." }),
  fecha_asignacion: z.string().min(1, { message: "La fecha de asignación es requerida." }),
  notas: z.string().optional(),
});

type AssignEppFormValues = z.infer<typeof assignEppFormSchema>;

interface AssignEppDialogProps {
  item: InventoryItem; // El EPP a asignar
  onEppAssigned: () => void; // Callback para refrescar datos en la página de inventario
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AssignEppDialog({ item, onEppAssigned, open, onOpenChange }: AssignEppDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const { toast } = useToast();
  const { user: currentUser } = useAuth(); // Para obtener el ID del usuario responsable

  const form = useForm<AssignEppFormValues>({
    resolver: zodResolver(assignEppFormSchema),
    defaultValues: {
      id_usuario: "",
      cantidad_asignada: 1,
      fecha_asignacion: format(new Date(), 'yyyy-MM-dd'),
      notas: "",
    },
  });

  useEffect(() => {
    async function fetchUsers() {
      try {
        const fetchedUsers = await getAllUsers();
        setUsers(fetchedUsers);
      } catch (error) {
        console.error("Error fetching users for EPP assignment:", error);
        toast({
          title: "Error al cargar usuarios",
          description: "No se pudieron cargar los usuarios para la asignación.",
          variant: "destructive",
        });
      }
    }
    if (open) {
      fetchUsers();
      form.reset({ // Reset form when dialog opens or item changes
        id_usuario: "",
        cantidad_asignada: 1,
        fecha_asignacion: format(new Date(), 'yyyy-MM-dd'),
        notas: "",
      });
    }
  }, [open, item, toast, form]);

  async function onSubmit(values: AssignEppFormValues) {
    if (!currentUser) {
      toast({ title: "Error", description: "Usuario no autenticado.", variant: "destructive" });
      return;
    }
    if (!item) {
      toast({ title: "Error", description: "No se ha seleccionado un ítem EPP.", variant: "destructive" });
      return;
    }
    if (values.cantidad_asignada > item.cantidad_actual) {
        form.setError("cantidad_asignada", { 
            type: "manual", 
            message: `Cantidad excede el stock disponible (${item.cantidad_actual} ${item.unidad_medida}).`
        });
        return;
    }


    setIsSubmitting(true);
    try {
      const assignmentData: EppAssignmentCreateInput = {
        id_usuario: parseInt(values.id_usuario, 10),
        id_item_epp: item.id_item,
        cantidad_asignada: values.cantidad_asignada,
        fecha_asignacion: values.fecha_asignacion, // Ensure format is YYYY-MM-DD
        notas: values.notas || undefined,
      };
      
      await assignEppToUser(assignmentData, currentUser.id);
      
      toast({
        title: "EPP Asignado",
        description: `${values.cantidad_asignada} ${item.unidad_medida} de ${item.nombre_item} asignado(s) exitosamente.`,
      });
      onEppAssigned();
      onOpenChange(false);
    } catch (error) {
      console.error("Error assigning EPP:", error);
      toast({
        title: "Error al Asignar EPP",
        description: error instanceof Error ? error.message : "No se pudo completar la asignación.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (isSubmitting && !isOpen) return;
      onOpenChange(isOpen);
    }}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Asignar EPP: {item.nombre_item}</DialogTitle>
          <DialogDescription>
            Seleccione el usuario y la cantidad a asignar. Stock Actual: {item.cantidad_actual} {item.unidad_medida}.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2 max-h-[70vh] overflow-y-auto pr-2">
            <FormField
              control={form.control}
              name="id_usuario"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Asignar a Usuario</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione un usuario" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id_usuario} value={user.id_usuario.toString()}>
                          {user.nombre_completo} ({user.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="cantidad_asignada"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cantidad a Asignar</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} max={item.cantidad_actual} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fecha_asignacion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha de Asignación</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notas"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Condición del EPP, observaciones..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting || users.length === 0}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
                Asignar EPP
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
