
"use client";

import type { Vehicle, VehicleStatus, VehicleType } from "@/types/vehicleTypes"; // Import VehicleStatus and VehicleType
import { useEffect, useState, useCallback, useMemo } from "react"; // Import useState and useMemo
import { useRouter } from 'next/navigation'; // Import useRouter
import { getAllVehicles } from "@/services/vehicleService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Edit, Trash2, FileText, Wrench, Loader2, AlertTriangle, Truck, Search, Filter, Eye } from "lucide-react"; // Added Eye and AlertTriangle
import Image from "next/image";
import Link from "next/link"; // Import Link
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AddVehicleDialog } from "@/components/vehicles/add-vehicle-dialog";
import { EditVehicleDialog } from "@/components/vehicles/edit-vehicle-dialog";
import { DeleteVehicleDialog } from "@/components/vehicles/delete-vehicle-dialog";
import { Input } from "@/components/ui/input"; // Import Input
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Import Select components
import { ALL_VEHICLE_STATUSES, ALL_VEHICLE_TYPES } from "@/types/vehicleTypes"; // Import status and type constants
import { format, parseISO, isValid, differenceInDays, isFuture, isPast } from 'date-fns'; // Added date-fns functions
import { es } from 'date-fns/locale';
import { cn } from "@/lib/utils";

