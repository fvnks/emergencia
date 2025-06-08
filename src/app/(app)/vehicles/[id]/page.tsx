
"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getVehicleById } from "@/services/vehicleService";
import type { Vehicle, VehicleAssignedInventoryItem } from "@/types/vehicleTypes";
import type { EraEquipment } from "@/components/equipment/era-types";
import { getAllMaintenanceTasks, type MaintenanceTask, type MaintenanceStatus } from "@/services/maintenanceService"; // Importar servicio y tipo
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertTriangle, ArrowLeft, CalendarDays, Tag, ShieldCheck, Info, FileText, Wrench, Package, ShieldAlert as EraIcon, ScrollText } from "lucide-react"; // Eliminado MapPin, Clock
import { format, parseISO, isValid } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from "@/hooks/use-toast";
import { ManageVehicleEraDialog } from "@/components/vehicles/manage-vehicle-era-dialog";
import { ManageVehicleInventoryDialog } from "@/components/vehicles/manage-vehicle-inventory-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"; // Para la tabla de historial

type LucideIcon = typeof Loader2;

const DetailItem: React.FC<{ label: string; value?: string | number | null | React.ReactNode; icon?: LucideIcon }> = ({ label, value, icon: Icon }) => (
  <div className="py-2">
    <dt className="text-sm font-medium text-muted-foreground flex items-center">
      {Icon && <Icon className="h-4 w-4 mr-2" />}
      {label}
    </dt>
    <dd className="mt-1 text-md text-foreground">
      {value || <span className="italic text-muted-foreground">No disponible</span>}
    </dd>
  </div>
);

