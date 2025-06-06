
"use client";

import type { InventoryItem } from "@/services/inventoryService";
import { useEffect, useState, useCallback, useMemo } from "react";
import { getAllInventoryItems } from "@/services/inventoryService";
import { getAllBodegas, type Bodega } from "@/services/bodegaService"; // Importar Bodega y servicio
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // Added Input
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, ArrowRightLeft, UserPlus, PackageSearch, Loader2, AlertTriangle, PlusCircle, Eye, Search } from "lucide-react"; // Added Eye, Search
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AddInventoryItemDialog } from "@/components/inventory/add-inventory-item-dialog";
import { EditInventoryItemDialog } from "@/components/inventory/edit-inventory-item-dialog";
import { DeleteInventoryItemDialog } from "@/components/inventory/delete-inventory-item-dialog";
import { AssignEppDialog } from "@/components/inventory/assign-epp-dialog";
import { InventoryMovementHistoryDialog } from "@/components/inventory/inventory-movement-history-dialog";
import { ViewInventoryItemDialog } from "@/components/inventory/view-inventory-item-dialog";


declare module "@/components/ui/button" {
  interface ButtonProps {
    size?: "default" | "sm" | "lg" | "icon" | "xs";
  }
}

export default function InventoryPage() {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [bodegasForFilter, setBodegasForFilter] = useState<Bodega[]>([]);
  const [selectedBodegaFilter, setSelectedBodegaFilter] = useState<string>("all"); // 'all' o id_bodega
  const [searchTerm, setSearchTerm] = useState<string>(""); // State for search term
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isAddInventoryDialogOpen, setIsAddInventoryDialogOpen] = useState(false);
  const [selectedItemForEdit, setSelectedItemForEdit] = useState<InventoryItem | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const [selectedItemForDelete, setSelectedItemForDelete] = useState<InventoryItem | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [selectedItemForEppAssign, setSelectedItemForEppAssign] = useState<InventoryItem | null>(null);
  const [isAssignEppDialogOpen, setIsAssignEppDialogOpen] = useState(false);

  const [selectedItemForHistory, setSelectedItemForHistory] = useState<InventoryItem | null>(null);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);

  const [selectedItemForView, setSelectedItemForView] = useState<InventoryItem | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const fetchPageData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [items, fetchedBodegas] = await Promise.all([
        getAllInventoryItems(),
        getAllBodegas()
      ]);
      setInventoryItems(items);
      setBodegasForFilter(fetchedBodegas);
    } catch (err) {
      console.error("Error fetching inventory items or bodegas:", err);
      let errorMessage = "No se pudo cargar el inventario o las bodegas.";
      if (err instanceof Error) {
        if ((err as any).code === 'ER_NO_SUCH_TABLE') {
          if (err.message.includes("Inventario_Items")) {
            errorMessage = "La tabla 'Inventario_Items' no existe. Por favor, ejecute el script SQL para crearla.";
          } else if (err.message.includes("Bodegas")) {
             errorMessage = "La tabla 'Bodegas' no existe. Por favor, vaya a Configuración > Gestionar Bodegas para crearla si es necesario o ejecute el script SQL.";
          } else if (err.message.includes("EPP_Asignaciones_Actuales") || err.message.includes("Inventario_Movimientos")) {
             errorMessage = "Una o más tablas requeridas para el inventario (EPP_Asignaciones_Actuales, Inventario_Movimientos) no existen. Por favor, ejecute el script SQL para crearlas.";
          }
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
    fetchPageData();
  }, [fetchPageData]);

  const handleItemAddedOrUpdatedOrDeleted = () => {
    fetchPageData();
  };

  const handleEppAssigned = () => {
    fetchPageData();
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

  const openHistoryDialog = (item: InventoryItem) => {
    setSelectedItemForHistory(item);
    setIsHistoryDialogOpen(true);
  };

  const openViewDialog = (item: InventoryItem) => {
    setSelectedItemForView(item);
    setIsViewDialogOpen(true);
  };

  const filteredInventoryItems = useMemo(() => {
    let items = inventoryItems;

    if (selectedBodegaFilter !== "all") {
      const bodegaId = parseInt(selectedBodegaFilter, 10);
      items = items.filter(item => item.id_bodega === bodegaId);
    }

    if (searchTerm) {
      const lowercasedFilter = searchTerm.toLowerCase();
      items = items.filter(item =>
        item.nombre_item.toLowerCase().includes(lowercasedFilter) ||
        item.codigo_item.toLowerCase().includes(lowercasedFilter) ||
        (item.categoria_item && item.categoria_item.toLowerCase().includes(lowercasedFilter))
      );
    }
    return items;
  }, [inventoryItems, selectedBodegaFilter, searchTerm]);


  const formatLocation = (item: InventoryItem) => {
    const bodegaNombre = item.nombre_bodega?.trim();
    const subLoc = item.sub_ubicacion?.trim();

    if (bodegaNombre && bodegaNombre !== "") {
      if (subLoc && subLoc !== "") {
        return `${bodegaNombre} / ${subLoc}`;
      }
      return bodegaNombre;
    }
    return "N/A";
  };

  if (loading && inventoryItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-10">
        <Loader2 className="h-12 w-12 animate-cool-loader-spin text-primary mb-4" />
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
          <Button onClick={fetchPageData} variant="link" className="p-0 h-auto ml-2">Reintentar</Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-4 mb-6 bg-card border rounded-lg shadow-sm">
        <h1 className="text-2xl font-headline font-bold">Inventario General</h1>
        <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center w-full sm:w-auto">
           <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar por nombre, código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-[240px] bg-background"
              />
            </div>
          <Select value={selectedBodegaFilter} onValueChange={setSelectedBodegaFilter} disabled={bodegasForFilter.length === 0}>
            <SelectTrigger className="w-full sm:w-[220px] bg-background">
              <SelectValue placeholder="Filtrar por bodega" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las Bodegas</SelectItem>
              {bodegasForFilter.map(bodega => (
                <SelectItem key={bodega.id_bodega} value={bodega.id_bodega.toString()}>
                  {bodega.nombre_bodega}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <AddInventoryItemDialog
             onItemAdded={handleItemAddedOrUpdatedOrDeleted}
             bodegas={bodegasForFilter}
          />
           {bodegasForFilter.length === 0 && inventoryItems.length > 0 && (
             <p className="text-xs text-muted-foreground sm:ml-2">Crea al menos una bodega en Configuración para agregar ítems.</p>
           )}
        </div>
      </div>


      {filteredInventoryItems.length === 0 && !loading && (
         <Card className="shadow-md text-center">
          <CardHeader>
            <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full w-fit">
                <PackageSearch className="h-10 w-10" />
            </div>
            <CardTitle className="mt-4">
              {inventoryItems.length === 0
                ? "Inventario Vacío"
                : "No hay ítems para esta selección"}
            </CardTitle>
            <CardDescription>
              {inventoryItems.length === 0
                ? (bodegasForFilter.length > 0 ? "No hay ítems registrados. Comienza agregando uno." : "Primero crea al menos una bodega en Configuración > Gestionar Bodegas.")
                : "No hay ítems que coincidan con los filtros o la búsqueda actual."}
            </CardDescription>
          </CardHeader>
          {inventoryItems.length === 0 && bodegasForFilter.length > 0 && (
            <CardContent>
                <AddInventoryItemDialog
                    onItemAdded={handleItemAddedOrUpdatedOrDeleted}
                    bodegas={bodegasForFilter}
                />
            </CardContent>
          )}
        </Card>
      )}

      {filteredInventoryItems.length > 0 && (
        <Card className="shadow-md">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Nombre Ítem / Categoría</TableHead>
                  <TableHead>Ubicación (Bodega / Sub)</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead>Asignación EPP</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInventoryItems.map((item) => (
                  <TableRow key={item.id_item} id={`item-${item.id_item}`}>
                    <TableCell className="font-medium">{item.codigo_item}</TableCell>
                    <TableCell>
                      <div>{item.nombre_item}</div>
                      <div className="text-xs text-muted-foreground">{item.categoria_item}</div>
                    </TableCell>
                    <TableCell>{formatLocation(item)}</TableCell>
                    <TableCell>
                        {item.cantidad_actual} {item.unidad_medida}
                        {item.stock_minimo && item.cantidad_actual <= item.stock_minimo && (
                            <Badge variant="destructive" className="ml-2 text-xs">Stock Bajo</Badge>
                        )}
                    </TableCell>
                    <TableCell>
                      {item.es_epp ? (
                          <Button
                            variant="outline"
                            size="xs"
                            className="text-xs h-7 px-2 py-1"
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
                    <TableCell className="text-right space-x-1">
                      <Button variant="outline" size="icon" className="h-8 w-8" title="Ver Detalles" onClick={() => openViewDialog(item)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" className="h-8 w-8" title="Historial Movimiento" onClick={() => openHistoryDialog(item)}>
                        <ArrowRightLeft className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => openEditDialog(item)} disabled={bodegasForFilter.length === 0}>
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
          bodegas={bodegasForFilter}
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
      {selectedItemForHistory && (
        <InventoryMovementHistoryDialog
            item={selectedItemForHistory}
            open={isHistoryDialogOpen}
            onOpenChange={setIsHistoryDialogOpen}
        />
      )}
      {selectedItemForView && (
        <ViewInventoryItemDialog
            item={selectedItemForView}
            open={isViewDialogOpen}
            onOpenChange={setIsViewDialogOpen}
        />
      )}
    </div>
  );
}
