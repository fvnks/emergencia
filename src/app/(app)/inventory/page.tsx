
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
import { EditInventoryItemDialog } from "@/components/inventory/edit-inventory-item-dialog";
import { DeleteInventoryItemDialog } from "@/components/inventory/delete-inventory-item-dialog";
import { AssignEppDialog } from "@/components/inventory/assign-epp-dialog";


declare module "@/components/ui/button" {
  interface ButtonProps {
    size?: "default" | "sm" | "lg" | "icon" | "xs";
  }
}

export default function InventoryPage() {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedItemForEdit, setSelectedItemForEdit] = useState<InventoryItem | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const [selectedItemForDelete, setSelectedItemForDelete] = useState<InventoryItem | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [selectedItemForEppAssign, setSelectedItemForEppAssign] = useState<InventoryItem | null>(null);
  const [isAssignEppDialogOpen, setIsAssignEppDialogOpen] = useState(false);


  const fetchInventoryItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const items = await getAllInventoryItems();
      setInventoryItems(items);
    } catch (err) {
      console.error("Error fetching inventory items:", err);
      let errorMessage = "No se pudo cargar el inventario.";
      if (err instanceof Error) {
        if (err.message.includes("ER_NO_SUCH_TABLE") && (err.message.includes("Inventario_Items") || err.message.includes("EPP_Asignaciones_Actuales") || err.message.includes("Inventario_Movimientos") )) {
          errorMessage = "Una o más tablas requeridas para el inventario (Inventario_Items, EPP_Asignaciones_Actuales, Inventario_Movimientos) no existen. Por favor, ejecute el script SQL para crearlas.";
        } else {
          errorMessage = err.message;
        }
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventoryItems();
  }, [fetchInventoryItems]);

  const handleItemAddedOrUpdatedOrDeleted = () => {
    fetchInventoryItems();
  };
  
  const handleEppAssigned = () => {
    fetchInventoryItems(); 
  };

  const openEditDialog = (item: InventoryItem) => {
    setSelectedItemForEdit(item);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (item: InventoryItem) => {
    setSelectedItemForDelete(item);
    setIsDeleteDialogOpen(true);
  };
  
  const openAssignEppDialog = (item: InventoryItem) => {
    if (!item.es_epp) {
        alert("Este ítem no es un EPP y no puede ser asignado.");
        return;
    }
    if (item.cantidad_actual <= 0) {
        alert("Este ítem EPP no tiene stock disponible para ser asignado.");
        return;
    }
    setSelectedItemForEppAssign(item);
    setIsAssignEppDialogOpen(true);
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
        <AddInventoryItemDialog onItemAdded={handleItemAddedOrUpdatedOrDeleted} />
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
             <AddInventoryItemDialog onItemAdded={handleItemAddedOrUpdatedOrDeleted} />
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
                          <Button 
                            variant="outline" 
                            size="xs" 
                            className="text-xs h-7 px-2 py-1" // Ajuste de padding y altura para mejor apariencia
                            onClick={() => openAssignEppDialog(item)}
                            disabled={item.cantidad_actual <= 0}
                            title={item.cantidad_actual <= 0 ? "Sin stock para asignar" : "Asignar EPP"}
                          >
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
                      <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => openDeleteDialog(item)}>
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
          onItemUpdated={handleItemAddedOrUpdatedOrDeleted}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
        />
      )}
      {selectedItemForDelete && (
        <DeleteInventoryItemDialog
          item={selectedItemForDelete}
          onItemDeleted={handleItemAddedOrUpdatedOrDeleted}
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        />
      )}
      {selectedItemForEppAssign && (
        <AssignEppDialog
            item={selectedItemForEppAssign}
            onEppAssigned={handleEppAssigned}
            open={isAssignEppDialogOpen}
            onOpenChange={setIsAssignEppDialogOpen}
        />
      )}
    </div>
  );
}
