
"use client";

import type { Checklist } from "@/app/(app)/checklists/page";
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Detalles del Checklist: {checklist.name}</DialogTitle>
          <DialogDescription>
            Información completa del checklist seleccionado.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-4 max-h-[60vh] overflow-y-auto pr-3">
          <DetailItem label="Nombre" value={checklist.name} />
          {checklist.description && (
            <DetailItem label="Descripción" value={<p className="whitespace-pre-wrap">{checklist.description}</p>} />
          )}
          <DetailItem label="Categoría" value={checklist.category ? <Badge variant="outline">{checklist.category}</Badge> : "N/A"} />
          <DetailItem label="Estado" value={
            <Badge variant={checklist.status === 'Completado' ? 'default' : checklist.status === 'En Progreso' ? 'secondary' : 'outline'} className={cn("text-xs", getStatusBadgeClassName(checklist.status))}>
              {checklist.status}
            </Badge>
          } />
          <DetailItem label="Nº de Ítems" value={checklist.itemCount.toString()} />
          <DetailItem label="Últ. Modificación" value={format(parseISO(checklist.lastModified), "dd MMM, yyyy HH:mm", { locale: es })} />
        
          <div className="pt-4 mt-4 border-t">
            <h4 className="text-md font-semibold mb-2">Ítems del Checklist</h4>
            {checklist.itemCount > 0 ? (
                <p className="text-sm text-muted-foreground">
                La visualización y completitud de los {checklist.itemCount} ítems se implementará aquí próximamente.
                </p>
            ) : (
                <p className="text-sm text-muted-foreground">
                Este checklist aún no tiene ítems definidos.
                </p>
            )}
          </div>
        </div>
        <DialogFooter className="pt-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

    