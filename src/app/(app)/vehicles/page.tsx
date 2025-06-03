import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Edit, Trash2, FileText, Wrench } from "lucide-react";
import Image from "next/image";

const vehiclesData = [
  { id: "V001", brand: "Mercedes-Benz", model: "Atego 1726", plate: "BFRT-56", status: "Operativo", nextMaintenance: "15-09-2024", docsDue: "01-12-2024", image: "https://placehold.co/600x400.png?text=MB+Atego", aiHint: "carro bomba" },
  { id: "V002", brand: "Renault", model: "Midlum 270", plate: "CRSL-02", status: "En Mantención", nextMaintenance: "01-08-2024", docsDue: "10-02-2025", image: "https://placehold.co/600x400.png?text=Renault+Midlum", aiHint: "ambulancia" },
  { id: "V003", brand: "Iveco", model: "Daily", plate: "GHTJ-34", status: "Operativo", nextMaintenance: "20-10-2024", docsDue: "15-11-2024", image: "https://placehold.co/600x400.png?text=Iveco+Daily", aiHint: "vehículo utilidad" },
];

export default function VehiclesPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-headline font-bold">Gestión de Vehículos</h1>
        <Button>
          <PlusCircle className="mr-2 h-5 w-5" /> Agregar Nuevo Vehículo
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {vehiclesData.map((vehicle) => (
          <Card key={vehicle.id} className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
            <CardHeader>
              <div className="relative h-48 w-full mb-4 rounded-t-lg overflow-hidden">
                <Image src={vehicle.image} alt={`${vehicle.brand} ${vehicle.model}`} layout="fill" objectFit="cover" data-ai-hint={vehicle.aiHint} />
              </div>
              <CardTitle className="font-headline text-xl">{vehicle.brand} {vehicle.model}</CardTitle>
              <CardDescription>Patente: {vehicle.plate}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-3">
              <div>
                <span className="text-sm font-medium text-muted-foreground">Estado: </span>
                <Badge variant={vehicle.status === "Operativo" ? "default" : "destructive"} className={vehicle.status === "Operativo" ? "bg-green-500 hover:bg-green-600 text-white" : ""}>
                  {vehicle.status}
                </Badge>
              </div>
              <div className="flex items-center text-sm">
                <Wrench className="mr-2 h-4 w-4 text-muted-foreground" />
                Próxima Mantención: {vehicle.nextMaintenance}
              </div>
              <div className="flex items-center text-sm">
                <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                Documentos Vencen: {vehicle.docsDue}
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2 border-t pt-4">
              <Button variant="outline" size="sm"><Edit className="mr-1 h-4 w-4" /> Editar</Button>
              <Button variant="destructive" size="sm"><Trash2 className="mr-1 h-4 w-4" /> Eliminar</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
