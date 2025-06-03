import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlusCircle, Edit, Trash2, ShieldCheck, ClipboardList, Mail, Phone } from "lucide-react";

const personnelData = [
  { id: "P001", name: "Juan Pérez", role: "Jefe de Brigada", email: "juan.perez@brigada.cl", phone: "9 8765 4321", assignedEpp: ["Casco H01", "Guantes G05"], tasksCount: 3, avatarSeed: "JP" },
  { id: "P002", name: "Ana Silva", role: "Paramédico Líder", email: "ana.silva@brigada.cl", phone: "9 1234 5678", assignedEpp: ["Casco H02", "Chaleco Médico M01"], tasksCount: 5, avatarSeed: "AS" },
  { id: "P003", name: "Carlos Rojas", role: "Brigadista", email: "carlos.rojas@brigada.cl", phone: "9 5555 1234", assignedEpp: ["Casco H03", "ERA E001"], tasksCount: 2, avatarSeed: "CR" },
  { id: "P004", name: "Sofía Reyes", role: "Conductor/Operador", email: "sofia.reyes@brigada.cl", phone: "9 4444 5678", assignedEpp: ["Casco H04", "Botas Seguridad B02"], tasksCount: 1, avatarSeed: "SR" },
  { id: "P005", name: "Martín González", role: "Brigadista", email: "martin.gonzalez@brigada.cl", phone: "9 3333 9012", assignedEpp: ["Casco H05", "ERA E002"], tasksCount: 4, avatarSeed: "MG" },
  { id: "P006", name: "Valentina Torres", role: "Oficial Logística", email: "valentina.torres@brigada.cl", phone: "9 2222 3456", assignedEpp: ["Casco H06", "Portapapeles C01"], tasksCount: 6, avatarSeed: "VT" },
  { id: "P007", name: "Benjamín Soto", role: "Brigadista", email: "benjamin.soto@brigada.cl", phone: "9 1111 7890", assignedEpp: ["Casco H07", "ERA E003"], tasksCount: 2, avatarSeed: "BS" },
  { id: "P008", name: "Isabella Flores", role: "Paramédico", email: "isabella.flores@brigada.cl", phone: "9 9900 1230", assignedEpp: ["Casco H08", "Botiquín K02"], tasksCount: 3, avatarSeed: "IF" },
  { id: "P009", name: "Matías Castro", role: "Conductor/Operador", email: "matias.castro@brigada.cl", phone: "9 8877 4567", assignedEpp: ["Casco H09", "Radio R01"], tasksCount: 1, avatarSeed: "MC" },
  { id: "P010", name: "Antonia Vargas", role: "Brigadista", email: "antonia.vargas@brigada.cl", phone: "9 7766 8901", assignedEpp: ["Casco H10", "ERA E004"], tasksCount: 2, avatarSeed: "AV" },
  { id: "P011", name: "Lucas Moya", role: "Oficial Comunicaciones", email: "lucas.moya@brigada.cl", phone: "9 6655 2109", assignedEpp: ["Casco H11", "Audífonos HS01"], tasksCount: 4, avatarSeed: "LM" },
];

export default function PersonnelPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-headline font-bold">Directorio de Personal</h1>
        <Button>
          <PlusCircle className="mr-2 h-5 w-5" /> Agregar Nuevo Personal
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {personnelData.map((person) => (
          <Card key={person.id} className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
            <CardHeader className="items-center text-center">
              <Avatar className="h-24 w-24 mb-3">
                <AvatarImage src={`https://placehold.co/100x100.png?text=${person.avatarSeed}`} alt={person.name} data-ai-hint="persona retrato" />
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
                  <span className="font-medium">EPP: </span>{person.assignedEpp.join(", ") || "Ninguno"}
                </div>
              </div>
              <div className="flex items-center">
                <ClipboardList className="mr-2 h-4 w-4 text-muted-foreground" />
                Tareas Activas: {person.tasksCount}
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2 border-t pt-4">
              <Button variant="outline" size="sm"><Edit className="mr-1 h-4 w-4" /> Editar</Button>
              <Button variant="destructive" size="sm"><Trash2 className="mr-1 h-4 w-4" /> Eliminar</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
