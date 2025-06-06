
"use client";

import type { EraEquipment } from "./era-types";
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

interface ViewEraDialogProps {
  era: EraEquipment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DetailItem: React.FC<{ label: string; value?: string | null | React.ReactNode; fullWidthValue?: boolean }> = ({ label, value, fullWidthValue = false }) => (
  <div className={`grid ${fullWidthValue ? 'grid-cols-1 sm:grid-cols-1' : 'grid-cols-3 sm:grid-cols-4'} gap-1 py-1.5 items-start border-b border-border/50 last:border-b-0`}>
    <Label htmlFor={label.toLowerCase().replace(/\s/g, '-')} className="text-sm font-medium text-muted-foreground col-span-1 sm:col-span-1">
      {label}:
    </Label>
    <div id={label.toLowerCase().replace(/\s/g, '-')} className={`text-sm ${fullWidthValue ? 'col-span-1 sm:col-span-1 pt-1' : 'col-span-2 sm:col-span-3'}`}>
      {value || <span className="italic text-muted-foreground">N/A</span>}
    </div>
  </div>
);

export function ViewEraDialog({ era, open, onOpenChange }: ViewEraDialogProps) {
  if (!era) return null;

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
  
  const getStatusBadgeVariant = (status: EraEquipment["estado_era"]) => {
    switch (status) {
      case "Operativo": return "default";
      case "Disponible": return "secondary";
      case "En Mantención": return "outline";
      case "Requiere Inspección": return "destructive";
      case "Fuera de Servicio": return "destructive";
      default: return "outline";
    }
  };
  const getStatusBadgeClassName = (status: EraEquipment["estado_era"]) => {
    switch (status) {
      case "Operativo": return "bg-green-500 hover:bg-green-600 text-white";
      case "Disponible": return "bg-blue-500 hover:bg-blue-600 text-white";
      case "En Mantención": return "bg-yellow-500 hover:bg-yellow-600 text-black";
      case "Requiere Inspección": return "bg-orange-500 hover:bg-orange-600 text-white";
      case "Fuera de Servicio": return "bg-slate-600 hover:bg-slate-700 text-white";
      default: return "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg md:max-w-xl">
        <DialogHeader>
          <DialogTitle>Detalles del Equipo ERA: {era.codigo_era}</DialogTitle>
          <DialogDescription>
            Información completa del equipo de respiración autónoma seleccionado.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-1 py-4 max-h-[65vh] overflow-y-auto pr-3">
          <DetailItem label="Código ERA" value={era.codigo_era} />
          <DetailItem label="Marca" value={era.marca} />
          <DetailItem label="Modelo" value={era.modelo} />
          <DetailItem label="Nº Serie" value={era.numero_serie} />
          <DetailItem label="Descripción" value={<p className="whitespace-pre-wrap text-sm">{era.descripcion}</p>} fullWidthValue />
          <DetailItem label="Estado" value={
            <Badge 
              variant={getStatusBadgeVariant(era.estado_era)}
              className={getStatusBadgeClassName(era.estado_era)}
            >
              {era.estado_era}
            </Badge>
          } />
          <DetailItem label="Asignado a" value={era.nombre_usuario_asignado} />
          <DetailItem label="Fecha Fabricación" value={formatDate(era.fecha_fabricacion)} />
          <DetailItem label="Fecha Adquisición" value={formatDate(era.fecha_adquisicion)} />
          <DetailItem label="Última Mantención" value={formatDate(era.fecha_ultima_mantencion)} />
          <DetailItem label="Próx. Inspección" value={formatDate(era.fecha_proxima_inspeccion)} />
          <DetailItem label="Notas" value={<p className="whitespace-pre-wrap text-sm">{era.notas}</p>} fullWidthValue />
          <DetailItem label="Fecha Creación" value={formatDate(era.fecha_creacion)} />
          <DetailItem label="Últ. Actualización" value={formatDate(era.fecha_actualizacion)} />
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

    
