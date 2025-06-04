
"use client";

import type { MaintenanceTask } from "@/types/maintenanceTypes";
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

interface ViewMaintenanceDialogProps {
  task: MaintenanceTask | null;
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

export function ViewMaintenanceDialog({ task, open, onOpenChange }: ViewMaintenanceDialogProps) {
  if (!task) return null;

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

  const getStatusBadgeVariant = (status: MaintenanceTask["estado_mantencion"]): "default" | "secondary" | "outline" | "destructive" => {
    switch (status) {
      case "Completada": return "default";
      case "Programada": return "secondary";
      case "En Progreso": return "outline";
      case "Pendiente": return "destructive";
      case "Atrasada": return "destructive";
      case "Cancelada": return "outline";
      default: return "outline";
    }
  };

  const getStatusBadgeClassName = (status: MaintenanceTask["estado_mantencion"]): string => {
    switch (status) {
      case "Completada": return "bg-green-500 hover:bg-green-600 text-white";
      case "Programada": return "bg-blue-500 hover:bg-blue-600 text-white";
      case "En Progreso": return "bg-yellow-500 hover:bg-yellow-600 text-black";
      case "Pendiente": return "bg-orange-500 hover:bg-orange-600 text-white";
      case "Atrasada": return "bg-red-600 hover:bg-red-700 text-white";
      case "Cancelada": return "bg-slate-500 hover:bg-slate-600 text-white";
      default: return "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg md:max-w-xl">
        <DialogHeader>
          <DialogTitle>Detalles de Mantención: {task.nombre_item_mantenimiento}</DialogTitle>
          <DialogDescription>
            Información completa de la tarea de mantención seleccionada.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-1 py-4 max-h-[65vh] overflow-y-auto pr-3">
          <DetailItem label="Ítem" value={task.nombre_item_mantenimiento} />
          <DetailItem label="Tipo Ítem" value={task.tipo_item} />
          <DetailItem label="Estado" value={
            <Badge 
              variant={getStatusBadgeVariant(task.estado_mantencion)}
              className={getStatusBadgeClassName(task.estado_mantencion)}
            >
              {task.estado_mantencion}
            </Badge>
          } />
          <DetailItem label="Desc. Mantención" value={<p className="whitespace-pre-wrap text-sm">{task.descripcion_mantencion}</p>} fullWidthValue />
          <DetailItem label="Fecha Programada" value={formatDate(task.fecha_programada)} />
          <DetailItem label="Responsable" value={task.nombre_usuario_responsable} />
          <DetailItem label="Última Realizada" value={formatDate(task.fecha_ultima_realizada)} />
          {task.estado_mantencion === 'Completada' && (
            <DetailItem label="Fecha Completada" value={formatDate(task.fecha_completada)} />
          )}
          <DetailItem label="Registro Tarea" value={<p className="whitespace-pre-wrap text-sm">{task.notas_mantencion}</p>} fullWidthValue />
          <DetailItem label="Creado Por" value={task.nombre_usuario_creador} />
          <DetailItem label="Fecha Creación" value={formatDate(task.fecha_creacion)} />
          <DetailItem label="Últ. Actualización" value={formatDate(task.fecha_actualizacion)} />
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
