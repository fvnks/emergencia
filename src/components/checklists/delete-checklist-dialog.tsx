
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
import { Loader2, Trash2 } from "lucide-react";
import type { Checklist } from "@/app/(app)/checklists/page"; // Importar el tipo Checklist

interface DeleteChecklistDialogProps {
  checklist: Checklist | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmDelete: () => void;
}

export function DeleteChecklistDialog({
  checklist,
  open,
  onOpenChange,
  onConfirmDelete,
}: DeleteChecklistDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false); // Aunque no se use directamente para un backend, es buena práctica mantenerlo

  const handleAction = async () => {
    setIsDeleting(true);
    // Aquí no hay llamada a backend, solo se llama al callback
    onConfirmDelete();
    // El setIsDeleting y onOpenChange(false) se manejan en el callback o después de que el callback complete
    // Por ahora, asumimos que el callback cierra el diálogo y resetea estados.
    // Si la eliminación fuese asíncrona, este sería el lugar para manejar isDeleting.
  };

  if (!checklist) return null;

  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => {
      if (isDeleting && !isOpen) return; // Prevenir cerrar mientras se "elimina"
      onOpenChange(isOpen);
    }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Estás seguro de eliminar este checklist?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Se eliminará permanentemente el checklist{" "}
            <strong>"{checklist.name}"</strong>.
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
            Eliminar Checklist
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
