
"use client";

import type { Dispatch, SetStateAction } from 'react';
import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { createUser, UserCreateInput, UserRole } from "@/services/userService";
import { Loader2, PlusCircle } from "lucide-react";

const formSchema = z.object({
  nombre_completo: z.string().min(3, { message: "El nombre debe tener al menos 3 caracteres." }),
  email: z.string().email({ message: "Correo electrónico inválido." }),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres." }),
  confirmPassword: z.string().min(6, { message: "La confirmación debe tener al menos 6 caracteres." }),
  rol: z.enum(["admin", "usuario"], { required_error: "Debe seleccionar un rol." }),
  telefono: z.string().optional(),
  avatar_seed: z.string().max(2, { message: "El seed para avatar debe tener máximo 2 caracteres."}).optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden.",
  path: ["confirmPassword"],
});

type AddPersonnelFormValues = z.infer<typeof formSchema>;

interface AddPersonnelDialogProps {
  onPersonnelAdded: () => void;
}

export function AddPersonnelDialog({ onPersonnelAdded }: AddPersonnelDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<AddPersonnelFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre_completo: "",
      email: "",
      password: "",
      confirmPassword: "",
      rol: "usuario",
      telefono: "",
      avatar_seed: "",
    },
  });

  async function onSubmit(values: AddPersonnelFormValues) {
    setIsSubmitting(true);
    try {
      const createData: UserCreateInput = {
        nombre_completo: values.nombre_completo,
        email: values.email,
        password_plaintext: values.password,
        rol: values.rol as UserRole,
        telefono: values.telefono || undefined,
        avatar_seed: values.avatar_seed || undefined,
      };
      await createUser(createData);
      toast({
        title: "Personal Agregado",
        description: `El usuario ${values.nombre_completo} ha sido creado exitosamente.`,
      });
      onPersonnelAdded();
      form.reset();
      setIsOpen(false);
    } catch (error) {
      console.error("Error creating personnel:", error);
      let errorMessage = "No se pudo crear el usuario.";
      if (error instanceof Error) {
        if (error.message.includes('El correo electrónico ya está registrado')) {
            errorMessage = "El correo electrónico ya está registrado. Intente con otro."
        } else {
            errorMessage = error.message;
        }
      }
      toast({
        title: "Error al Agregar Personal",
        description: errorMessage,
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
          <PlusCircle className="mr-2 h-5 w-5" /> Agregar Nuevo Personal
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Agregar Nuevo Personal</DialogTitle>
          <DialogDescription>
            Complete los campos para registrar un nuevo miembro del personal.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
            <FormField
              control={form.control}
              name="nombre_completo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Juan Alberto Pérez Soto" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo Electrónico</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="juan.perez@ejemplo.cl" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Confirmar Contraseña</FormLabel>
                    <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            <FormField
              control={form.control}
              name="rol"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rol</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione un rol" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="usuario">Usuario</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="telefono"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Teléfono (Opcional)</FormLabel>
                    <FormControl>
                        <Input placeholder="Ej: 912345678" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="avatar_seed"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Seed Avatar (Opcional, 2 letras)</FormLabel>
                    <FormControl>
                        <Input placeholder="Ej: JP" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Agregar Personal"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

