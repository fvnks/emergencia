
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
import { es } from 'date-fns/locale'; // For Spanish date formatting

interface ViewTaskDialogProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DetailItem: React.FC<{ label: string; value?: string | null | React.ReactNode }> = ({ label, value }) => (
  <div className="grid grid-cols-3 gap-2 py-1.5 items-start">
    <Label htmlFor={label.toLowerCase().replace(/\s/g, '-')} className="text-sm font-medium text-muted-foreground col-span-1">
      {label}:
    </Label>
    <div id={label.toLowerCase().replace(/\s/g, '-')} className="text-sm col-span-2">
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
      if (!isValid(dateInput)) {
        console.warn("Invalid Date object received in formatDate:", dateInput);
        return "Fecha inválida (obj)";
      }
      dateToFormat = dateInput;
    } else if (typeof dateInput === 'string') {
      try {
        // Standardize by replacing space with 'T' if it's a MySQL-like datetime string 'YYYY-MM-DD HH:MM:SS'
        // or if it's just a date 'YYYY-MM-DD' append time for parseISO to work consistently for local time.
        let isoCompliantString = dateInput;
        if (dateInput.length === 10 && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) { // YYYY-MM-DD
          isoCompliantString = `${dateInput}T00:00:00`;
        } else if (dateInput.includes(' ') && !dateInput.includes('T')) { // YYYY-MM-DD HH:MM:SS
           isoCompliantString = dateInput.replace(' ', 'T');
        }
        
        dateToFormat = parseISO(isoCompliantString);
        
        if (!isValid(dateToFormat)) {
            console.warn("parseISO resulted in an invalid date for string: ", dateInput, "parsed as", isoCompliantString);
            return "Fecha inválida (str)";
        }
      } catch (e) {
        console.warn("Error parsing date string in formatDate: ", dateInput, e);
        return "Fecha inválida (parse err)"; 
      }
    } else {
      console.warn("Unsupported date type for formatDate:", dateInput);
      return "Tipo de fecha no soportado";
    }

    try {
      return format(dateToFormat, "PPP", { locale: es }); // Example: "6 de diciembre de 2024"
    } catch (e) {
      console.warn("Error formatting date object in formatDate: ", dateToFormat, e);
      return "Error al formatear fecha";
    }
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
      <DialogContent className="sm:max-w-md md:max-w-lg">
        <DialogHeader>
          <DialogTitle>Detalles de la Tarea: T-{task.id_tarea.toString().padStart(3, '0')}</DialogTitle>
          <DialogDescription>
            Información completa de la tarea seleccionada.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-4 max-h-[60vh] overflow-y-auto pr-2">
          <DetailItem label="Descripción" value={<p className="whitespace-pre-wrap">{task.descripcion_tarea}</p>} />
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

