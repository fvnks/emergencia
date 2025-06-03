import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Edit, Trash2, UserCheck } from "lucide-react";

const equipmentData = [
  { id: "ERA001", fabDate: "2020-01-15", maintDate: "2024-01-10", inspectDate: "2024-07-01", assignedTo: "John Doe", status: "Operational" },
  { id: "ERA002", fabDate: "2019-06-20", maintDate: "2023-12-01", inspectDate: "2024-06-01", assignedTo: "Jane Smith", status: "Needs Inspection" },
  { id: "ERA003", fabDate: "2021-03-10", maintDate: "2024-03-05", inspectDate: "2024-09-01", assignedTo: "Mike Brown", status: "In Maintenance" },
  { id: "ERA004", fabDate: "2020-08-01", maintDate: "2024-02-15", inspectDate: "2024-08-01", assignedTo: "", status: "Available" },
];

export default function EquipmentPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-headline font-bold">ERA Management</h1>
        <Button>
          <PlusCircle className="mr-2 h-5 w-5" /> Add New ERA
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Fabrication Date</TableHead>
                <TableHead>Last Maintenance</TableHead>
                <TableHead>Next Inspection</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
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
                      item.status === "Operational" ? "default" :
                      item.status === "Needs Inspection" ? "secondary" :
                      item.status === "In Maintenance" ? "destructive" : "outline"
                    }
                    className={
                      item.status === "Operational" ? "bg-green-500 hover:bg-green-600 text-white" :
                      item.status === "Needs Inspection" ? "bg-yellow-500 hover:bg-yellow-600 text-black" :
                      item.status === "In Maintenance" ? "bg-orange-500 hover:bg-orange-600 text-white" : ""
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

// Dummy Card component to avoid errors if not imported from ui.
// Replace with actual import if Card component is used.
const Card = ({className, children}: {className?: string, children: React.ReactNode}) => <div className={className}>{children}</div>;
const CardContent = ({className, children}: {className?: string, children: React.ReactNode}) => <div className={className}>{children}</div>;

