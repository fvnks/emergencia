
"use client";

import type { EraEquipment } from "@/components/equipment/era-types";
import type { User } from "@/services/userService";
import { useEffect, useState, useCallback } from "react";
import { getAllEraEquipments, getEraEquipmentById } from "@/services/eraService"; // getEraEquipmentById no se usa pero está ok
import { getAllUsers } from "@/services/userService";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, UserCheck, Loader2, AlertTriangle, ShieldQuestion } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AddEraDialog } from "@/components/equipment/add-era-dialog";
import { EditEraDialog } from "@/components/equipment/edit-era-dialog";
import { DeleteEraDialog } from "@/components/equipment/delete-era-dialog";
import { AssignEraDialog } from "@/components/equipment/assign-era-dialog";


export default function EquipmentPage() {
  const [eraEquipments, setEraEquipments] = useState<EraEquipment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedEraForEdit, setSelectedEraForEdit] = useState<EraEquipment | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedEraForDelete, setSelectedEraForDelete] = useState<EraEquipment | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEraForAssign, setSelectedEraForAssign] = useState<EraEquipment | null>(null);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);

  const fetchPageData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [equipments, fetchedUsers] = await Promise.all([
        getAllEraEquipments(),
        getAllUsers()
      ]);
      setEraEquipments(equipments);
      setUsers(fetchedUsers);
    } catch (err) {
      console.error("Error fetching ERA equipments or users:", err);
      setError(err instanceof Error ? err.message : "No se pudieron cargar los datos para equipos ERA.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPageData();
  }, [fetchPageData]);

  const handleEraAddedOrUpdatedOrDeletedOrAssigned = () => {
    fetchPageData();
  };

  const openEditDialog = (era: EraEquipment) => {
    setSelectedEraForEdit(era);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (era: EraEquipment) => {
    setSelectedEraForDelete(era);
    setIsDeleteDialogOpen(true);
  };

  const openAssignDialog = (era: EraEquipment) => {
    setSelectedEraForAssign(era);
    setIsAssignDialogOpen(true);
  };

  const getStatusBadgeVariant = (status: EraEquipment["estado_era"]) => {
    switch (status) {
      case "Operativo": return "default";
      case "Disponible": return "secondary";
      case "En Mantención": return "outline";
      case "Requiere Inspección": return "destructive";
      case "Fuera de Servicio": return "destructive";
      default: return "outline";
    }
  };
  const getStatusBadgeClassName = (status: EraEquipment["estado_era"]) => {
    switch (status) {
      case "Operativo": return "bg-green-500 hover:bg-green-600 text-white";
      case "Disponible": return "bg-blue-500 hover:bg-blue-600 text-white";
      case "En Mantención": return "bg-yellow-500 hover:bg-yellow-600 text-black";
      case "Requiere Inspección": return "bg-orange-500 hover:bg-orange-600 text-white";
      case "Fuera de Servicio": return "bg-slate-600 hover:bg-slate-700 text-white";
      default: return "";
    }
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "N/A";
    try {
      // Asegurar que la fecha se parsea correctamente como local si solo es YYYY-MM-DD
      const date = new Date(dateString.includes('T') ? dateString : dateString + "T00:00:00");
      return date.toLocaleDateString('es-CL');
    } catch (e) {
      return dateString;
    }
  };


  if (loading && eraEquipments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-10">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg font-semibold">Cargando Equipos ERA...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="max-w-2xl mx-auto">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error al Cargar Equipos ERA</AlertTitle>
        <AlertDescription>
          {error.includes("La tabla 'ERA_Equipos' no existe")
            ? "La tabla 'ERA_Equipos' no existe en la base de datos. Por favor, ejecute el script SQL proporcionado para crearla."
            : error}
          <Button onClick={fetchPageData} variant="link" className="p-0 h-auto ml-2">Reintentar</Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-headline font-bold">Gestión de ERA</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <ShieldQuestion className="mr-2 h-5 w-5" /> Agregar Nuevo ERA
        </Button>
      </div>

      {eraEquipments.length === 0 && !loading && (
         <Card className="shadow-lg text-center">
          <CardHeader>
            <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full w-fit">
                <ShieldQuestion className="h-10 w-10" />
            </div>
            <CardTitle className="mt-4">No hay Equipos ERA</CardTitle>
            <CardDescription>
              No hay equipos ERA registrados en el sistema. Comienza agregando uno desde el botón superior.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* El botón "Agregar Nuevo ERA" que estaba aquí ha sido eliminado. */}
          </CardContent>
        </Card>
      )}

      {eraEquipments.length > 0 && (
        <Card className="shadow-lg">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Marca / Modelo</TableHead>
                  <TableHead>Próx. Inspección</TableHead>
                  <TableHead>Asignado A</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {eraEquipments.map((item) => (
                  <TableRow key={item.id_era}>
                    <TableCell className="font-medium">{item.codigo_era}</TableCell>
                    <TableCell>
                        <div>{item.marca || "N/A"} {item.modelo}</div>
                        <div className="text-xs text-muted-foreground">{item.numero_serie || "S/N"}</div>
                    </TableCell>
                    <TableCell>{formatDate(item.fecha_proxima_inspeccion)}</TableCell>
                    <TableCell>{item.nombre_usuario_asignado || "N/A"}</TableCell>
                    <TableCell>
                      <Badge
                        variant={getStatusBadgeVariant(item.estado_era)}
                        className={getStatusBadgeClassName(item.estado_era)}
                      >
                        {item.estado_era}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        title={item.id_usuario_asignado ? "Desasignar ERA" : "Asignar ERA"}
                        onClick={() => openAssignDialog(item)}
                        disabled={!['Disponible', 'Operativo'].includes(item.estado_era) && !item.id_usuario_asignado}
                      >
                        <UserCheck className="h-4 w-4" />
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

      <AddEraDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onItemAdded={handleEraAddedOrUpdatedOrDeletedOrAssigned}
        users={users}
      />
      {selectedEraForEdit && (
        <EditEraDialog
          era={selectedEraForEdit}
          onEraUpdated={handleEraAddedOrUpdatedOrDeletedOrAssigned}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          users={users}
        />
      )}
      {selectedEraForDelete && (
        <DeleteEraDialog
          era={selectedEraForDelete}
          onEraDeleted={handleEraAddedOrUpdatedOrDeletedOrAssigned}
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        />
      )}
      {selectedEraForAssign && (
        <AssignEraDialog
            era={selectedEraForAssign}
            users={users}
            open={isAssignDialogOpen}
            onOpenChange={setIsAssignDialogOpen}
            onEraAssigned={handleEraAddedOrUpdatedOrDeletedOrAssigned}
        />
      )}
    </div>
  );
}
