
"use client";

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
import { Button } from "@/components/ui/button";
import type { Role } from "@/app/(app)/settings/roles-permissions/page"; // Ajusta la ruta si es necesario
import { Loader2, Trash2 } from "lucide-react";
import { useState } from "react";

interface DeleteRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: Role | null;
  onConfirmDelete: () => void;
}

export function DeleteRoleDialog({
  open,
  onOpenChange,
  role,
  onConfirmDelete,
}: DeleteRoleDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleAction = async () => {
    setIsDeleting(true);
    // Simular una operación asíncrona si es necesario para el backend
    // En este caso, solo llamamos a la confirmación que actualiza el estado local
    onConfirmDelete();
    setIsDeleting(false);
    onOpenChange(false); // Cerrar el diálogo después de la acción
  };

  if (!role) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Estás seguro de eliminar este rol?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Se eliminará el rol{" "}
            <strong>{role.name}</strong>. Los usuarios con este rol podrían necesitar
            que se les asigne uno nuevo.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => onOpenChange(false)} disabled={isDeleting}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleAction}
            disabled={isDeleting}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isDeleting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="mr-2 h-4 w-4" />
            )}
            Eliminar Rol
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
