import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Edit, Trash2, Package, ArrowRightLeft, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const inventoryData = [
  { id: "INV001", name: "Safety Helmet", category: "EPP", location: "Warehouse A / Shelf 1", quantity: 50, assignedTo: "General Pool" },
  { id: "INV002", name: "Fire Hose (25m)", category: "Firefighting", location: "Vehicle V001 / Compartment 3", quantity: 4, assignedTo: "Vehicle V001" },
  { id: "INV003", name: "First Aid Kit (Large)", category: "Medical", location: "Infirmary / Cabinet B", quantity: 5, assignedTo: "Infirmary Stock" },
  { id: "INV004", name: "Gloves (Heavy Duty)", category: "EPP", location: "Warehouse A / Shelf 2", quantity: 100, assignedTo: "General Pool"},
  { id: "INV005", name: "Oxygen Cylinder (D Type)", category: "Medical", location: "Ambulance V002 / Rack 1", quantity: 6, assignedTo: "Ambulance V002"},
];

export default function InventoryPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-headline font-bold">General Inventory</h1>
        <Button>
          <PlusCircle className="mr-2 h-5 w-5" /> Add New Item
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Item Name / Category</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Assigned To / EPP</TableHead>
                <TableHead className="text-right">Actions</TableHead>
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
                    {item.category === "EPP" && item.assignedTo === "General Pool" ? (
                        <Button variant="outline" size="xs" className="text-xs h-6">
                            <UserPlus className="mr-1 h-3 w-3" /> Assign EPP
                        </Button>
                    ) : (
                        item.assignedTo
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="icon" className="h-8 w-8" title="Movement History"><ArrowRightLeft className="h-4 w-4" /></Button>
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

// Add a size "xs" to ButtonProps if it's not already there in ui/button.tsx for smaller buttons.
// This is a conceptual note, actual modification to ui/button.tsx would be needed if "xs" is not supported.
// For this example, we assume size="sm" is the smallest or we use custom styling.
declare module "@/components/ui/button" {
  interface ButtonProps {
    size?: "default" | "sm" | "lg" | "icon" | "xs";
  }
}
