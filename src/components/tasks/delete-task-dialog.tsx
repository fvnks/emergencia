
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
import { deleteTask, type Task } from "@/services/taskService";
import { Loader2, Trash2 } from "lucide-react";

interface DeleteTaskDialogProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskDeleted: () => void;
}

export function DeleteTaskDialog({ task, open, onOpenChange, onTaskDeleted }: DeleteTaskDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!task) return;
    setIsDeleting(true);
    try {
      await deleteTask(task.id_tarea);
      toast({
        title: "Tarea Eliminada",
        description: `La tarea T-${task.id_tarea.toString().padStart(3, '0')} ha sido eliminada exitosamente.`,
      });
      onTaskDeleted();
      onOpenChange(false);
    } catch (error) {
      console.error("Error deleting task:", error);
      toast({
        title: "Error al Eliminar Tarea",
        description: error instanceof Error ? error.message : "No se pudo eliminar la tarea.",
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
          <AlertDialogTitle>¿Estás seguro de eliminar esta tarea?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Se eliminará permanentemente la tarea{" "}
            <strong>T-{task.id_tarea.toString().padStart(3, '0')}</strong>: "{task.descripcion_tarea}".
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting} onClick={() => onOpenChange(false)}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
            {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
            Eliminar Tarea
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
