
"use client";

import type { InventoryItem } from "@/services/inventoryService";
import { useEffect, useState, useCallback } from "react";
import { getAllInventoryItems } from "@/services/inventoryService";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, ArrowRightLeft, UserPlus, PackageSearch, Loader2, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AddInventoryItemDialog } from "@/components/inventory/add-inventory-item-dialog";
import { EditInventoryItemDialog } from "@/components/inventory/edit-inventory-item-dialog"; // Import Edit dialog


declare module "@/components/ui/button" {
  interface ButtonProps {
    size?: "default" | "sm" | "lg" | "icon" | "xs";
  }
}

export default function InventoryPage() {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  const [selectedItemForEdit, setSelectedItemForEdit] = useState<InventoryItem | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const fetchInventoryItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const items = await getAllInventoryItems();
      setInventoryItems(items);
    } catch (err) {
      console.error("Error fetching inventory items:", err);
      setError(err instanceof Error ? err.message : "No se pudo cargar el inventario.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventoryItems();
  }, [fetchInventoryItems]);

  const handleItemAddedOrUpdated = () => {
    fetchInventoryItems();
  };

  const openEditDialog = (item: InventoryItem) => {
    setSelectedItemForEdit(item);
    setIsEditDialogOpen(true);
  };

  const formatLocation = (item: InventoryItem) => {
    let locationString = item.ubicacion_nombre || "N/A";
    if (item.sub_ubicacion) {
      locationString += ` / ${item.sub_ubicacion}`;
    }
    return locationString;
  };
  
  if (loading && inventoryItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-10">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg font-semibold">Cargando inventario...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="max-w-2xl mx-auto">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error al Cargar Inventario</AlertTitle>
        <AlertDescription>
          {error}
          <Button onClick={fetchInventoryItems} variant="link" className="p-0 h-auto ml-2">Reintentar</Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-headline font-bold">Inventario General</h1>
        <AddInventoryItemDialog onItemAdded={handleItemAddedOrUpdated} />
      </div>

      {inventoryItems.length === 0 && !loading && (
         <Card className="shadow-lg text-center">
          <CardHeader>
            <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full w-fit">
                <PackageSearch className="h-10 w-10" />
            </div>
            <CardTitle className="mt-4">Inventario Vacío</CardTitle>
            <CardDescription>
              No hay ítems registrados en el inventario. Comienza agregando uno.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <AddInventoryItemDialog onItemAdded={handleItemAddedOrUpdated} />
          </CardContent>
        </Card>
      )}

      {inventoryItems.length > 0 && (
        <Card className="shadow-lg">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Nombre Ítem / Categoría</TableHead>
                  <TableHead>Ubicación</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead>Asignación EPP</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventoryItems.map((item) => (
                  <TableRow key={item.id_item}>
                    <TableCell className="font-medium">{item.codigo_item}</TableCell>
                    <TableCell>
                      <div>{item.nombre_item}</div>
                      <div className="text-xs text-muted-foreground">{item.categoria_item}</div>
                    </TableCell>
                    <TableCell>{formatLocation(item)}</TableCell>
                    <TableCell>{item.cantidad_actual} {item.unidad_medida}</TableCell>
                    <TableCell>
                      {item.es_epp ? (
                          <Button variant="outline" size="xs" className="text-xs h-6" disabled> {/* Asignar EPP aún no implementado */}
                              <UserPlus className="mr-1 h-3 w-3" /> Asignar EPP
                          </Button>
                      ) : (
                          <Badge variant="outline">No EPP</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="icon" className="h-8 w-8" title="Historial Movimiento" disabled> {/* TODO */}
                        <ArrowRightLeft className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => openEditDialog(item)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="icon" className="h-8 w-8" disabled> {/* TODO */}
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
      {selectedItemForEdit && (
        <EditInventoryItemDialog
          item={selectedItemForEdit}
          onItemUpdated={handleItemAddedOrUpdated}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
        />
      )}
    </div>
  );
}

