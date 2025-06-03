import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Edit, Trash2, UserCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card"; // Import Card components


const equipmentData = [
  { id: "ERA001", fabDate: "15-01-2020", maintDate: "10-01-2024", inspectDate: "01-07-2024", assignedTo: "Juan Pérez", status: "Operativo" },
  { id: "ERA002", fabDate: "20-06-2019", maintDate: "01-12-2023", inspectDate: "01-06-2024", assignedTo: "Ana Silva", status: "Requiere Inspección" },
  { id: "ERA003", fabDate: "10-03-2021", maintDate: "05-03-2024", inspectDate: "01-09-2024", assignedTo: "Carlos Rojas", status: "En Mantención" },
  { id: "ERA004", fabDate: "01-08-2020", maintDate: "15-02-2024", inspectDate: "01-08-2024", assignedTo: "", status: "Disponible" },
];

export default function EquipmentPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-headline font-bold">Gestión de ERA</h1>
        <Button>
          <PlusCircle className="mr-2 h-5 w-5" /> Agregar Nuevo ERA
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Fecha Fabricación</TableHead>
                <TableHead>Última Mantención</TableHead>
                <TableHead>Próxima Inspección</TableHead>
                <TableHead>Asignado A</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {equipmentData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.id}</TableCell>
                  <TableCell>{item.fabDate}</TableCell>
                  <TableCell>{item.maintDate}</TableCell>
                  <TableCell>{item.inspectDate}</TableCell>
                  <TableCell>{item.assignedTo || "N/A"}</TableCell>
                  <TableCell>
                    <Badge variant={
                      item.status === "Operativo" ? "default" :
                      item.status === "Requiere Inspección" ? "secondary" :
                      item.status === "En Mantención" ? "destructive" : "outline"
                    }
                    className={
                      item.status === "Operativo" ? "bg-green-500 hover:bg-green-600 text-white" :
                      item.status === "Requiere Inspección" ? "bg-yellow-500 hover:bg-yellow-600 text-black" :
                      item.status === "En Mantención" ? "bg-orange-500 hover:bg-orange-600 text-white" : ""
                    }
                    >
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="icon" className="h-8 w-8"><UserCheck className="h-4 w-4" /></Button>
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
