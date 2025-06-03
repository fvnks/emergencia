import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Edit, Trash2, Package, ArrowRightLeft, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card"; // Import Card components

const inventoryData = [
  { id: "INV001", name: "Casco Seguridad", category: "EPP", location: "Bodega A / Estante 1", quantity: 50, assignedTo: "Uso General" },
  { id: "INV002", name: "Manguera Incendio (25m)", category: "Combate Incendios", location: "Vehículo V001 / Compartimiento 3", quantity: 4, assignedTo: "Vehículo V001" },
  { id: "INV003", name: "Botiquín Primeros Auxilios (Grande)", category: "Médico", location: "Enfermería / Gabinete B", quantity: 5, assignedTo: "Stock Enfermería" },
  { id: "INV004", name: "Guantes (Alta Resistencia)", category: "EPP", location: "Bodega A / Estante 2", quantity: 100, assignedTo: "Uso General"},
  { id: "INV005", name: "Cilindro Oxígeno (Tipo D)", category: "Médico", location: "Ambulancia V002 / Rack 1", quantity: 6, assignedTo: "Ambulancia V002"},
];

export default function InventoryPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-headline font-bold">Inventario General</h1>
        <Button>
          <PlusCircle className="mr-2 h-5 w-5" /> Agregar Nuevo Ítem
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nombre Ítem / Categoría</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead>Cantidad</TableHead>
                <TableHead>Asignado A / EPP</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventoryData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.id}</TableCell>
                  <TableCell>
                    <div>{item.name}</div>
                    <div className="text-xs text-muted-foreground">{item.category}</div>
                  </TableCell>
                  <TableCell>{item.location}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>
                    {item.category === "EPP" && item.assignedTo === "Uso General" ? (
                        <Button variant="outline" size="xs" className="text-xs h-6">
                            <UserPlus className="mr-1 h-3 w-3" /> Asignar EPP
                        </Button>
                    ) : (
                        item.assignedTo
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="icon" className="h-8 w-8" title="Historial Movimiento"><ArrowRightLeft className="h-4 w-4" /></Button>
                    <Button variant="outline" size="icon" className="h-8 w-8"><Edit className="h-4 w-4" /></Button>
                    <Button variant="destructive" size="icon" className="h-8 w-8"><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// Add a size "xs" to ButtonProps if it's not already there in ui/button.tsx for smaller buttons.
// This is a conceptual note, actual modification to ui/button.tsx would be needed if "xs" is not supported.
// For this example, we assume size="sm" is the smallest or we use custom styling.
declare module "@/components/ui/button" {
  interface ButtonProps {
    size?: "default" | "sm" | "lg" | "icon" | "xs";
  }
}
