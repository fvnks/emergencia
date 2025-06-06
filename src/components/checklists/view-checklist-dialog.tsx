
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
import { useState, useEffect } from "react"; // Importar useState y useEffect
import { ScrollArea } from "@/components/ui/scroll-area"; // Para una lista potencialmente larga de ítems

interface ViewChecklistDialogProps {
  checklist: Checklist | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ChecklistItemSimulated {
  id: string;
  text: string;
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
  const [simulatedItems, setSimulatedItems] = useState<ChecklistItemSimulated[]>([]);

  useEffect(() => {
    if (checklist && checklist.itemCount > 0) {
      const items: ChecklistItemSimulated[] = [];
      for (let i = 0; i < checklist.itemCount; i++) {
        items.push({
          id: `sim-${checklist.id}-${i}`,
          text: `Ítem de ejemplo número ${i + 1} para el checklist "${checklist.name}"`,
        });
      }
      setSimulatedItems(items);
    } else {
      setSimulatedItems([]);
    }
  }, [checklist]);

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
      <DialogContent className="sm:max-w-lg md:max-w-xl">
        <DialogHeader>
          <DialogTitle>Detalles del Checklist: {checklist.name}</DialogTitle>
          <DialogDescription>
            Información completa del checklist seleccionado.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] pr-3">
          <div className="space-y-2 py-4">
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
              {simulatedItems.length > 0 ? (
                  <ul className="space-y-1.5 list-disc list-inside pl-2">
                    {simulatedItems.map(item => (
                      <li key={item.id} className="text-sm text-muted-foreground">
                        {item.text}
                      </li>
                    ))}
                  </ul>
              ) : (
                  <p className="text-sm text-muted-foreground">
                  Este checklist aún no tiene ítems definidos o el contador es cero.
                  </p>
              )}
              {checklist.itemCount > 0 && (
                <p className="text-xs text-muted-foreground mt-3">
                    (La funcionalidad para completar y gestionar ítems se implementará próximamente).
                </p>
              )}
            </div>
          </div>
        </ScrollArea>
        <DialogFooter className="pt-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
