
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, AlertTriangle, Truck, ListFilter, Crosshair } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

type VehicleStatus = "En Base" | "En Ruta" | "En Emergencia" | "Necesita Mantención" | "Fuera de Servicio";
const ALL_VEHICLE_STATUSES: VehicleStatus[] = ["En Base", "En Ruta", "En Emergencia", "Necesita Mantención", "Fuera de Servicio"];

interface SimulatedVehicle {
  id: string;
  name: string; // Ej: B-01, M-02
  type: string; // Ej: Bomba, Ambulancia
  status: VehicleStatus;
  lastUpdate: string; // Hora simulada
  location: { lat: number; lon: number }; // Coordenadas simuladas
  assignedIncident?: string | null; // Ej: "Incendio en Av. Principal"
}

const initialVehicles: SimulatedVehicle[] = [
  { id: "v1", name: "B-01", type: "Bomba", status: "En Base", lastUpdate: "00:00:00", location: { lat: -33.450, lon: -70.660 }, assignedIncident: null },
  { id: "v2", name: "M-02", type: "Ambulancia", status: "En Ruta", lastUpdate: "00:00:00", location: { lat: -33.455, lon: -70.665 }, assignedIncident: "Accidente en Ruta 5" },
  { id: "v3", name: "R-03", type: "Rescate", status: "En Emergencia", lastUpdate: "00:00:00", location: { lat: -33.460, lon: -70.670 }, assignedIncident: "Derrumbe sector El Salto" },
  { id: "v4", name: "UT-04", type: "Utilitario", status: "Necesita Mantención", lastUpdate: "00:00:00", location: { lat: -33.465, lon: -70.675 }, assignedIncident: null },
  { id: "v5", name: "Q-05", type: "HazMat", status: "Fuera de Servicio", lastUpdate: "00:00:00", location: { lat: -33.470, lon: -70.680 }, assignedIncident: null },
];

function getRandomStatus(currentStatus: VehicleStatus): VehicleStatus {
  if (currentStatus === "Fuera de Servicio") return "Fuera de Servicio";
  const statuses: VehicleStatus[] = ["En Base", "En Ruta", "En Emergencia"];
  return statuses[Math.floor(Math.random() * statuses.length)];
}

function getRandomIncident(): string | null {
    const incidents = ["Incendio en Casona Vieja", "Accidente Múltiple Autopista Central", "Rescate Persona Atrapada", null, "Derrame Químico Industrial", null];
    return incidents[Math.floor(Math.random() * incidents.length)];
}

