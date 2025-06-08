
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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { format, parseISO, isValid } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Truck, ShieldAlert, CalendarIcon, FileText, Save } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import type { ChecklistItemState } from "@/types/checklistTypes";

export interface ViewChecklistCompletionData {
  checklistId: string;
  assetName?: string;
  completionDate: Date;
  notes: string;
  itemStates: ChecklistItemState[];
}
interface ViewChecklistDialogProps {
  checklist: Checklist | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaveCompletion: (data: ViewChecklistCompletionData) => void;
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

export function ViewChecklistDialog({ checklist, open, onOpenChange, onSaveCompletion }: ViewChecklistDialogProps) {
  const [completionDate, setCompletionDate] = useState<Date | undefined>(new Date());
  const [completionNotes, setCompletionNotes] = useState<string>("");
  const [itemCompletionStates, setItemCompletionStates] = useState<ChecklistItemState[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (open && checklist) {
      setCompletionDate(new Date());
      setCompletionNotes("");
      const initialItemStates = (checklist.assetType === 'Vehicle'
        ? [...VEHICLE_STANDARD_ITEMS, ...ERA_STANDARD_ITEMS]
        : checklist.assetType === 'ERA'
        ? ERA_STANDARD_ITEMS
        : checklist.items
      ).map(itemText => ({ itemText, checked: false }));
      setItemCompletionStates(initialItemStates);
    } else {
      setItemCompletionStates([]); // Clear when dialog closes or no checklist
    }
  }, [open, checklist]);

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
    ? [...VEHICLE_STANDARD_ITEMS, ...ERA_STANDARD_ITEMS]
    : checklist.assetType === 'ERA'
    ? ERA_STANDARD_ITEMS
    : checklist.items;

  const isAssetChecklist = !!checklist.assetId;

  const handleItemCheckChange = (index: number, checked: boolean) => {
    setItemCompletionStates(prevStates =>
      prevStates.map((item, i) => (i === index ? { ...item, checked } : item))
    );
  };

  const handleSaveCompletionAction = () => {
    if (!completionDate) {
      toast({ title: "Error", description: "Por favor, seleccione una fecha de revisión.", variant: "destructive" });
      return;
    }
    if (!checklist) return;

    onSaveCompletion({
      checklistId: checklist.id,
      assetName: checklist.assetName,
      completionDate: completionDate,
      notes: completionNotes,
      itemStates: itemCompletionStates,
    });
    onOpenChange(false); // Toast is handled by parent page
  };

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
            {isAssetChecklist
              ? `Realice la revisión para ${checklist.assetName}. Seleccione una fecha, complete los ítems y añada notas.`
              : "Información completa del checklist seleccionado."}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] pr-3">
          <div className="space-y-3 py-4">
            {!isAssetChecklist && (
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

            {isAssetChecklist && (
              <div className="pt-4 mt-4 border-t space-y-4">
                <div>
                  <Label htmlFor="completion-date" className="text-sm font-medium text-primary">Fecha de Revisión</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="completion-date"
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal mt-1",
                          !completionDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {completionDate ? format(completionDate, "PPP", { locale: es }) : <span>Seleccione una fecha</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={completionDate}
                        onSelect={setCompletionDate}
                        initialFocus
                        locale={es}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label htmlFor="completion-notes" className="text-sm font-medium text-primary">Notas Generales de la Revisión</Label>
                  <Textarea
                    id="completion-notes"
                    placeholder="Observaciones sobre la revisión general, problemas encontrados, acciones tomadas..."
                    value={completionNotes}
                    onChange={(e) => setCompletionNotes(e.target.value)}
                    className="mt-1"
                    rows={4}
                  />
                </div>
              </div>
            )}

            <div className="pt-4 mt-4 border-t">
              <h4 className="text-md font-semibold mb-2 flex items-center">
                <FileText className="mr-2 h-5 w-5 text-primary" /> Ítems del Checklist
              </h4>
              {(itemsToDisplay && itemsToDisplay.length > 0) ? (
                  <div className="space-y-2">
                    {itemCompletionStates.map((itemState, index) => (
                      <div key={`${checklist.id}-item-${index}`} className="flex items-center space-x-2 p-2 border rounded-md bg-muted/20">
                        {isAssetChecklist ? (
                           <Checkbox
                            id={`${checklist.id}-item-check-${index}`}
                            checked={itemState.checked}
                            onCheckedChange={(checked) => handleItemCheckChange(index, !!checked)}
                          />
                        ) : (
                           <span className="mr-2 text-muted-foreground">•</span>
                        )}
                        <label
                          htmlFor={isAssetChecklist ? `${checklist.id}-item-check-${index}` : undefined}
                          className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1"
                        >
                          {itemState.itemText}
                        </label>
                      </div>
                    ))}
                  </div>
              ) : (
                  <p className="text-sm text-muted-foreground">
                  Este checklist aún no tiene ítems definidos.
                  </p>
              )}
            </div>
          </div>
        </ScrollArea>
        <DialogFooter className="pt-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
          {isAssetChecklist && (
            <Button type="button" onClick={handleSaveCompletionAction}>
              <Save className="mr-2 h-4 w-4" /> Guardar Completitud
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
