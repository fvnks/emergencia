
"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getVehicleById } from "@/services/vehicleService";
import type { Vehicle } from "@/types/vehicleTypes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertTriangle, ArrowLeft, CalendarDays, Tag, ShieldCheck, Info, FileText, Wrench, Package, ShieldAlert as EraIcon } from "lucide-react";
import { format, parseISO, isValid } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from "@/hooks/use-toast";
import { ManageVehicleEraDialog } from "@/components/vehicles/manage-vehicle-era-dialog";
import { ManageVehicleInventoryDialog } from "@/components/vehicles/manage-vehicle-inventory-dialog"; // Importar el nuevo diálogo

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isManageEraDialogOpen, setIsManageEraDialogOpen] = useState(false);
  const [isManageInventoryDialogOpen, setIsManageInventoryDialogOpen] = useState(false);

  const fetchVehicleDetails = useCallback(async () => {
    if (id) {
      const vehicleId = parseInt(id, 10);
      if (isNaN(vehicleId)) {
        setError("ID de vehículo inválido.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const data = await getVehicleById(vehicleId);
        if (data) {
          setVehicle(data);
        } else {
          setError("Vehículo no encontrado.");
        }
      } catch (err) {
        console.error("Error fetching vehicle details:", err);
        setError(err instanceof Error ? err.message : "No se pudieron cargar los detalles del vehículo.");
      } finally {
        setLoading(false);
      }
    }
  }, [id]);

  useEffect(() => {
    fetchVehicleDetails();
  }, [fetchVehicleDetails]);

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString.includes('T') ? dateString : dateString + "T00:00:00Z");
      if (!isValid(date)) return "Fecha inválida";
      return format(date, "PPP", { locale: es });
    } catch (e) {
      return dateString;
    }
  };

  const getStatusBadgeClassName = (status?: Vehicle["estado_vehiculo"]) => {
    if (!status) return "";
    switch (status) {
      case "Operativo": return "bg-green-500 hover:bg-green-600 text-white";
      case "En Mantención": return "bg-yellow-500 hover:bg-yellow-600 text-black";
      case "Fuera de Servicio": return "bg-red-600 hover:bg-red-700 text-white";
      default: return "bg-gray-400 text-white";
    }
  };

  const handleManageEra = () => {
    setIsManageEraDialogOpen(true);
  };

  const handleAssignmentsUpdated = () => {
    fetchVehicleDetails(); // Recargar datos del vehículo
  };

  const handleManageInventory = () => {
    setIsManageInventoryDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-10">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
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
        <Card className="shadow-lg">
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

          <section>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-semibold font-headline text-primary flex items-center">
                <EraIcon className="mr-2 h-5 w-5" /> Equipos ERA Asignados
              </h2>
              <Button variant="outline" size="sm" onClick={handleManageEra}>Gestionar ERA</Button>
            </div>
            {(vehicle.assignedEraIds && vehicle.assignedEraIds.length > 0) ? (
              <ul className="list-disc list-inside space-y-1 pl-5 text-sm">
                {vehicle.assignedEraIds.map(eraId => (
                  // Idealmente, aquí tendrías el nombre/código del ERA, no solo el ID.
                  // Esto requiere que getVehicleById devuelva los detalles de los ERAs asignados.
                  <li key={eraId}>Equipo ERA ID: {eraId} (Se requiere backend para mostrar detalles)</li>
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
              <ul className="list-disc list-inside space-y-1 pl-5 text-sm">
                {vehicle.assignedInventoryItems.map(item => (
                  // Idealmente, aquí tendrías el nombre del ítem, no solo el ID.
                  // Esto requiere que getVehicleById devuelva los detalles de los ítems asignados.
                  <li key={item.id_item}>
                    Ítem ID: {item.id_item} - Cantidad: {item.cantidad} (Se requiere backend para mostrar detalles)
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No hay ítems de inventario asignados a este vehículo.</p>
            )}
          </section>

          <section className="text-xs text-muted-foreground pt-4 border-t mt-6">
            <p>ID Vehículo: {vehicle.id_vehiculo}</p>
            <p>Última actualización: {formatDate(vehicle.fecha_actualizacion)}</p>
            <p>Fecha creación: {formatDate(vehicle.fecha_creacion)}</p>
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

