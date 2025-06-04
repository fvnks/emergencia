
"use client";

import type { Vehicle } from "@/types/vehicleTypes";
import { useEffect, useState, useCallback } from "react";
import { getAllVehicles } from "@/services/vehicleService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Edit, Trash2, FileText, Wrench, Loader2, AlertTriangle, PackageSearch, Truck } from "lucide-react";
import Image from "next/image";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AddVehicleDialog } from "@/components/vehicles/add-vehicle-dialog";
import { EditVehicleDialog } from "@/components/vehicles/edit-vehicle-dialog";
import { DeleteVehicleDialog } from "@/components/vehicles/delete-vehicle-dialog";
import { format, parseISO, isValid } from 'date-fns';
import { es } from 'date-fns/locale';

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedVehicleForEdit, setSelectedVehicleForEdit] = useState<Vehicle | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedVehicleForDelete, setSelectedVehicleForDelete] = useState<Vehicle | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedVehicles = await getAllVehicles();
      setVehicles(fetchedVehicles);
    } catch (err) {
      console.error("Error fetching vehicles:", err);
      setError(err instanceof Error ? err.message : "No se pudieron cargar los vehículos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const handleVehicleAddedOrUpdatedOrDeleted = () => {
    fetchVehicles();
  };

  const openEditDialog = (vehicle: Vehicle) => {
    setSelectedVehicleForEdit(vehicle);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (vehicle: Vehicle) => {
    setSelectedVehicleForDelete(vehicle);
    setIsDeleteDialogOpen(true);
  };
  
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString.includes('T') ? dateString : dateString + "T00:00:00");
      return format(date, "dd-MM-yyyy", { locale: es });
    } catch (e) {
      return dateString;
    }
  };

  const getStatusBadgeClassName = (status: Vehicle["estado_vehiculo"]) => {
    switch (status) {
      case "Operativo": return "bg-green-500 hover:bg-green-600 text-white";
      case "En Mantención": return "bg-yellow-500 hover:bg-yellow-600 text-black";
      case "Fuera de Servicio": return "bg-red-600 hover:bg-red-700 text-white";
      default: return "";
    }
  };


  if (loading && vehicles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-10">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg font-semibold">Cargando Vehículos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="max-w-2xl mx-auto">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error al Cargar Vehículos</AlertTitle>
        <AlertDescription>
          {error.includes("La tabla 'Vehiculos' no existe")
            ? "La tabla 'Vehiculos' no existe en la base de datos. Por favor, ejecute el script SQL proporcionado para crearla."
            : error}
          <Button onClick={fetchVehicles} variant="link" className="p-0 h-auto ml-2">Reintentar</Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-headline font-bold">Gestión de Vehículos</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <PlusCircle className="mr-2 h-5 w-5" /> Agregar Nuevo Vehículo
        </Button>
      </div>

      {vehicles.length === 0 && !loading && (
         <Card className="shadow-lg text-center">
          <CardHeader>
            <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full w-fit">
                <Truck className="h-10 w-10" />
            </div>
            <CardTitle className="mt-4">No hay Vehículos Registrados</CardTitle>
            <CardDescription>
              No hay vehículos registrados en el sistema. Comienza agregando uno.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <Button onClick={() => setIsAddDialogOpen(true)}>
                <PlusCircle className="mr-2 h-5 w-5" /> Agregar Nuevo Vehículo
            </Button>
          </CardContent>
        </Card>
      )}

      {vehicles.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {vehicles.map((vehicle) => (
            <Card key={vehicle.id_vehiculo} className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
              <CardHeader>
                <div className="relative h-48 w-full mb-4 rounded-t-lg overflow-hidden bg-muted">
                  <Image 
                    src={vehicle.url_imagen || `https://placehold.co/600x400.png?text=${encodeURIComponent(vehicle.marca)}`} 
                    alt={`${vehicle.marca} ${vehicle.modelo}`} 
                    layout="fill" 
                    objectFit="cover" 
                    data-ai-hint={vehicle.ai_hint_imagen || vehicle.tipo_vehiculo?.toLowerCase() || "vehiculo emergencia"}
                    onError={(e) => { e.currentTarget.src = `https://placehold.co/600x400.png?text=${encodeURIComponent(vehicle.marca)}`; }}
                  />
                </div>
                <CardTitle className="font-headline text-xl">{vehicle.marca} {vehicle.modelo}</CardTitle>
                <CardDescription>
                    {vehicle.identificador_interno && <span className="font-semibold">{vehicle.identificador_interno}</span>}
                    {vehicle.identificador_interno && vehicle.patente && " | "}
                    {vehicle.patente && `Patente: ${vehicle.patente}`}
                    {!vehicle.identificador_interno && !vehicle.patente && "Sin identificador"}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow space-y-3">
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Estado: </span>
                  <Badge variant={vehicle.estado_vehiculo === "Operativo" ? "default" : "destructive"} className={getStatusBadgeClassName(vehicle.estado_vehiculo)}>
                    {vehicle.estado_vehiculo}
                  </Badge>
                </div>
                {vehicle.tipo_vehiculo && (
                    <div className="text-sm">
                        <span className="font-medium text-muted-foreground">Tipo: </span>{vehicle.tipo_vehiculo}
                    </div>
                )}
                <div className="flex items-center text-sm">
                  <Wrench className="mr-2 h-4 w-4 text-muted-foreground" />
                  Próx. Mantención: {formatDate(vehicle.proxima_mantencion_programada)}
                </div>
                <div className="flex items-center text-sm">
                  <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                  Docs Vencen: {formatDate(vehicle.vencimiento_documentacion)}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 border-t pt-4">
                <Button variant="outline" size="sm" onClick={() => openEditDialog(vehicle)}><Edit className="mr-1 h-4 w-4" /> Editar</Button>
                <Button variant="destructive" size="sm" onClick={() => openDeleteDialog(vehicle)}><Trash2 className="mr-1 h-4 w-4" /> Eliminar</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      <AddVehicleDialog
        onVehicleAdded={handleVehicleAddedOrUpdatedOrDeleted}
      />
      {selectedVehicleForEdit && (
        <EditVehicleDialog
          vehicle={selectedVehicleForEdit}
          onVehicleUpdated={handleVehicleAddedOrUpdatedOrDeleted}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
        />
      )}
      {selectedVehicleForDelete && (
        <DeleteVehicleDialog
          vehicle={selectedVehicleForDelete}
          onVehicleDeleted={handleVehicleAddedOrUpdatedOrDeleted}
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        />
      )}
    </div>
  );
}
