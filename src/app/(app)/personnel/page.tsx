import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlusCircle, Edit, Trash2, ShieldCheck, ClipboardList, Mail, Phone } from "lucide-react";

const personnelData = [
  { id: "P001", name: "John Doe", role: "Brigade Leader", email: "john.doe@brigade.com", phone: "555-1234", assignedEpp: ["Helmet H01", "Gloves G05"], tasksCount: 3, avatarSeed: "JD" },
  { id: "P002", name: "Jane Smith", role: "Paramedic Lead", email: "jane.smith@brigade.com", phone: "555-5678", assignedEpp: ["Helmet H02", "Medical Vest M01"], tasksCount: 5, avatarSeed: "JS" },
  { id: "P003", name: "Mike Brown", role: "Firefighter", email: "mike.brown@brigade.com", phone: "555-9012", assignedEpp: ["Helmet H03", "ERA E001"], tasksCount: 2, avatarSeed: "MB" },
  { id: "P004", name: "Sarah Wilson", role: "Driver/Operator", email: "sarah.wilson@brigade.com", phone: "555-3456", assignedEpp: ["Helmet H04", "Safety Boots B02"], tasksCount: 1, avatarSeed: "SW" },
  { id: "P005", name: "David Lee", role: "Firefighter", email: "david.lee@brigade.com", phone: "555-7890", assignedEpp: ["Helmet H05", "ERA E002"], tasksCount: 4, avatarSeed: "DL" },
  { id: "P006", name: "Emily Garcia", role: "Logistics Officer", email: "emily.garcia@brigade.com", phone: "555-2345", assignedEpp: ["Helmet H06", "Clipboard C01"], tasksCount: 6, avatarSeed: "EG" },
  { id: "P007", name: "Chris Taylor", role: "Firefighter", email: "chris.taylor@brigade.com", phone: "555-6789", assignedEpp: ["Helmet H07", "ERA E003"], tasksCount: 2, avatarSeed: "CT" },
  { id: "P008", name: "Jessica Rodriguez", role: "Paramedic", email: "jessica.rodriguez@brigade.com", phone: "555-1230", assignedEpp: ["Helmet H08", "Medical Kit K02"], tasksCount: 3, avatarSeed: "JR" },
  { id: "P009", name: "Kevin Martinez", role: "Driver/Operator", email: "kevin.martinez@brigade.com", phone: "555-4567", assignedEpp: ["Helmet H09", "Radio R01"], tasksCount: 1, avatarSeed: "KM" },
  { id: "P010", name: "Laura Hernandez", role: "Firefighter", email: "laura.hernandez@brigade.com", phone: "555-8901", assignedEpp: ["Helmet H10", "ERA E004"], tasksCount: 2, avatarSeed: "LH" },
  { id: "P011", name: "Daniel Kim", role: "Communications Officer", email: "daniel.kim@brigade.com", phone: "555-2109", assignedEpp: ["Helmet H11", "Headset HS01"], tasksCount: 4, avatarSeed: "DK" },
];

export default function PersonnelPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-headline font-bold">Personnel Directory</h1>
        <Button>
          <PlusCircle className="mr-2 h-5 w-5" /> Add New Personnel
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {personnelData.map((person) => (
          <Card key={person.id} className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
            <CardHeader className="items-center text-center">
              <Avatar className="h-24 w-24 mb-3">
                <AvatarImage src={`https://placehold.co/100x100.png?text=${person.avatarSeed}`} alt={person.name} data-ai-hint="person portrait" />
                <AvatarFallback>{person.avatarSeed}</AvatarFallback>
              </Avatar>
              <CardTitle className="font-headline text-xl">{person.name}</CardTitle>
              <CardDescription>{person.role}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-2 text-sm">
              <div className="flex items-center">
                <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                {person.email}
              </div>
              <div className="flex items-center">
                <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                {person.phone}
              </div>
              <div className="flex items-start pt-1">
                <ShieldCheck className="mr-2 h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium">EPP: </span>{person.assignedEpp.join(", ") || "None"}
                </div>
              </div>
              <div className="flex items-center">
                <ClipboardList className="mr-2 h-4 w-4 text-muted-foreground" />
                Active Tasks: {person.tasksCount}
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