export default function VehiclesPage() {
  const router = useRouter(); // Define router
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedVehicleForEdit, setSelectedVehicleForEdit] = useState<Vehicle | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedVehicleForDelete, setSelectedVehicleForDelete] = useState<Vehicle | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // State for filters and search
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all"); // 'all' or a VehicleStatus
  const [typeFilter, setTypeFilter] = useState<string>("all");     // 'all' or a VehicleType

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedVehicles = await getAllVehicles();
      setVehicles(fetchedVehicles);
    } catch (err) {
      console.error("Error fetching vehicles:", err);
      setError(err instanceof Error ? err.message : "No se pudieron cargar los veh\u00edculos.");
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

  const openEditDialog = (vehicle: Vehicle, e?: React.MouseEvent) => {
    e?.stopPropagation(); // Prevent Link navigation if button within card is clicked
    setSelectedVehicleForEdit(vehicle);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (vehicle: Vehicle, e?: React.MouseEvent) => {
    e?.stopPropagation(); // Prevent Link navigation
    setSelectedVehicleForDelete(vehicle);
    setIsDeleteDialogOpen(true);
  };
  
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "N/A";
    try {
      // Ensure date is parsed correctly if it's just YYYY-MM-DD
      const date = parseISO(dateString); 
      if (!isValid(date)) return "Fecha inv\u00e1lida";
      return format(date, "dd-MM-yyyy", { locale: es });
    } catch (e) {
      // Fallback for potentially malformed date strings that parseISO might not handle before isValid check
      return dateString; 
    }
  };

  const getStatusBadgeClassName = (status: Vehicle["estado_vehiculo"]) => {
    switch (status) {
      case "Operativo": return "bg-green-500 hover:bg-green-600 text-white";
      case "En Mantenci\u00f3n": return "bg-yellow-500 hover:bg-yellow-600 text-black";
      case "Fuera de Servicio": return "bg-red-600 hover:bg-red-700 text-white";
      default: return "bg-gray-400 text-white";
    }
  };

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((vehicle) => {
      const matchStatus = statusFilter === "all" || vehicle.estado_vehiculo === statusFilter;
      const matchType = typeFilter === "all" || vehicle.tipo_vehiculo === typeFilter;
      
      if (!matchStatus || !matchType) {
        return false;
      }

      if (searchTerm === "") {
        return true;
      }
      const lowerSearchTerm = searchTerm.toLowerCase();
      return (
        vehicle.marca.toLowerCase().includes(lowerSearchTerm) ||
        vehicle.modelo.toLowerCase().includes(lowerSearchTerm) ||
        (vehicle.patente && vehicle.patente.toLowerCase().includes(lowerSearchTerm)) ||
        (vehicle.identificador_interno && vehicle.identificador_interno.toLowerCase().includes(lowerSearchTerm))
      );
    });
  }, [vehicles, searchTerm, statusFilter, typeFilter]);

  if (loading && vehicles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-10">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg font-semibold">Cargando Veh\u00edculos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="max-w-2xl mx-auto">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error al Cargar Veh\u00edculos</AlertTitle>
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-headline font-bold">Gesti\u00f3n de Veh\u00edculos</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <PlusCircle className="mr-2 h-5 w-5" /> Agregar Nuevo Veh\u00edculo
        </Button>
      </div>

      {/* Filtros y Búsqueda */}
      <Card className="p-4 shadow-md">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por marca, modelo, patente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-card"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px] bg-card">
              <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los Estados</SelectItem>
              {ALL_VEHICLE_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-[200px] bg-card">
               <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los Tipos</SelectItem>
              {ALL_VEHICLE_TYPES.map((type) => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {filteredVehicles.length === 0 && !loading && (
         <Card className="shadow-lg text-center">
          <CardHeader>
            <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full w-fit">
                <Truck className="h-10 w-10" />
            </div>
            <CardTitle className="mt-4">
              {vehicles.length === 0 ? "No hay Veh\u00edculos Registrados" : "No se encontraron veh\u00edculos"}
            </CardTitle>
            <CardDescription>
              {vehicles.length === 0
                ? "No hay veh\u00edculos registrados en el sistema. Comienza agregando uno."
                : "Intenta ajustar los filtros o el t\u00e9rmino de b\u00fasqueda."
              }
            </CardDescription>
          </CardHeader>
          {vehicles.length === 0 && (
            <CardContent>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                  <PlusCircle className="mr-2 h-5 w-5" /> Agregar Nuevo Veh\u00edculo
              </Button>
            </CardContent>
          )}
        </Card>
      )}

      {filteredVehicles.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredVehicles.map((vehicle) => {
            const today = new Date();
            today.setHours(0,0,0,0); // Normalize today to the beginning of the day

            let isMaintenanceOverdue = false;
            let isMaintenanceUpcoming = false;
            let maintenanceTitle = "";

            if (vehicle.proxima_mantencion_programada) {
              const proxMantencionDate = parseISO(vehicle.proxima_mantencion_programada);
              if (isValid(proxMantencionDate)) {
                const daysToMaintenance = differenceInDays(proxMantencionDate, today);
                if (daysToMaintenance < 0 && vehicle.estado_vehiculo === 'Operativo') {
                  isMaintenanceOverdue = true;
                  maintenanceTitle = "Mantenci\u00f3n Vencida";
                } else if (daysToMaintenance >= 0 && daysToMaintenance <= 7) {
                  isMaintenanceUpcoming = true;
                  maintenanceTitle = `Mantenci\u00f3n en ${daysToMaintenance} d\u00eda(s)`;
                  if (daysToMaintenance === 0) maintenanceTitle = "Mantenci\u00f3n Hoy";
                }
              }
            }

            let isDocsOverdue = false;
            let isDocsUpcoming = false;
            let docsTitle = "";

            if (vehicle.vencimiento_documentacion) {
              const vencimientoDocsDate = parseISO(vehicle.vencimiento_documentacion);
              if (isValid(vencimientoDocsDate)) {
                 const daysToDocsExpiration = differenceInDays(vencimientoDocsDate, today);
                if (daysToDocsExpiration < 0) {
                  isDocsOverdue = true;
                  docsTitle = "Documentaci\u00f3n Vencida";
                } else if (daysToDocsExpiration >= 0 && daysToDocsExpiration <= 7) {
                  isDocsUpcoming = true;
                  docsTitle = `Documentaci\u00f3n vence en ${daysToDocsExpiration} d\u00eda(s)`;
                  if (daysToDocsExpiration === 0) docsTitle = "Documentaci\u00f3n vence Hoy";
                }
              }
            }

            return (
              <Link key={vehicle.id_vehiculo} href={`/vehicles/${vehicle.id_vehiculo}`} passHref>
                <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full cursor-pointer">
                  <CardHeader className="p-0">
                    <div className="relative h-48 w-full rounded-t-lg overflow-hidden bg-muted">
                      <Image 
                        src={vehicle.url_imagen || `https://placehold.co/600x400.png?text=${encodeURIComponent(vehicle.marca)}`} 
                        alt={`${vehicle.marca} ${vehicle.modelo}`} 
                        layout="fill" 
                        objectFit="cover" 
                        data-ai-hint={vehicle.ai_hint_imagen || vehicle.tipo_vehiculo?.toLowerCase() || "vehiculo emergencia"}
                        onError={(e) => { e.currentTarget.src = `https://placehold.co/600x400.png?text=Error`; }}
                      />
                    </div>
                     <div className="p-4">
                      <CardTitle className="font-headline text-xl">{vehicle.marca} {vehicle.modelo}</CardTitle>
                      <CardDescription>
                          {vehicle.identificador_interno && <span className="font-semibold">{vehicle.identificador_interno}</span>}
                          {vehicle.identificador_interno && vehicle.patente && " | "}
                          {vehicle.patente && `Patente: ${vehicle.patente}`}
                          {!vehicle.identificador_interno && !vehicle.patente && "Sin identificador"}
                      </CardDescription>
                     </div>
                  </CardHeader>
                  <CardContent className="flex-grow space-y-3 p-4">
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
                      <Wrench className="mr-2 h-4 w-4 text-muted-foreground flex-shrink-0" />
                      Pr\u00f3x. Mantenci\u00f3n: {formatDate(vehicle.proxima_mantencion_programada)}
                      {(isMaintenanceUpcoming || isMaintenanceOverdue) && (
                        <AlertTriangle 
                          className={cn("ml-2 h-4 w-4 flex-shrink-0", 
                            isMaintenanceOverdue ? "text-red-600" : "text-orange-500"
                          )} 
                          title={maintenanceTitle} 
                        />
                      )}
                    </div>
                    <div className="flex items-center text-sm">
                      <FileText className="mr-2 h-4 w-4 text-muted-foreground flex-shrink-0" />
                      Docs Vencen: {formatDate(vehicle.vencimiento_documentacion)}
                      {(isDocsUpcoming || isDocsOverdue) && (
                        <AlertTriangle 
                          className={cn("ml-2 h-4 w-4 flex-shrink-0",
                            isDocsOverdue ? "text-red-600" : "text-orange-500"
                          )} 
                          title={docsTitle}
                        />
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2 border-t pt-4 p-4">
                     <Button variant="outline" size="sm" onClick={(e) => { e.preventDefault(); router.push(`/vehicles/${vehicle.id_vehiculo}`)}}>
                          <Eye className="mr-1 h-4 w-4" /> Ver
                      </Button>
                    <Button variant="outline" size="sm" onClick={(e) => openEditDialog(vehicle, e)}><Edit className="mr-1 h-4 w-4" /> Editar</Button>
                    <Button variant="destructive" size="sm" onClick={(e) => openDeleteDialog(vehicle, e)}><Trash2 className="mr-1 h-4 w-4" /> Eliminar</Button>
                  </CardFooter>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
      <AddVehicleDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
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

