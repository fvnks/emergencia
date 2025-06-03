import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Edit, Trash2, CheckSquare, Clock } from "lucide-react";

const maintenanceData = [
  { id: "M001", item: "ERA Unit #E007", type: "ERA", dueDate: "2024-08-15", responsible: "Maintenance Team", status: "Scheduled", lastPerformed: "2024-02-15" },
  { id: "M002", item: "Extinguisher #X012 (Hall A)", type: "Extinguisher", dueDate: "2024-09-01", responsible: "Safety Officer", status: "Pending", lastPerformed: "2023-09-01" },
  { id: "M003", item: "Vehicle #V002 Engine", type: "Vehicle", dueDate: "2024-07-30", responsible: "Mechanic Workshop", status: "In Progress", lastPerformed: "2024-01-30" },
  { id: "M004", item: "Monitor #Heart01 Defib Pads", type: "Medical Monitor", dueDate: "2024-10-01", responsible: "Paramedic Lead", status: "Completed", lastPerformed: "2024-07-01" },
];

export default function MaintenancePage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-headline font-bold">Equipment Maintenance</h1>
        <Button>
          <PlusCircle className="mr-2 h-5 w-5" /> Schedule New Maintenance
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Item / Type</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Responsible</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Performed</TableHead>
                <TableHead className="text-right">Actions</TableHead>
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
                      task.status === "Completed" ? "default" :
                      task.status === "Scheduled" ? "secondary" :
                      task.status === "In Progress" ? "outline" : "destructive" // Pending
                    }
                    className={
                      task.status === "Completed" ? "bg-green-500 hover:bg-green-600 text-white" :
                      task.status === "Scheduled" ? "bg-blue-500 hover:bg-blue-600 text-white" :
                      task.status === "In Progress" ? "bg-yellow-500 hover:bg-yellow-600 text-black" : "" // Pending
                    }
                    >
                      {task.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{task.lastPerformed}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="icon" className="h-8 w-8" title={task.status === "Completed" ? "View Record" : "Mark Completed"}>
                      {task.status === "Completed" ? <Clock className="h-4 w-4" /> : <CheckSquare className="h-4 w-4" />}
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

// Dummy Card component to avoid errors if not imported from ui.
const Card = ({className, children}: {className?: string, children: React.ReactNode}) => <div className={className}>{children}</div>;
const CardContent = ({className, children}: {className?: string, children: React.ReactNode}) => <div className={className}>{children}</div>;
