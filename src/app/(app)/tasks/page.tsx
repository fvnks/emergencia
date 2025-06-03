import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Edit, Trash2, Eye, UserCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const tasksData = [
  { id: "T001", description: "Inspect Vehicle V001", assignedTo: "John Doe", dueDate: "2024-08-05", status: "Pending" },
  { id: "T002", description: "Restock First Aid Kits", assignedTo: "Jane Smith", dueDate: "2024-08-02", status: "In Process" },
  { id: "T003", description: "Conduct ERA Drill", assignedTo: "Team Alpha", dueDate: "2024-08-10", status: "Completed" },
  { id: "T004", description: "Update Inventory Software", assignedTo: "Mike Brown", dueDate: "2024-08-15", status: "Pending" },
  { id: "T005", description: "Monthly Station Cleaning", assignedTo: "All Personnel", dueDate: "2024-08-30", status: "Scheduled" },
];

const users = ["All Personnel", "John Doe", "Jane Smith", "Mike Brown", "Team Alpha", "Team Bravo"]; // Example users/teams

export default function TasksPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-headline font-bold">Task Management</h1>
        <div className="flex gap-2 items-center">
          <Select defaultValue="All Personnel">
            <SelectTrigger className="w-[180px] bg-card">
              <SelectValue placeholder="Filter by user" />
            </SelectTrigger>
            <SelectContent>
              {users.map(user => <SelectItem key={user} value={user}>{user}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button>
            <PlusCircle className="mr-2 h-5 w-5" /> Create New Task
          </Button>
        </div>
      </div>

      <Card className="shadow-lg">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
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
                      task.status === "Completed" ? "default" :
                      task.status === "In Process" ? "secondary" :
                      task.status === "Scheduled" ? "outline" : "destructive" // Pending
                    }
                    className={
                      task.status === "Completed" ? "bg-green-500 hover:bg-green-600 text-white" :
                      task.status === "In Process" ? "bg-yellow-500 hover:bg-yellow-600 text-black" :
                      task.status === "Scheduled" ? "bg-blue-500 hover:bg-blue-600 text-white" : ""
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

// Dummy Card component to avoid errors if not imported from ui.
const Card = ({className, children}: {className?: string, children: React.ReactNode}) => <div className={className}>{children}</div>;
const CardContent = ({className, children}: {className?: string, children: React.ReactNode}) => <div className={className}>{children}</div>;
