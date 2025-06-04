
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
import { deleteBodega } from "@/services/bodegaService";
import type { Bodega } from "@/services/bodegaService";
import { Loader2, Trash2, Warehouse } from "lucide-react";

interface DeleteBodegaDialogProps {
  bodega: Bodega | null;
  onBodegaDeleted: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteBodegaDialog({ bodega, onBodegaDeleted, open, onOpenChange }: DeleteBodegaDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!bodega) return;
    setIsDeleting(true);
    try {
      await deleteBodega(bodega.id_bodega);
      toast({
        title: "Bodega Eliminada",
        description: `La bodega "${bodega.nombre_bodega}" ha sido eliminada.`,
      });
      onBodegaDeleted();
      onOpenChange(false);
    } catch (error) {
      console.error("Error eliminando bodega:", error);
      toast({
        title: "Error al Eliminar Bodega",
        description: error instanceof Error ? error.message : "No se pudo eliminar la bodega.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (!bodega) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center"><Warehouse className="mr-2 h-5 w-5 text-destructive" /> ¿Eliminar Bodega?</AlertDialogTitle>
          <AlertDialogDescription>
            ¿Estás seguro de eliminar la bodega <strong>{bodega.nombre_bodega}</strong>?
            Esta acción no se puede deshacer. Si hay ítems de inventario asignados a esta bodega,
            primero deberás reubicarlos o la eliminación podría fallar.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting} onClick={() => onOpenChange(false)}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
            {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
            Eliminar Bodega
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
