
"use client";

import type { Checklist } from "@/app/(app)/checklists/page";
import type { ChecklistCompletion, ChecklistCompletionStatus } from "@/types/checklistTypes";
import { ALL_CHECKLIST_COMPLETION_STATUSES } from "@/types/checklistTypes";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format, parseISO, isValid, isBefore, isAfter, startOfDay, endOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from "@/lib/utils";
import { History, CalendarIcon, FilterX, ListFilter } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { DateRange } from "react-day-picker";
import { useState, useMemo, useEffect } from "react";

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
  const [dateRangeFilterCompletions, setDateRangeFilterCompletions] = useState<DateRange | undefined>(undefined);
  const [statusFilterCompletions, setStatusFilterCompletions] = useState<string>("all");

  useEffect(() => {
    if (open) {
      setDateRangeFilterCompletions(undefined);
      setStatusFilterCompletions("all");
    }
  }, [open, checklistTemplate]);

  const filteredCompletions = useMemo(() => {
    return completions.filter(completion => {
      const matchesDate = (() => {
        if (!dateRangeFilterCompletions?.from) return true;
        const itemDate = parseISO(completion.completionDate);
        if (!isValid(itemDate)) return false;
        const fromDate = startOfDay(dateRangeFilterCompletions.from);
        if (isBefore(itemDate, fromDate)) return false;
        if (dateRangeFilterCompletions.to) {
          const toDate = endOfDay(dateRangeFilterCompletions.to);
          if (isAfter(itemDate, toDate)) return false;
        }
        return true;
      })();

      const matchesStatus = statusFilterCompletions === "all" || completion.status === statusFilterCompletions;

      return matchesDate && matchesStatus;
    });
  }, [completions, dateRangeFilterCompletions, statusFilterCompletions]);

  if (!checklistTemplate) return null;

  const activeFilterCount = (dateRangeFilterCompletions?.from ? 1 : 0) + (statusFilterCompletions !== "all" ? 1 : 0);
  const descriptionText = activeFilterCount > 0 
    ? `Mostrando ${filteredCompletions.length} de ${completions.length} registro(s) con ${activeFilterCount} filtro(s) activo(s).`
    : `Mostrando ${filteredCompletions.length} de ${completions.length} registro(s).`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl md:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <History className="mr-2 h-5 w-5 text-primary" /> Historial de: {checklistTemplate.name}
          </DialogTitle>
          <DialogDescription>
            Revisiones pasadas para este checklist. {descriptionText}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col sm:flex-row gap-2 items-center my-4 p-3 border bg-card rounded-md">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date-filter-history"
                  variant={"outline"}
                  className={cn(
                    "w-full sm:w-[270px] justify-start text-left font-normal bg-background",
                    !dateRangeFilterCompletions && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRangeFilterCompletions?.from ? (
                    dateRangeFilterCompletions.to ? (
                      <>
                        {format(dateRangeFilterCompletions.from, "LLL dd, y", { locale: es })} -{" "}
                        {format(dateRangeFilterCompletions.to, "LLL dd, y", { locale: es })}
                      </>
                    ) : (
                      format(dateRangeFilterCompletions.from, "LLL dd, y", { locale: es })
                    )
                  ) : (
                    <span>Filtrar por Fecha</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRangeFilterCompletions?.from}
                  selected={dateRangeFilterCompletions}
                  onSelect={setDateRangeFilterCompletions}
                  numberOfMonths={2}
                  locale={es}
                />
              </PopoverContent>
            </Popover>
            <Select value={statusFilterCompletions} onValueChange={setStatusFilterCompletions}>
                <SelectTrigger className="w-full sm:w-[200px] bg-background">
                    <ListFilter className="mr-2 h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Estado Conclusión" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Todos los Estados</SelectItem>
                    {ALL_CHECKLIST_COMPLETION_STATUSES.map(stat => <SelectItem key={stat} value={stat}>{stat}</SelectItem>)}
                </SelectContent>
            </Select>
            {(dateRangeFilterCompletions?.from || statusFilterCompletions !== "all") && (
                <Button
                    variant="ghost"
                    onClick={() => {
                        setDateRangeFilterCompletions(undefined);
                        setStatusFilterCompletions("all");
                    }}
                    className="h-9 px-3 w-full sm:w-auto"
                >
                    <FilterX className="mr-1.5 h-4 w-4" /> Limpiar Filtros
                </Button>
            )}
        </div>

        <ScrollArea className="max-h-[50vh] pr-3">
          {filteredCompletions.length > 0 ? (
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
                {filteredCompletions.map((completion) => (
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
            <p className="text-sm text-muted-foreground py-4 text-center">
                {completions.length > 0 ? "No hay conclusiones que coincidan con los filtros aplicados." : "No hay historial de conclusiones para este checklist."}
            </p>
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
