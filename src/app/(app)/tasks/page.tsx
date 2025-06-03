import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Edit, Trash2, Eye, UserCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card"; // Import Card components
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const tasksData = [
  { id: "T001", description: "Inspeccionar Vehículo V001", assignedTo: "Juan Pérez", dueDate: "05-08-2024", status: "Pendiente" },
  { id: "T002", description: "Reponer Botiquines", assignedTo: "Ana Silva", dueDate: "02-08-2024", status: "En Proceso" },
  { id: "T003", description: "Realizar Simulacro ERA", assignedTo: "Equipo Alfa", dueDate: "10-08-2024", status: "Completada" },
  { id: "T004", description: "Actualizar Software Inventario", assignedTo: "Carlos Rojas", dueDate: "15-08-2024", status: "Pendiente" },
  { id: "T005", description: "Limpieza Mensual Estación", assignedTo: "Todo el Personal", dueDate: "30-08-2024", status: "Programada" },
];

const users = ["Todo el Personal", "Juan Pérez", "Ana Silva", "Carlos Rojas", "Equipo Alfa", "Equipo Bravo"];

export default function TasksPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-headline font-bold">Gestión de Tareas</h1>
        <div className="flex gap-2 items-center">
          <Select defaultValue="Todo el Personal">
            <SelectTrigger className="w-[180px] bg-card">
              <SelectValue placeholder="Filtrar por usuario" />
            </SelectTrigger>
            <SelectContent>
              {users.map(user => <SelectItem key={user} value={user}>{user}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button>
            <PlusCircle className="mr-2 h-5 w-5" /> Crear Nueva Tarea
          </Button>
        </div>
      </div>

      <Card className="shadow-lg">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Asignado A</TableHead>
                <TableHead>Fecha Vencimiento</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasksData.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="font-medium">{task.id}</TableCell>
                  <TableCell>{task.description}</TableCell>
                  <TableCell>{task.assignedTo}</TableCell>
                  <TableCell>{task.dueDate}</TableCell>
                  <TableCell>
                    <Badge variant={
                      task.status === "Completada" ? "default" :
                      task.status === "En Proceso" ? "secondary" :
                      task.status === "Programada" ? "outline" : "destructive" // Pendiente
                    }
                    className={
                      task.status === "Completada" ? "bg-green-500 hover:bg-green-600 text-white" :
                      task.status === "En Proceso" ? "bg-yellow-500 hover:bg-yellow-600 text-black" :
                      task.status === "Programada" ? "bg-blue-500 hover:bg-blue-600 text-white" : ""
                    }
                    >
                      {task.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="icon" className="h-8 w-8"><Eye className="h-4 w-4" /></Button>
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
