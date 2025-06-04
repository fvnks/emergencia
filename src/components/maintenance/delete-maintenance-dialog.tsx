
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
import { deleteMaintenanceTask } from "@/services/maintenanceService";
import type { MaintenanceTask } from "@/types/maintenanceTypes";
import { Loader2, Trash2 } from "lucide-react";

interface DeleteMaintenanceDialogProps {
  task: MaintenanceTask | null;
  onTaskDeleted: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteMaintenanceDialog({ task, onTaskDeleted, open, onOpenChange }: DeleteMaintenanceDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!task) return;
    setIsDeleting(true);
    try {
      await deleteMaintenanceTask(task.id_mantencion);
      toast({
        title: "Tarea de Mantención Eliminada",
        description: `La tarea "${task.nombre_item_mantenimiento}" ha sido eliminada.`,
      });
      onTaskDeleted();
      onOpenChange(false);
    } catch (error) {
      console.error("Error deleting maintenance task:", error);
      toast({
        title: "Error al Eliminar Tarea",
        description: error instanceof Error ? error.message : "No se pudo eliminar la tarea de mantención.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (!task) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Estás seguro de eliminar esta tarea de mantención?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Se eliminará permanentemente la tarea de mantención para
            <strong> {task.nombre_item_mantenimiento} (ID: {task.id_mantencion})</strong>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting} onClick={() => onOpenChange(false)}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
            {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
            Eliminar Tarea
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
