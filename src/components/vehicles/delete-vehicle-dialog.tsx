
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { deleteVehicle } from "@/services/vehicleService";
import type { Vehicle } from "@/types/vehicleTypes";
import { Loader2, Trash2 } from "lucide-react";

interface DeleteVehicleDialogProps {
  vehicle: Vehicle | null;
  onVehicleDeleted: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteVehicleDialog({ vehicle, onVehicleDeleted, open, onOpenChange }: DeleteVehicleDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!vehicle) return;
    setIsDeleting(true);
    try {
      await deleteVehicle(vehicle.id_vehiculo);
      toast({
        title: "Vehículo Eliminado",
        description: `El vehículo "${vehicle.marca} ${vehicle.modelo}" ha sido eliminado.`,
      });
      onVehicleDeleted();
      onOpenChange(false);
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      toast({
        title: "Error al Eliminar Vehículo",
        description: error instanceof Error ? error.message : "No se pudo eliminar el vehículo.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (!vehicle) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Estás seguro de eliminar este vehículo?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Se eliminará permanentemente el vehículo 
            <strong> {vehicle.marca} {vehicle.modelo} (Patente: {vehicle.patente || 'N/A'})</strong>.
            Si este vehículo tiene mantenimientos u otros registros asociados, es posible que primero deba desvincularlos.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting} onClick={() => onOpenChange(false)}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
            {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
            Eliminar Vehículo
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
