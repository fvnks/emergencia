
"use client";

import type { Task } from "@/services/taskService";
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

interface ViewTaskDialogProps {
  task: Task | null;
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


export function ViewTaskDialog({ task, open, onOpenChange }: ViewTaskDialogProps) {
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
  
  const getStatusBadgeVariant = (status: Task["estado_tarea"]) => {
    switch (status) {
      case "Completada": return "default"; 
      case "En Proceso": return "secondary"; 
      case "Programada": return "outline"; 
      case "Pendiente": return "destructive"; 
      case "Atrasada": return "destructive"; 
      default: return "outline";
    }
  };

  const getStatusBadgeClassName = (status: Task["estado_tarea"]) => {
     switch (status) {
      case "Completada": return "bg-green-500 hover:bg-green-600 text-white";
      case "En Proceso": return "bg-yellow-500 hover:bg-yellow-600 text-black";
      case "Programada": return "bg-blue-500 hover:bg-blue-600 text-white";
      case "Pendiente": return "bg-slate-400 hover:bg-slate-500 text-white"; 
      case "Atrasada": return "border-red-700 bg-red-600 hover:bg-red-700 text-white";
      default: return "";
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg md:max-w-xl">
        <DialogHeader>
          <DialogTitle>Detalles de la Tarea: T-{task.id_tarea.toString().padStart(3, '0')}</DialogTitle>
          <DialogDescription>
            Información completa de la tarea seleccionada.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-1 py-4 max-h-[65vh] overflow-y-auto pr-3">
          <DetailItem label="ID Tarea" value={`T-${task.id_tarea.toString().padStart(3, '0')}`} />
          <DetailItem label="Descripción" value={<p className="whitespace-pre-wrap">{task.descripcion_tarea}</p>} fullWidthValue />
          <DetailItem label="Estado" value={
            <Badge 
              variant={getStatusBadgeVariant(task.estado_tarea)}
              className={getStatusBadgeClassName(task.estado_tarea)}
            >
              {task.estado_tarea}
            </Badge>
          } />
          <DetailItem label="Asignado A" value={task.nombre_usuario_asignado} />
          <DetailItem label="Fecha Vencimiento" value={formatDate(task.fecha_vencimiento)} />
          <DetailItem label="Creado Por" value={task.nombre_usuario_creador} />
          <DetailItem label="Fecha Creación" value={formatDate(task.fecha_creacion)} />
          <DetailItem label="Última Actualización" value={formatDate(task.fecha_actualizacion)} />
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

