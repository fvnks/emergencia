
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
import { deleteInventoryItem, type InventoryItem } from "@/services/inventoryService";
import { Loader2, Trash2 } from "lucide-react";

interface DeleteInventoryItemDialogProps {
  item: InventoryItem;
  onItemDeleted: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteInventoryItemDialog({
  item,
  onItemDeleted,
  open,
  onOpenChange,
}: DeleteInventoryItemDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteInventoryItem(item.id_item);
      toast({
        title: "Ítem Eliminado",
        description: `El ítem "${item.nombre_item}" ha sido eliminado exitosamente del inventario.`,
      });
      onItemDeleted();
      onOpenChange(false);
    } catch (error) {
      console.error("Error deleting inventory item:", error);
      toast({
        title: "Error al Eliminar Ítem",
        description: error instanceof Error ? error.message : "No se pudo eliminar el ítem.",
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
          <AlertDialogTitle>¿Estás seguro de eliminar este ítem?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Se eliminará permanentemente el ítem{" "}
            <strong>{item.nombre_item} (Código: {item.codigo_item})</strong> del inventario.
            Si el ítem tiene movimientos registrados, es posible que no se pueda eliminar.
            Si es un EPP asignado, la asignación también se eliminará.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
            {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
            Eliminar Ítem
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
