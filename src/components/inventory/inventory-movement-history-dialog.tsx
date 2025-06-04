
"use client";

import type { InventoryItem } from "@/services/inventoryService";
import type { InventoryMovement } from "@/services/inventoryMovementService";
import { useEffect, useState, useCallback } from "react";
import { getMovementsForItem } from "@/services/inventoryMovementService";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, AlertTriangle, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { format, parseISO, isValid } from 'date-fns';
import { es } from 'date-fns/locale';

interface InventoryMovementHistoryDialogProps {
  item: InventoryItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InventoryMovementHistoryDialog({ item, open, onOpenChange }: InventoryMovementHistoryDialogProps) {
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMovements = useCallback(async () => {
    if (!item) return;
    setLoading(true);
    setError(null);
    try {
      const fetchedMovements = await getMovementsForItem(item.id_item);
      setMovements(fetchedMovements);
    } catch (err) {
      console.error(`Error fetching movements for item ${item.id_item}:`, err);
      setError(err instanceof Error ? err.message : "No se pudo cargar el historial de movimientos.");
    } finally {
      setLoading(false);
    }
  }, [item]);

  useEffect(() => {
    if (open && item) {
      fetchMovements();
    } else {
      // Reset state when dialog is closed or item is null
      setMovements([]);
      setLoading(false);
      setError(null);
    }
  }, [open, item, fetchMovements]);

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "N/A";
    try {
      const date = parseISO(dateString);
      if (!isValid(date)) return "Fecha Inválida";
      return format(date, "Pp", { locale: es }); // 'Pp' for date and time
    } catch (e) {
      return dateString; // Fallback
    }
  };

  const formatMovementType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Historial de Movimientos: {item?.nombre_item} ({item?.codigo_item})</DialogTitle>
          <DialogDescription>
            Registro de todas las entradas, salidas y ajustes para este ítem.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {loading && (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
              Cargando historial...
            </div>
          )}
          {!loading && error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error al Cargar Historial</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {!loading && !error && movements.length === 0 && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Sin Movimientos</AlertTitle>
              <AlertDescription>No hay movimientos registrados para este ítem.</AlertDescription>
            </Alert>
          )}
          {!loading && !error && movements.length > 0 && (
            <ScrollArea className="h-[400px] w-full rounded-md border">
              <Table>
                <TableHeader className="sticky top-0 bg-background z-10">
                  <TableRow>
                    <TableHead className="w-[160px]">Fecha</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Cantidad</TableHead>
                    <TableHead>Responsable</TableHead>
                    <TableHead>Asignado a (EPP)</TableHead>
                    <TableHead>Notas</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movements.map((mov) => (
                    <TableRow key={mov.id_movimiento}>
                      <TableCell>{formatDate(mov.fecha_movimiento)}</TableCell>
                      <TableCell>{formatMovementType(mov.tipo_movimiento)}</TableCell>
                      <TableCell className={`text-right font-medium ${mov.cantidad_movimiento > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {mov.cantidad_movimiento > 0 ? `+${mov.cantidad_movida}` : `-${mov.cantidad_movida}`}
                      </TableCell>
                      <TableCell>{mov.nombre_usuario_responsable || 'N/A'}</TableCell>
                      <TableCell>
                        {mov.tipo_movimiento.includes('EPP') && mov.nombre_usuario_epp_asignado 
                          ? `${mov.nombre_usuario_epp_asignado} (${mov.codigo_item_epp_asignado || 'EPP'})` 
                          : 'N/A'}
                      </TableCell>
                      <TableCell className="text-xs">{mov.notas_movimiento || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
