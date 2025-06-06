
"use client";

import type { InventoryItem } from "@/services/inventoryService";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { format, parseISO, isValid } from 'date-fns';
import { es } from 'date-fns/locale';

interface ViewInventoryItemDialogProps {
  item: InventoryItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DetailItem: React.FC<{ label: string; value?: string | number | boolean | null | React.ReactNode; fullWidthValue?: boolean }> = ({ label, value, fullWidthValue = false }) => {
  let displayValue = value;
  if (typeof value === 'boolean') {
    displayValue = value ? "Sí" : "No";
  }

  return (
    <div className={`grid ${fullWidthValue ? 'grid-cols-1 sm:grid-cols-1' : 'grid-cols-3 sm:grid-cols-4'} gap-1 py-1.5 items-start border-b border-border/50 last:border-b-0`}>
      <Label htmlFor={label.toLowerCase().replace(/\s/g, '-')} className="text-sm font-medium text-muted-foreground col-span-1 sm:col-span-1">
        {label}:
      </Label>
      <div id={label.toLowerCase().replace(/\s/g, '-')} className={`text-sm ${fullWidthValue ? 'col-span-1 sm:col-span-1 pt-1' : 'col-span-2 sm:col-span-3'}`}>
        {displayValue === null || displayValue === undefined || displayValue === ''
          ? <span className="italic text-muted-foreground">N/A</span>
          : displayValue}
      </div>
    </div>
  );
};

export function ViewInventoryItemDialog({ item, open, onOpenChange }: ViewInventoryItemDialogProps) {
  if (!item) return null;

  const formatDate = (dateInput?: string | null | Date): string | null => {
    if (!dateInput) return null;
    let dateToFormat: Date;
    if (dateInput instanceof Date) {
      if (!isValid(dateInput)) return "Fecha inválida";
      dateToFormat = dateInput;
    } else if (typeof dateInput === 'string') {
      try {
        let isoCompliantString = dateInput;
        if (dateInput.length === 10 && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
          isoCompliantString = `${dateInput}T00:00:00`;
        } else if (dateInput.includes(' ') && !dateInput.includes('T')) {
           isoCompliantString = dateInput.replace(' ', 'T');
        }
        dateToFormat = parseISO(isoCompliantString);
        if (!isValid(dateToFormat)) return "Fecha inválida";
      } catch (e) { return "Error al parsear"; }
    } else { return "Tipo no soportado"; }
    try { return format(dateToFormat, "PPP", { locale: es }); }
    catch (e) { return "Error al formatear"; }
  };

  const formatLocation = (itemData: InventoryItem) => {
    const bodegaNombre = itemData.nombre_bodega?.trim();
    const subLoc = itemData.sub_ubicacion?.trim();

    if (bodegaNombre && bodegaNombre !== "") {
      if (subLoc && subLoc !== "") {
        return `${bodegaNombre} / ${subLoc}`;
      }
      return bodegaNombre;
    }
    return null;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg md:max-w-xl">
        <DialogHeader>
          <DialogTitle>Detalles del Ítem: {item.nombre_item}</DialogTitle>
          <DialogDescription>
            Información completa del ítem de inventario seleccionado.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-1 py-4 max-h-[65vh] overflow-y-auto pr-3">
          <DetailItem label="Código Ítem" value={item.codigo_item} />
          <DetailItem label="Nombre Ítem" value={item.nombre_item} />
          <DetailItem label="Categoría" value={item.categoria_item} />
          <DetailItem label="Descripción" value={<p className="whitespace-pre-wrap text-sm">{item.descripcion_item}</p>} fullWidthValue />
          <DetailItem label="Ubicación" value={formatLocation(item)} />
          <DetailItem label="Cantidad Actual" value={`${item.cantidad_actual} ${item.unidad_medida}`} />
          <DetailItem label="Stock Mínimo" value={item.stock_minimo !== null && item.stock_minimo !== undefined ? `${item.stock_minimo} ${item.unidad_medida}` : null} />
          <DetailItem label="Es EPP" value={item.es_epp} />
          <DetailItem label="Fecha Vencimiento" value={formatDate(item.fecha_vencimiento_item)} />
          <DetailItem label="Fecha Creación" value={formatDate(item.fecha_creacion)} />
          <DetailItem label="Últ. Actualización" value={formatDate(item.fecha_actualizacion)} />
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

    
