
"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, AlertTriangle, Truck, ListFilter, Crosshair } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ALL_VEHICLE_TYPES, type VehicleType } from "@/types/vehicleTypes";
import type L from 'leaflet'; // Import Leaflet type for map instance
import 'leaflet/dist/leaflet.css'; // Import Leaflet CSS

type VehicleStatus = "En Base" | "En Ruta" | "En Emergencia" | "Necesita Mantención" | "Fuera de Servicio";
const ALL_VEHICLE_STATUSES: VehicleStatus[] = ["En Base", "En Ruta", "En Emergencia", "Necesita Mantención", "Fuera de Servicio"];

interface SimulatedVehicle {
  id: string;
  name: string;
  type: VehicleType;
  status: VehicleStatus;
  lastUpdate: string;
  location: { lat: number; lon: number };
  assignedIncident?: string | null;
}

const initialVehicles: SimulatedVehicle[] = [
  { id: "v1", name: "B-01", type: "Bomba", status: "En Base", lastUpdate: "00:00:00", location: { lat: -33.450, lon: -70.660 }, assignedIncident: null },
  { id: "v2", name: "M-02", type: "Ambulancia", status: "En Ruta", lastUpdate: "00:00:00", location: { lat: -33.455, lon: -70.665 }, assignedIncident: "Accidente en Ruta 5" },
  { id: "v3", name: "R-03", type: "Rescate", status: "En Emergencia", lastUpdate: "00:00:00", location: { lat: -33.460, lon: -70.670 }, assignedIncident: "Derrumbe sector El Salto" },
  { id: "v4", name: "UT-04", type: "Utilitario", status: "Necesita Mantención", lastUpdate: "00:00:00", location: { lat: -33.465, lon: -70.675 }, assignedIncident: null },
  { id: "v5", name: "Q-05", type: "HazMat", status: "Fuera de Servicio", lastUpdate: "00:00:00", location: { lat: -33.470, lon: -70.680 }, assignedIncident: null },
  { id: "v6", name: "B-02", type: "Bomba", status: "En Ruta", lastUpdate: "00:00:00", location: { lat: -33.475, lon: -70.685 }, assignedIncident: null },
  { id: "v7", name: "F-01", type: "Forestal", status: "En Base", lastUpdate: "00:00:00", location: { lat: -33.480, lon: -70.690 }, assignedIncident: null },
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
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});

  // Initialize map
  useEffect(() => {
    if (typeof window !== "undefined" && mapContainerRef.current && !mapRef.current) {
      import('leaflet').then(L => {
        // This is a common fix for Leaflet's default icon path issue with bundlers like Webpack/Next.js
        // It ensures Leaflet can find its marker icon images.
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png').default,
          iconUrl: require('leaflet/dist/images/marker-icon.png').default,
          shadowUrl: require('leaflet/dist/images/marker-shadow.png').default,
        });

        const mapInstance = L.map(mapContainerRef.current!).setView([-33.4567, -70.6789], 12); // Santiago, Chile
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(mapInstance);
        mapRef.current = mapInstance;
      });
    }
    // Cleanup function to remove map on component unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      markersRef.current = {};
    };
  }, []); // Empty dependency array ensures this runs only once on mount


  // Simulate vehicle data updates and marker updates
  useEffect(() => {
    const interval = setInterval(() => {
      setVehicles((prevVehicles) =>
        prevVehicles.map((v) => {
          const newStatus = v.status === "Fuera de Servicio" || v.status === "Necesita Mantención" ? v.status : getRandomStatus(v.status);
          const newLocation = {
            lat: v.location.lat + (Math.random() - 0.5) * 0.002, // Slightly larger movement
            lon: v.location.lon + (Math.random() - 0.5) * 0.002,
          };
          return {
            ...v,
            status: newStatus,
            lastUpdate: new Date().toLocaleTimeString('es-CL'),
            location: newLocation,
            assignedIncident: newStatus === "En Emergencia" ? (v.assignedIncident || getRandomIncident() || "Emergencia Activa") : null,
          };
        })
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Update markers on map when vehicles data changes
  useEffect(() => {
    if (mapRef.current && typeof window !== "undefined") {
      import('leaflet').then(L => {
        vehicles.forEach(vehicle => {
          const { lat, lon } = vehicle.location;
          const popupContent = `<b>${vehicle.name} (${vehicle.type})</b><br>${vehicle.status}${vehicle.assignedIncident ? `<br>Incidente: ${vehicle.assignedIncident}` : ''}<br>Actualizado: ${vehicle.lastUpdate}`;

          if (markersRef.current[vehicle.id]) {
            markersRef.current[vehicle.id].setLatLng([lat, lon]);
            markersRef.current[vehicle.id].setPopupContent(popupContent);
          } else {
            const marker = L.marker([lat, lon]).addTo(mapRef.current!);
            marker.bindPopup(popupContent);
            markersRef.current[vehicle.id] = marker;
          }
          // Automatically open popup for vehicles in emergency
          if (vehicle.status === "En Emergencia" && markersRef.current[vehicle.id]) {
            markersRef.current[vehicle.id].openPopup();
          }
        });
      });
    }
  }, [vehicles]);


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
    (v) =>
      (statusFilter === "all" || v.status === statusFilter) &&
      (typeFilter === "all" || v.type === typeFilter)
  );

  return (
    <div className="flex flex-col h-[calc(100vh-var(--header-height,4rem)-2rem)] gap-4">
      <Card className="shadow-md">
        <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex-grow">
                    <CardTitle className="text-2xl font-headline flex items-center">
                    <Crosshair className="mr-2 h-6 w-6 text-primary" />
                    Seguimiento de Flota
                    </CardTitle>
                    <CardDescription>
                    Visualización en tiempo real (simulada) del estado y ubicación de los vehículos.
                    </CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <ListFilter className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full sm:w-[180px] bg-background">
                            <SelectValue placeholder="Estado" />
                            </SelectTrigger>
                            <SelectContent>
                            <SelectItem value="all">Todos los Estados</SelectItem>
                            {ALL_VEHICLE_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <ListFilter className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                         <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger className="w-full sm:w-[180px] bg-background">
                            <SelectValue placeholder="Tipo" />
                            </SelectTrigger>
                            <SelectContent>
                            <SelectItem value="all">Todos los Tipos</SelectItem>
                            {ALL_VEHICLE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>
        </CardHeader>
      </Card>

      <div className="flex flex-col lg:flex-row gap-4 flex-grow min-h-0">
        <Card className="lg:flex-[3] shadow-lg flex flex-col min-h-[300px] lg:min-h-0">
          <CardHeader>
            <CardTitle className="text-xl font-headline">Mapa de Operaciones</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow p-2 sm:p-4">
            <div ref={mapContainerRef} className="w-full h-full bg-muted rounded-md overflow-hidden min-h-[250px] sm:min-h-[400px] lg:min-h-full">
              {/* Leaflet map will be rendered here */}
            </div>
            <div className="absolute top-2 right-2 bg-background/80 p-1 rounded-md shadow text-xs text-muted-foreground z-[500]">
                 <AlertTriangle className="h-3 w-3 inline mr-1 text-orange-500" />
                 Simulación de datos.
            </div>
          </CardContent>
        </Card>

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
                        <h4 className="font-semibold text-md text-primary flex items-center">
                          <Truck className="inline h-4 w-4 mr-1.5 flex-shrink-0" />
                          {vehicle.name} <span className="text-xs text-muted-foreground ml-1">({vehicle.type})</span>
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
                      No se encontraron vehículos que coincidan con los filtros actuales.
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