export default function VehicleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { toast } = useToast();

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [vehicleMaintenanceHistory, setVehicleMaintenanceHistory] = useState<MaintenanceTask[]>([]); // Estado para el historial
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isManageEraDialogOpen, setIsManageEraDialogOpen] = useState(false);
  const [isManageInventoryDialogOpen, setIsManageInventoryDialogOpen] = useState(false);
  // Estado simulatedLocationTime eliminado

  const fetchVehicleDetailsAndHistory = useCallback(async () => {
    if (id) {
      const vehicleId = parseInt(id, 10);
      if (isNaN(vehicleId)) {
        setError("ID de vehículo inválido.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      setVehicle(null);
      setVehicleMaintenanceHistory([]);

      try {
        const vehicleData = await getVehicleById(vehicleId);
        if (vehicleData) {
          setVehicle({
            ...vehicleData,
            assignedEras: vehicleData.assignedEras || [],
            assignedInventoryItems: vehicleData.assignedInventoryItems || [],
          });

          // Fetch and filter maintenance history
          const allMaintenance = await getAllMaintenanceTasks();
          const history = allMaintenance.filter(task => {
            const nameMatch = task.nombre_item_mantenimiento?.toLowerCase();
            const idMatch = vehicleData.identificador_interno?.toLowerCase();
            const patentMatch = vehicleData.patente?.toLowerCase();
            
            return (idMatch && nameMatch?.includes(idMatch)) || (patentMatch && nameMatch?.includes(patentMatch));
          }).sort((a, b) => {
            const dateA = a.fecha_completada || a.fecha_programada || a.fecha_creacion;
            const dateB = b.fecha_completada || b.fecha_programada || b.fecha_creacion;
            return new Date(dateB).getTime() - new Date(dateA).getTime();
          });
          setVehicleMaintenanceHistory(history);

        } else {
          setError("Vehículo no encontrado.");
        }
      } catch (err) {
        console.error("Error fetching vehicle details or history:", err);
        setError(err instanceof Error ? err.message : "No se pudieron cargar los datos.");
      } finally {
        setLoading(false);
      }
    }
  }, [id]);

  useEffect(() => {
    fetchVehicleDetailsAndHistory();
  }, [fetchVehicleDetailsAndHistory]);

  const formatDate = (dateString?: string | null, withTime: boolean = false) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString.includes('T') ? dateString : dateString + "T00:00:00Z");
      if (!isValid(date)) return "Fecha inválida";
      return format(date, withTime ? "PPPp" : "PPP", { locale: es });
    } catch (e) {
      return dateString;
    }
  };

  const getStatusBadgeClassName = (status?: Vehicle["estado_vehiculo"] | MaintenanceStatus) => {
    if (!status) return "";
    // Vehicle statuses
    if (['Operativo', 'En Mantención', 'Fuera de Servicio'].includes(status)) {
      switch (status) {
        case "Operativo": return "bg-green-500 hover:bg-green-600 text-white";
        case "En Mantención": return "bg-yellow-500 hover:bg-yellow-600 text-black";
        case "Fuera de Servicio": return "bg-red-600 hover:bg-red-700 text-white";
      }
    }
    // Maintenance statuses
    switch (status) {
      case "Completada": return "bg-green-500 hover:bg-green-600 text-white";
      case "Programada": return "bg-blue-500 hover:bg-blue-600 text-white";
      case "En Progreso": return "bg-yellow-500 hover:bg-yellow-600 text-black";
      case "Pendiente": return "bg-orange-500 hover:bg-orange-600 text-white";
      case "Atrasada": return "bg-red-600 hover:bg-red-700 text-white";
      case "Cancelada": return "bg-slate-500 hover:bg-slate-600 text-white";
    }
    return "bg-gray-400 text-white";
  };

  const handleManageEra = () => setIsManageEraDialogOpen(true);
  const handleAssignmentsUpdated = () => fetchVehicleDetailsAndHistory(); // Recargar datos completos
  const handleManageInventory = () => setIsManageInventoryDialogOpen(true);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-10">
        <Loader2 className="h-12 w-12 animate-cool-loader-spin text-primary mb-4" />
        <p className="text-lg font-semibold">Cargando detalles del vehículo...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => router.push('/vehicles')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver a la lista
        </Button>
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center">
              <AlertTriangle className="mr-2 h-6 w-6" /> Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">{error}</p>
            <p className="text-muted-foreground mt-2">Por favor, verifica el ID del vehículo o intenta nuevamente.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="space-y-4">
         <Button variant="outline" onClick={() => router.push('/vehicles')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver a la lista
        </Button>
        <p>Vehículo no encontrado.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-headline font-bold">
          {vehicle.marca} {vehicle.modelo}
        </h1>
        <Button variant="outline" onClick={() => router.push('/vehicles')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver a la lista
        </Button>
      </div>

      <Card className="shadow-xl overflow-hidden">
        <div className="relative h-72 w-full bg-muted flex items-center justify-center">
          {vehicle.url_imagen ? (
            <Image
              src={vehicle.url_imagen}
              alt={`${vehicle.marca} ${vehicle.modelo}`}
              layout="fill"
              objectFit="cover"
              data-ai-hint={vehicle.ai_hint_imagen || vehicle.tipo_vehiculo?.toLowerCase() || "vehiculo emergencia"}
              onError={(e) => { e.currentTarget.src = `https://placehold.co/800x400.png?text=Imagen+no+disponible`; }}
            />
          ) : (
            <Image
              src={`https://placehold.co/800x400.png?text=${encodeURIComponent(vehicle.marca + ' ' + vehicle.modelo)}`}
              alt="Placeholder"
              layout="fill"
              objectFit="cover"
              data-ai-hint={vehicle.ai_hint_imagen || vehicle.tipo_vehiculo?.toLowerCase() || "vehiculo emergencia"}
            />
          )}
           <div className="absolute top-4 right-4">
             <Badge variant="secondary" className={`text-sm px-3 py-1 ${getStatusBadgeClassName(vehicle.estado_vehiculo)}`}>
                {vehicle.estado_vehiculo}
            </Badge>
           </div>
        </div>

        <CardContent className="p-6 space-y-6">
          <section>
            <h2 className="text-xl font-semibold font-headline mb-3 text-primary">Identificación</h2>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
              <DetailItem label="Marca" value={vehicle.marca} icon={Tag} />
              <DetailItem label="Modelo" value={vehicle.modelo} icon={Tag} />
              <DetailItem label="ID Interno" value={vehicle.identificador_interno} icon={Tag} />
              <DetailItem label="Patente" value={vehicle.patente} icon={Tag} />
              <DetailItem label="Año Fabricación" value={vehicle.ano_fabricacion} icon={CalendarDays} />
              <DetailItem label="Tipo Vehículo" value={vehicle.tipo_vehiculo} icon={ShieldCheck} />
            </dl>
          </section>

          <section>
            <h2 className="text-xl font-semibold font-headline mb-3 text-primary">Fechas Clave</h2>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
              <DetailItem label="Fecha Adquisición" value={formatDate(vehicle.fecha_adquisicion)} icon={CalendarDays} />
              <DetailItem label="Próxima Mantención" value={formatDate(vehicle.proxima_mantencion_programada)} icon={Wrench} />
              <DetailItem label="Vencimiento Documentación" value={formatDate(vehicle.vencimiento_documentacion)} icon={FileText} />
            </dl>
          </section>

          {vehicle.notas && (
            <section>
              <h2 className="text-xl font-semibold font-headline mb-3 text-primary">Notas Adicionales</h2>
               <DetailItem label="Notas" value={<p className="whitespace-pre-wrap text-sm">{vehicle.notas}</p>} icon={Info} />
            </section>
          )}

          {/* Sección de Ubicación Actual Eliminada */}

          <section>
            <h2 className="text-xl font-semibold font-headline mb-3 text-primary flex items-center">
              <ScrollText className="mr-2 h-5 w-5" /> Historial de Mantenimiento
            </h2>
            {vehicleMaintenanceHistory.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Descripción Tarea</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Notas</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vehicleMaintenanceHistory.map((task) => (
                      <TableRow key={task.id_mantencion}>
                        <TableCell className="whitespace-nowrap">{formatDate(task.fecha_completada || task.fecha_programada)}</TableCell>
                        <TableCell className="min-w-[200px]">{task.descripcion_mantencion || task.nombre_item_mantenimiento}</TableCell>
                        <TableCell><Badge className={getStatusBadgeClassName(task.estado_mantencion)}>{task.estado_mantencion}</Badge></TableCell>
                        <TableCell className="text-xs">{task.notas_mantencion || "N/A"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No hay historial de mantenimiento registrado para este vehículo.</p>
            )}
          </section>


          <section>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-semibold font-headline text-primary flex items-center">
                <EraIcon className="mr-2 h-5 w-5" /> Equipos ERA Asignados
              </h2>
              <Button variant="outline" size="sm" onClick={handleManageEra}>Gestionar ERA</Button>
            </div>
            {(vehicle.assignedEras && vehicle.assignedEras.length > 0) ? (
              <ul className="list-disc list-inside space-y-1.5 pl-1 text-sm">
                {vehicle.assignedEras.map((era: EraEquipment) => (
                  <li key={era.id_era} className="ml-4 p-1 border-b border-border/50 last:border-b-0">
                    <strong>{era.codigo_era}</strong> - {era.marca} {era.modelo || ''}
                    <span className="block text-xs text-muted-foreground">S/N: {era.numero_serie || 'N/A'} - Estado: {era.estado_era}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No hay equipos ERA asignados a este vehículo.</p>
            )}
          </section>

          <section>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-semibold font-headline text-primary flex items-center">
                <Package className="mr-2 h-5 w-5" /> Ítems de Inventario Asignados
              </h2>
              <Button variant="outline" size="sm" onClick={handleManageInventory}>Gestionar Inventario</Button>
            </div>
            {(vehicle.assignedInventoryItems && vehicle.assignedInventoryItems.length > 0) ? (
              <ul className="list-disc list-inside space-y-1.5 pl-1 text-sm">
                {vehicle.assignedInventoryItems.map((assignedItem: VehicleAssignedInventoryItem) => (
                  <li key={assignedItem.itemDetails.id_item} className="ml-4 p-1 border-b border-border/50 last:border-b-0">
                    <strong>{assignedItem.itemDetails.nombre_item}</strong> ({assignedItem.itemDetails.codigo_item || 'S/C'})
                    <span className="block text-xs text-muted-foreground">
                      Cantidad: {assignedItem.cantidad} {assignedItem.itemDetails.unidad_medida}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No hay ítems de inventario asignados a este vehículo.</p>
            )}
          </section>

          <section className="text-xs text-muted-foreground pt-4 border-t mt-6">
            <p>ID Vehículo: {vehicle.id_vehiculo}</p>
            <p>Última actualización: {formatDate(vehicle.fecha_actualizacion, true)}</p>
            <p>Fecha creación: {formatDate(vehicle.fecha_creacion, true)}</p>
          </section>
        </CardContent>
      </Card>
      
      {vehicle && (
        <ManageVehicleEraDialog
          vehicle={vehicle}
          open={isManageEraDialogOpen}
          onOpenChange={setIsManageEraDialogOpen}
          onAssignmentsUpdated={handleAssignmentsUpdated}
        />
      )}
      {vehicle && (
        <ManageVehicleInventoryDialog
          vehicle={vehicle}
          open={isManageInventoryDialogOpen}
          onOpenChange={setIsManageInventoryDialogOpen}
          onAssignmentsUpdated={handleAssignmentsUpdated}
        />
      )}
    </div>
  );
}

    
