
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { deleteUser } from "@/services/userService";
import type { User } from "@/services/userService";
import { Loader2, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

interface DeletePersonnelDialogProps {
  person: User;
  onPersonnelDeleted: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeletePersonnelDialog({
  person,
  onPersonnelDeleted,
  open,
  onOpenChange,
}: DeletePersonnelDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const { user: currentUser } = useAuth();

  const handleDelete = async () => {
    if (currentUser?.id === person.id_usuario) {
      toast({
        title: "Acción no permitida",
        description: "No puedes eliminar tu propia cuenta de usuario.",
        variant: "destructive",
      });
      onOpenChange(false);
      return;
    }

    setIsDeleting(true);
    try {
      await deleteUser(person.id_usuario);
      toast({
        title: "Personal Eliminado",
        description: `El usuario ${person.nombre_completo} ha sido eliminado exitosamente.`,
      });
      onPersonnelDeleted();
      onOpenChange(false);
    } catch (error) {
      console.error("Error deleting personnel:", error);
      let errorMessage = "No se pudo eliminar el usuario.";
      if (error instanceof Error) {
        // Podríamos verificar códigos de error específicos de BD aquí si es necesario
        if (error.message.includes('ER_ROW_IS_REFERENCED_2') || error.message.toLowerCase().includes('foreign key constraint fails')) {
            errorMessage = `No se puede eliminar ${person.nombre_completo} porque está referenciado en otros registros (ej. tareas creadas). Reasigne o elimine esos registros primero.`;
        } else {
            errorMessage = error.message;
        }
      }
      toast({
        title: "Error al Eliminar Personal",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Estás seguro de eliminar a este usuario?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Se eliminará permanentemente el registro de{" "}
            <strong>{person.nombre_completo}</strong> del sistema.
             Si este usuario ha creado tareas u otros registros, es posible que no se pueda eliminar hasta que dichos registros sean reasignados o eliminados.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
            {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
            Eliminar Usuario
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
