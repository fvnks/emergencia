
"use client";

import type { Checklist } from "@/app/(app)/checklists/page";
import { VEHICLE_STANDARD_ITEMS, ERA_STANDARD_ITEMS } from "@/app/(app)/checklists/page";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area"; 
import { Truck, ShieldAlert } from "lucide-react";

interface ViewChecklistDialogProps {
  checklist: Checklist | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DetailItem: React.FC<{ label: string; value?: string | null | React.ReactNode }> = ({ label, value }) => (
  <div className="grid grid-cols-3 gap-2 py-2 border-b border-muted/50 last:border-b-0 items-start">
    <Label htmlFor={label.toLowerCase().replace(/\s/g, '-')} className="text-sm font-medium text-muted-foreground">
      {label}:
    </Label>
    <div id={label.toLowerCase().replace(/\s/g, '-')} className="col-span-2 text-sm">
      {value || <span className="italic text-muted-foreground">N/A</span>}
    </div>
  </div>
);

export function ViewChecklistDialog({ checklist, open, onOpenChange }: ViewChecklistDialogProps) {

  if (!checklist) return null;

  const getStatusBadgeClassName = (status: Checklist['status']) => {
    switch (status) {
      case 'Completado': return 'bg-green-500 text-white hover:bg-green-600';
      case 'En Progreso': return 'bg-yellow-500 text-black hover:bg-yellow-600';
      case 'Nuevo': return 'border-primary text-primary hover:bg-primary/10';
      default: return 'border-muted text-muted-foreground';
    }
  };

  const itemsToDisplay = checklist.assetType === 'Vehicle' 
    ? VEHICLE_STANDARD_ITEMS 
    : checklist.assetType === 'ERA' 
    ? ERA_STANDARD_ITEMS 
    : checklist.items;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg md:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            Checklist: {checklist.name}
            {checklist.assetName && (
                <span className="block text-base font-normal text-muted-foreground flex items-center mt-1">
                    {checklist.assetType === 'Vehicle' ? <Truck className="h-4 w-4 mr-1.5"/> : <ShieldAlert className="h-4 w-4 mr-1.5"/>}
                    Activo: {checklist.assetName}
                </span>
            )}
            </DialogTitle>
          <DialogDescription>
            {checklist.assetId 
              ? `Realice la revisión para ${checklist.assetName}. Seleccione una fecha y complete los ítems.`
              : "Información completa del checklist seleccionado."}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] pr-3">
          <div className="space-y-2 py-4">
            {!checklist.assetId && ( // Mostrar estos detalles solo para plantillas generales
              <>
                <DetailItem label="Nombre Plantilla" value={checklist.name} />
                {checklist.description && (
                  <DetailItem label="Descripción Plantilla" value={<p className="whitespace-pre-wrap">{checklist.description}</p>} />
                )}
                <DetailItem label="Categoría Plantilla" value={checklist.category ? <Badge variant="outline">{checklist.category}</Badge> : "N/A"} />
              </>
            )}
            <DetailItem label="Estado Plantilla" value={
              <Badge variant={checklist.status === 'Completado' ? 'default' : checklist.status === 'En Progreso' ? 'secondary' : 'outline'} className={cn("text-xs", getStatusBadgeClassName(checklist.status))}>
                {checklist.status}
              </Badge>
            } />
            <DetailItem label="Nº de Ítems" value={itemsToDisplay.length.toString()} />
            <DetailItem label="Últ. Modificación Plantilla" value={format(parseISO(checklist.lastModified), "dd MMM, yyyy HH:mm", { locale: es })} />
          
            <div className="pt-4 mt-4 border-t">
              <h4 className="text-md font-semibold mb-2">Ítems del Checklist</h4>
              {(itemsToDisplay && itemsToDisplay.length > 0) ? (
                  <ul className="space-y-1.5 list-decimal list-inside pl-2">
                    {itemsToDisplay.map((item, index) => (
                      <li key={`${checklist.id}-item-${index}`} className="text-sm">
                        {item}
                        {/* Aquí irían los inputs para marcar OK/No OK, notas por ítem, etc. */}
                      </li>
                    ))}
                  </ul>
              ) : (
                  <p className="text-sm text-muted-foreground">
                  Este checklist aún no tiene ítems definidos.
                  </p>
              )}
              {itemsToDisplay.length > 0 && (
                <p className="text-xs text-muted-foreground mt-3">
                    (La funcionalidad para seleccionar fecha de revisión y completar los ítems se implementará próximamente).
                </p>
              )}
            </div>
          </div>
        </ScrollArea>
        <DialogFooter className="pt-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
          {/* El botón "Guardar Completitud" iría aquí cuando se implemente */}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
