
"use client";

import type { Checklist } from "@/app/(app)/checklists/page";
import type { ChecklistCompletion, ChecklistCompletionStatus } from "@/types/checklistTypes";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from "@/lib/utils";
import { History } from "lucide-react";

interface ChecklistHistoryDialogProps {
  checklistTemplate: Checklist | null;
  completions: ChecklistCompletion[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getCompletionStatusBadgeClassName = (status: ChecklistCompletionStatus) => {
  switch (status) {
    case 'Completado': return 'bg-green-500 text-primary-foreground hover:bg-green-600';
    case 'Incompleto': return 'bg-yellow-500 text-black hover:bg-yellow-600';
    case 'Pendiente Revisión': return 'bg-blue-500 text-primary-foreground hover:bg-blue-600';
    default: return 'border-muted text-muted-foreground';
  }
};

export function ChecklistHistoryDialog({ checklistTemplate, completions, open, onOpenChange }: ChecklistHistoryDialogProps) {
  if (!checklistTemplate) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <History className="mr-2 h-5 w-5 text-primary" /> Historial de: {checklistTemplate.name}
          </DialogTitle>
          <DialogDescription>
            Revisiones pasadas para este checklist. Mostrando {completions.length} registro(s).
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-3 mt-4">
          {completions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha Conclusión</TableHead>
                  <TableHead>Realizado Por</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="hidden md:table-cell">Notas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {completions.map((completion) => (
                  <TableRow key={completion.id}>
                    <TableCell>
                      {format(parseISO(completion.completionDate), "dd MMM, yyyy HH:mm", { locale: es })}
                    </TableCell>
                    <TableCell>{completion.completedByUserName}</TableCell>
                    <TableCell>
                      <Badge className={cn("text-xs", getCompletionStatusBadgeClassName(completion.status))}>
                        {completion.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground hidden md:table-cell truncate max-w-xs" title={completion.notes}>
                      {completion.notes || "N/A"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground py-4 text-center">No hay historial de conclusiones para este checklist.</p>
          )}
        </ScrollArea>
        <DialogFooter className="pt-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
