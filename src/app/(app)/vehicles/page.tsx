import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Edit, Trash2, FileText, Tool } from "lucide-react";
import Image from "next/image";

const vehiclesData = [
  { id: "V001", brand: "Mercedes-Benz", model: "Atego 1726", plate: "PPU-1234", status: "Operative", nextMaintenance: "2024-09-15", docsDue: "2024-12-01", image: "https://placehold.co/600x400.png?text=MB+Atego", aiHint: "fire truck" },
  { id: "V002", brand: "Renault", model: "Midlum 270", plate: "XYZ-5678", status: "In Maintenance", nextMaintenance: "2024-08-01", docsDue: "2025-02-10", image: "https://placehold.co/600x400.png?text=Renault+Midlum", aiHint: "ambulance" },
  { id: "V003", brand: "Iveco", model: "Daily", plate: "ABC-9012", status: "Operative", nextMaintenance: "2024-10-20", docsDue: "2024-11-15", image: "https://placehold.co/600x400.png?text=Iveco+Daily", aiHint: "utility vehicle" },
];

export default function VehiclesPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-headline font-bold">Vehicle Management</h1>
        <Button>
          <PlusCircle className="mr-2 h-5 w-5" /> Add New Vehicle
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
                <span className="text-sm font-medium text-muted-foreground">Status: </span>
                <Badge variant={vehicle.status === "Operative" ? "default" : "destructive"} className={vehicle.status === "Operative" ? "bg-green-500 hover:bg-green-600 text-white" : ""}>
                  {vehicle.status}
                </Badge>
              </div>
              <div className="flex items-center text-sm">
                <Tool className="mr-2 h-4 w-4 text-muted-foreground" />
                Next Maintenance: {vehicle.nextMaintenance}
              </div>
              <div className="flex items-center text-sm">
                <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                Documents Due: {vehicle.docsDue}
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2 border-t pt-4">
              <Button variant="outline" size="sm"><Edit className="mr-1 h-4 w-4" /> Edit</Button>
              <Button variant="destructive" size="sm"><Trash2 className="mr-1 h-4 w-4" /> Delete</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
