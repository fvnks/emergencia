
"use client";

import { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { updateVehicle } from "@/services/vehicleService";
import type { Vehicle } from "@/types/vehicleTypes";
import { getAllEraEquipments, type EraEquipment } from "@/services/eraService";
import { Loader2, Search, ShieldAlert } from "lucide-react";

const manageVehicleEraSchema = z.object({
  assignedEraIds: z.array(z.number()).optional(),
});

type ManageVehicleEraFormValues = z.infer<typeof manageVehicleEraSchema>;

interface ManageVehicleEraDialogProps {
  vehicle: Vehicle | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAssignmentsUpdated: () => void; // Callback to refresh vehicle data
}

export function ManageVehicleEraDialog({ vehicle, open, onOpenChange, onAssignmentsUpdated }: ManageVehicleEraDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allEraEquipments, setAllEraEquipments] = useState<EraEquipment[]>([]);
  const [loadingEras, setLoadingEras] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const form = useForm<ManageVehicleEraFormValues>({
    resolver: zodResolver(manageVehicleEraSchema),
    defaultValues: {
      assignedEraIds: [],
    },
  });

  useEffect(() => {
    async function fetchEras() {
      if (open && vehicle) {
        setLoadingEras(true);
        try {
          const eras = await getAllEraEquipments();
          // ERAs disponibles son los 'Disponibles' O los que ya están asignados a ESTE vehículo
          const availableForAssignment = eras.filter(
            (era) => era.estado_era === 'Disponible' || vehicle.assignedEraIds?.includes(era.id_era)
          );
          setAllEraEquipments(availableForAssignment);
          form.reset({ assignedEraIds: vehicle.assignedEraIds || [] });
        } catch (error) {
          console.error("Error fetching ERA equipments:", error);
          toast({
            title: "Error al cargar equipos ERA",
            description: "No se pudieron cargar los equipos ERA disponibles.",
            variant: "destructive",
          });
        } finally {
          setLoadingEras(false);
        }
      }
    }
    fetchEras();
  }, [open, vehicle, form, toast]);

  const filteredEras = useMemo(() => {
    if (!searchTerm) return allEraEquipments;
    return allEraEquipments.filter(era =>
      era.codigo_era.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (era.marca && era.marca.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (era.modelo && era.modelo.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [allEraEquipments, searchTerm]);

  async function onSubmit(values: ManageVehicleEraFormValues) {
    if (!vehicle) return;
    setIsSubmitting(true);
    try {
      await updateVehicle(vehicle.id_vehiculo, { assignedEraIds: values.assignedEraIds || [] });
      toast({
        title: "Asignaciones ERA Actualizadas",
        description: `Los equipos ERA para ${vehicle.marca} ${vehicle.modelo} han sido actualizados.`,
      });
      onAssignmentsUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating ERA assignments:", error);
      toast({
        title: "Error al Actualizar Asignaciones",
        description: error instanceof Error ? error.message : "No se pudieron actualizar las asignaciones ERA.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!vehicle) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <ShieldAlert className="mr-2 h-5 w-5 text-primary" />
            Gestionar Equipos ERA para {vehicle.marca} {vehicle.modelo}
          </DialogTitle>
          <DialogDescription>
            Seleccione o deseleccione los equipos ERA asignados a este vehículo.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar ERA por código, marca..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            {loadingEras ? (
              <div className="flex justify-center items-center h-32">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : filteredEras.length > 0 ? (
              <ScrollArea className="h-60 rounded-md border p-3">
                <FormField
                  control={form.control}
                  name="assignedEraIds"
                  render={() => (
                    <FormItem>
                      {filteredEras.map((era) => (
                        <FormField
                          key={era.id_era}
                          control={form.control}
                          name="assignedEraIds"
                          render={({ field }) => {
                            return (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0 py-1.5">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(era.id_era)}
                                    onCheckedChange={(checked) => {
                                      const currentAssignedIds = field.value || [];
                                      return checked
                                        ? field.onChange([...currentAssignedIds, era.id_era])
                                        : field.onChange(currentAssignedIds.filter((id) => id !== era.id_era));
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal text-sm leading-snug">
                                  {era.codigo_era} - {era.marca} {era.modelo || ''}
                                  <span className="block text-xs text-muted-foreground">
                                    S/N: {era.numero_serie || 'N/A'} - Estado: {era.estado_era}
                                    {vehicle.assignedEraIds?.includes(era.id_era) && era.estado_era !== 'Disponible' && (
                                      <span className="text-destructive"> (Actualmente asignado a este vehículo)</span>
                                    )}
                                  </span>
                                </FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                    </FormItem>
                  )}
                />
              </ScrollArea>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                {allEraEquipments.length === 0 ? "No hay equipos ERA disponibles o asignables." : "No hay equipos ERA que coincidan con la búsqueda."}
              </p>
            )}
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting || loadingEras}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Guardar Cambios"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