export default function TrackingPage() {
  const [vehicles, setVehicles] = useState<SimulatedVehicle[]>(initialVehicles);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    const interval = setInterval(() => {
      setVehicles((prevVehicles) =>
        prevVehicles.map((v) => {
          const newStatus = v.status === "Fuera de Servicio" || v.status === "Necesita Mantención" ? v.status : getRandomStatus(v.status);
          return {
            ...v,
            status: newStatus,
            lastUpdate: new Date().toLocaleTimeString('es-CL'),
            location: { // Simular pequeño movimiento
              lat: v.location.lat + (Math.random() - 0.5) * 0.001,
              lon: v.location.lon + (Math.random() - 0.5) * 0.001,
            },
            assignedIncident: newStatus === "En Emergencia" ? (v.assignedIncident || getRandomIncident() || "Emergencia Activa") : null,
          };
        })
      );
    }, 5000); // Actualizar cada 5 segundos

    return () => clearInterval(interval);
  }, []);

  const getStatusBadgeColor = (status: VehicleStatus) => {
    switch (status) {
      case "En Base": return "bg-blue-500 hover:bg-blue-600";
      case "En Ruta": return "bg-yellow-500 hover:bg-yellow-600 text-black";
      case "En Emergencia": return "bg-red-600 hover:bg-red-700";
      case "Necesita Mantención": return "bg-orange-500 hover:bg-orange-600";
      case "Fuera de Servicio": return "bg-gray-600 hover:bg-gray-700";
      default: return "bg-gray-400";
    }
  };

  const filteredVehicles = vehicles.filter(
    (v) => statusFilter === "all" || v.status === statusFilter
  );

  return (
    <div className="flex flex-col h-[calc(100vh-var(--header-height,4rem)-2rem)] gap-4"> {/* Ajustar altura */}
      <Card className="shadow-md">
        <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                    <CardTitle className="text-2xl font-headline flex items-center">
                    <Crosshair className="mr-2 h-6 w-6 text-primary" />
                    Seguimiento de Flota (Simulación)
                    </CardTitle>
                    <CardDescription>
                    Visualización simulada del estado y ubicación de los vehículos.
                    </CardDescription>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <ListFilter className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-[200px] bg-background">
                        <SelectValue placeholder="Filtrar por estado" />
                        </SelectTrigger>
                        <SelectContent>
                        <SelectItem value="all">Todos los Estados</SelectItem>
                        {ALL_VEHICLE_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </CardHeader>
      </Card>

      <div className="flex flex-col lg:flex-row gap-4 flex-grow min-h-0">
        {/* Mapa Simulado */}
        <Card className="lg:flex-[3] shadow-lg flex flex-col min-h-[300px] lg:min-h-0">
          <CardHeader>
            <CardTitle className="text-xl font-headline">Mapa de Operaciones</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow p-2 sm:p-4">
            <div className="relative w-full h-full bg-muted rounded-md overflow-hidden min-h-[250px] sm:min-h-[400px] lg:min-h-full">
              <Image
                src="https://placehold.co/1200x800.png?text=Simulacion+Mapa+GPS+Vehiculos"
                alt="Simulación de Mapa GPS"
                layout="fill"
                objectFit="cover"
                data-ai-hint="city map vehicles"
                priority
              />
              <div className="absolute top-2 left-2 bg-background/80 p-2 rounded-md shadow">
                <p className="text-xs text-muted-foreground flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-1 text-orange-500" />
                  Esto es una simulación. El seguimiento GPS real requiere backend.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Vehículos */}
        <Card className="lg:flex-[1] shadow-lg flex flex-col min-h-[300px] lg:min-h-0">
          <CardHeader>
            <CardTitle className="text-xl font-headline">Estado de Vehículos</CardTitle>
            <CardDescription>{filteredVehicles.length} vehículo(s) mostrando.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 flex-grow overflow-hidden">
            <ScrollArea className="h-full p-1 sm:p-3">
              {filteredVehicles.length > 0 ? (
                <div className="space-y-3">
                  {filteredVehicles.map((vehicle) => (
                    <div key={vehicle.id} className="p-3 border rounded-lg bg-card hover:bg-muted/50 transition-colors">
                      <div className="flex justify-between items-center mb-1">
                        <h4 className="font-semibold text-md text-primary">
                          <Truck className="inline h-4 w-4 mr-1.5" />
                          {vehicle.name} <span className="text-xs text-muted-foreground">({vehicle.type})</span>
                        </h4>
                        <Badge className={cn("text-xs text-white", getStatusBadgeColor(vehicle.status))}>
                          {vehicle.status}
                        </Badge>
                      </div>
                      {vehicle.assignedIncident && (
                        <p className="text-xs text-destructive mb-1">
                          Asignado a: {vehicle.assignedIncident}
                        </p>
                      )}
                      <div className="text-xs text-muted-foreground flex items-center justify-between">
                        <span className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {vehicle.location.lat.toFixed(4)}, {vehicle.location.lon.toFixed(4)}
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {vehicle.lastUpdate}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                 <div className="flex flex-col items-center justify-center h-full text-center p-4">
                    <ListFilter className="h-12 w-12 text-muted-foreground mb-3" />
                    <p className="text-md font-medium">No hay vehículos</p>
                    <p className="text-sm text-muted-foreground">
                      No se encontraron vehículos que coincidan con el filtro actual.
                    </p>
                  </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
