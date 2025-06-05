
"use client";

import type { Bodega } from "@/services/bodegaService";
import { useEffect, useState, useCallback } from "react";
import { getAllBodegas } from "@/services/bodegaService";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Trash2, Loader2, AlertTriangle, Warehouse, PlusCircle, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AddBodegaDialog } from "@/components/settings/bodegas/add-bodega-dialog";
import { EditBodegaDialog } from "@/components/settings/bodegas/edit-bodega-dialog";
import { DeleteBodegaDialog } from "@/components/settings/bodegas/delete-bodega-dialog";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function WarehousesPage() {
  const [bodegas, setBodegas] = useState<Bodega[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedBodegaForEdit, setSelectedBodegaForEdit] = useState<Bodega | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedBodegaForDelete, setSelectedBodegaForDelete] = useState<Bodega | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const fetchBodegas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedBodegas = await getAllBodegas();
      setBodegas(fetchedBodegas);
    } catch (err) {
      console.error("Error fetching bodegas:", err);
      setError(err instanceof Error ? err.message : "No se pudieron cargar las bodegas.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBodegas();
  }, [fetchBodegas]);

  const handleBodegaAddedOrUpdatedOrDeleted = () => {
    fetchBodegas();
  };

  const openEditDialog = (bodega: Bodega) => {
    setSelectedBodegaForEdit(bodega);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (bodega: Bodega) => {
    setSelectedBodegaForDelete(bodega);
    setIsDeleteDialogOpen(true);
  };

  if (loading && bodegas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-10">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg font-semibold">Cargando Bodegas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Button variant="outline" asChild className="mb-4">
          <Link href="/settings"><ArrowLeft className="mr-2 h-4 w-4" /> Volver a Configuración</Link>
        </Button>
        <Alert variant="destructive" className="max-w-2xl mx-auto">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error al Cargar Bodegas</AlertTitle>
          <AlertDescription>
            {error.includes("La tabla 'Bodegas' no existe")
              ? "La tabla 'Bodegas' no existe en la base de datos. Por favor, ejecute el script SQL para crearla."
              : error}
            <Button onClick={fetchBodegas} variant="link" className="p-0 h-auto ml-2">Reintentar</Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Button variant="outline" asChild className="mb-2 sm:mb-0 sm:mr-4">
            <Link href="/settings"><ArrowLeft className="mr-2 h-4 w-4" /> Volver a Configuración</Link>
          </Button>
          <h1 className="text-3xl font-headline font-bold inline-block align-middle">Gestión de Bodegas</h1>
        </div>
        <AddBodegaDialog onBodegaAdded={handleBodegaAddedOrUpdatedOrDeleted} />
      </div>
      <p className="text-muted-foreground">
        Administra las bodegas y centros de almacenamiento para tu inventario.
      </p>

      {bodegas.length === 0 && !loading && (
         <Card className="shadow-md text-center">
          <CardHeader>
            <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full w-fit">
                <Warehouse className="h-10 w-10" />
            </div>
            <CardTitle className="mt-4">No hay Bodegas Registradas</CardTitle>
            <CardDescription>
              Comienza agregando tu primera bodega para organizar el inventario.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AddBodegaDialog onBodegaAdded={handleBodegaAddedOrUpdatedOrDeleted} />
          </CardContent>
        </Card>
      )}

      {bodegas.length > 0 && (
        <Card className="shadow-md">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Nombre Bodega</TableHead>
                  <TableHead>Dirección</TableHead>
                  <TableHead className="w-[200px] text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bodegas.map((bodega) => (
                  <TableRow key={bodega.id_bodega}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <Warehouse className="mr-2 h-4 w-4 text-muted-foreground" />
                        {bodega.nombre_bodega}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <MapPin className="mr-2 h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="truncate" title={bodega.direccion_bodega}>{bodega.direccion_bodega}</span>
                      </div>
                      {bodega.descripcion_bodega && (
                        <p className="text-xs text-muted-foreground mt-1 truncate" title={bodega.descripcion_bodega}>
                          {bodega.descripcion_bodega}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => openEditDialog(bodega)} title="Editar Bodega">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => openDeleteDialog(bodega)} title="Eliminar Bodega">
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

      {selectedBodegaForEdit && (
        <EditBodegaDialog
          bodega={selectedBodegaForEdit}
          onBodegaUpdated={handleBodegaAddedOrUpdatedOrDeleted}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
        />
      )}
      {selectedBodegaForDelete && (
        <DeleteBodegaDialog
          bodega={selectedBodegaForDelete}
          onBodegaDeleted={handleBodegaAddedOrUpdatedOrDeleted}
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        />
      )}
    </div>
  );
}
