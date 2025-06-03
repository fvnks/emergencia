import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Edit, Trash2, CheckSquare, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card"; // Import Card components

const maintenanceData = [
  { id: "M001", item: "Unidad ERA #E007", type: "ERA", dueDate: "15-08-2024", responsible: "Equipo Mantención", status: "Programada", lastPerformed: "15-02-2024" },
  { id: "M002", item: "Extintor #X012 (Pasillo A)", type: "Extintor", dueDate: "01-09-2024", responsible: "Oficial Seguridad", status: "Pendiente", lastPerformed: "01-09-2023" },
  { id: "M003", item: "Motor Vehículo #V002", type: "Vehículo", dueDate: "30-07-2024", responsible: "Taller Mecánico", status: "En Progreso", lastPerformed: "30-01-2024" },
  { id: "M004", item: "Monitor #Cardio01 Parches Desfib.", type: "Monitor Médico", dueDate: "01-10-2024", responsible: "Paramédico Jefe", status: "Completada", lastPerformed: "01-07-2024" },
];

export default function MaintenancePage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-headline font-bold">Mantención de Equipos</h1>
        <Button>
          <PlusCircle className="mr-2 h-5 w-5" /> Programar Nueva Mantención
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Ítem / Tipo</TableHead>
                <TableHead>Fecha Vencimiento</TableHead>
                <TableHead>Responsable</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Última Realizada</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {maintenanceData.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="font-medium">{task.id}</TableCell>
                  <TableCell>
                    <div>{task.item}</div>
                    <div className="text-xs text-muted-foreground">{task.type}</div>
                  </TableCell>
                  <TableCell>{task.dueDate}</TableCell>
                  <TableCell>{task.responsible}</TableCell>
                  <TableCell>
                    <Badge variant={
                      task.status === "Completada" ? "default" :
                      task.status === "Programada" ? "secondary" :
                      task.status === "En Progreso" ? "outline" : "destructive" // Pendiente
                    }
                    className={
                      task.status === "Completada" ? "bg-green-500 hover:bg-green-600 text-white" :
                      task.status === "Programada" ? "bg-blue-500 hover:bg-blue-600 text-white" :
                      task.status === "En Progreso" ? "bg-yellow-500 hover:bg-yellow-600 text-black" : "" // Pendiente
                    }
                    >
                      {task.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{task.lastPerformed}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="icon" className="h-8 w-8" title={task.status === "Completada" ? "Ver Registro" : "Marcar Completada"}>
                      {task.status === "Completada" ? <Clock className="h-4 w-4" /> : <CheckSquare className="h-4 w-4" />}
                    </Button>
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
