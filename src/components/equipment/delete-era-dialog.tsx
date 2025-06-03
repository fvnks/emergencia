
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { deleteEraEquipment } from "@/services/eraService";
import type { EraEquipment } from "./era-types";
import { Loader2, Trash2 } from "lucide-react";

interface DeleteEraDialogProps {
  era: EraEquipment | null;
  onEraDeleted: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteEraDialog({ era, onEraDeleted, open, onOpenChange }: DeleteEraDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!era) return;
    setIsDeleting(true);
    try {
      await deleteEraEquipment(era.id_era);
      toast({
        title: "Equipo ERA Eliminado",
        description: `El equipo ERA "${era.codigo_era}" ha sido eliminado.`,
      });
      onEraDeleted();
      onOpenChange(false);
    } catch (error) {
      console.error("Error deleting ERA equipment:", error);
      toast({
        title: "Error al Eliminar ERA",
        description: error instanceof Error ? error.message : "No se pudo eliminar el equipo.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (!era) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Estás seguro de eliminar este equipo ERA?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Se eliminará permanentemente el equipo
            <strong> {era.marca} {era.modelo} (Código: {era.codigo_era})</strong>.
            Si está asignado, primero deberá desasignarse.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting} onClick={() => onOpenChange(false)}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isDeleting || !!era.id_usuario_asignado} className="bg-destructive hover:bg-destructive/90">
            {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
            Eliminar Equipo
          </AlertDialogAction>
        </AlertDialogFooter>
        {era.id_usuario_asignado && (
            <p className="text-sm text-destructive text-center mt-2">
                Este ERA está asignado. Debes desasignarlo antes de poder eliminarlo.
            </p>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}
