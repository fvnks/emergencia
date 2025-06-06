
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Eye, Edit, Trash2, ClipboardCheck, Search, Filter, FilePlus2, ListChecks } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// import { AddChecklistDialog } from "@/components/checklists/add-checklist-dialog"; // Se creará después
// import { DeleteChecklistDialog } from "@/components/checklists/delete-checklist-dialog"; // Se creará después
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from "@/hooks/use-toast";

interface Checklist {
  id: string;
  name: string;
  description?: string;
  itemCount: number;
  category?: string;
  lastModified: string;
  status: 'Nuevo' | 'En Progreso' | 'Completado'; // Ejemplo de estados
}

// Datos simulados iniciales
const SIMULATED_CHECKLISTS: Checklist[] = [
  { id: "chk1", name: "Inspección Pre-Operacional Bomba B-01", description: "Checklist diario antes de sacar la unidad.", itemCount: 15, category: "Vehicular", lastModified: "2024-07-28T10:00:00Z", status: "Nuevo" },
  { id: "chk2", name: "Revisión Semanal Equipos ERA", description: "Verificación de presión, estado de máscaras y cilindros.", itemCount: 8, category: "Equipos ERA", lastModified: "2024-07-25T14:30:00Z", status: "En Progreso" },
  { id: "chk3", name: "Procedimiento Incidente HazMat Nivel 1", description: "Pasos a seguir para incidentes con materiales peligrosos.", itemCount: 22, category: "Procedimientos", lastModified: "2024-06-15T09:00:00Z", status: "Completado" },
  { id: "chk4", name: "Checklist de Ambulancia SAMU-01", description: "Revisión de equipamiento médico y estado general.", itemCount: 30, category: "Vehicular", lastModified: "2024-07-29T08:15:00Z", status: "Nuevo" },
];

export default function ChecklistsPage() {
  const [checklists, setChecklists] = useState<Checklist[]>(SIMULATED_CHECKLISTS);
  const [loading, setLoading] = useState(false); // Para futuras cargas de datos
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const { toast } = useToast();

  // const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  // const [selectedChecklistForDelete, setSelectedChecklistForDelete] = useState<Checklist | null>(null);

  const handleOpenAddDialog = () => {
    // setIsAddDialogOpen(true);
    toast({ title: "Próximamente", description: "La creación de checklists se implementará en una futura actualización." });
  };

  const handleViewChecklist = (id: string) => {
    toast({ title: "Próximamente", description: `Ver/Completar checklist ${id} se implementará pronto.` });
  };
  
  const handleEditChecklist = (id: string) => {
    toast({ title: "Próximamente", description: `Editar checklist ${id} se implementará pronto.` });
  };
  
  const handleDeleteChecklist = (checklist: Checklist) => {
    // setSelectedChecklistForDelete(checklist);
    toast({ title: "Próximamente", description: `Eliminar checklist ${checklist.name} se implementará pronto.` });
  };

  const filteredChecklists = checklists.filter(checklist => {
    const matchesSearchTerm =
      checklist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (checklist.description && checklist.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === "all" || checklist.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || checklist.status === statusFilter;
    return matchesSearchTerm && matchesCategory && matchesStatus;
  });

  const uniqueCategories = Array.from(new Set(SIMULATED_CHECKLISTS.map(c => c.category).filter(Boolean))) as string[];
  const uniqueStatuses = Array.from(new Set(SIMULATED_CHECKLISTS.map(c => c.status))) as string[];


  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-4 mb-6 bg-card border rounded-lg shadow-sm">
        <h1 className="text-2xl font-headline font-bold flex items-center">
          <ListChecks className="mr-3 h-7 w-7 text-primary" />
          Gestión de Checklists y Formularios
        </h1>
        <Button onClick={handleOpenAddDialog}>
          <FilePlus2 className="mr-2 h-5 w-5" /> Crear Nuevo Checklist
        </Button>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Filtros de Checklists</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-background"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter} disabled={uniqueCategories.length === 0}>
            <SelectTrigger className="w-full sm:w-[200px] bg-background">
              <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las Categorías</SelectItem>
              {uniqueCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
            </SelectContent>
          </Select>
           <Select value={statusFilter} onValueChange={setStatusFilter} disabled={uniqueStatuses.length === 0}>
            <SelectTrigger className="w-full sm:w-[180px] bg-background">
              <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los Estados</SelectItem>
              {uniqueStatuses.map(stat => <SelectItem key={stat} value={stat}>{stat}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {loading ? (
        <p>Cargando checklists...</p>
      ) : filteredChecklists.length === 0 ? (
        <Card className="text-center">
          <CardHeader>
             <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full w-fit">
                <ClipboardCheck className="h-10 w-10" />
            </div>
            <CardTitle className="mt-4">
                {checklists.length === 0 ? "No hay Checklists Creados" : "No se encontraron checklists"}
            </CardTitle>
            <CardDescription>
              {checklists.length === 0
                ? "Comienza creando tu primer checklist digital."
                : "Intenta ajustar los filtros o el término de búsqueda."
              }
            </CardDescription>
          </CardHeader>
           {checklists.length === 0 && (
            <CardContent>
              <Button onClick={handleOpenAddDialog}>
                <FilePlus2 className="mr-2 h-5 w-5" /> Crear Nuevo Checklist
              </Button>
            </CardContent>
          )}
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredChecklists.map((checklist) => (
            <Card key={checklist.id} className="flex flex-col h-full">
              <CardHeader>
                <div className="flex justify-between items-start gap-2">
                    <CardTitle className="font-headline text-lg flex-grow">{checklist.name}</CardTitle>
                    {checklist.category && <Badge variant="outline">{checklist.category}</Badge>}
                </div>
                {checklist.description && <CardDescription className="text-xs pt-1">{checklist.description}</CardDescription>}
              </CardHeader>
              <CardContent className="flex-grow space-y-2 text-sm">
                <div className="flex items-center text-muted-foreground">
                  <ClipboardCheck className="mr-1.5 h-4 w-4" />
                  {checklist.itemCount} Ítems
                </div>
                 <div className="flex items-center text-muted-foreground">
                  <span className="mr-1.5">Estado:</span>
                  <Badge 
                    variant={checklist.status === 'Completado' ? 'default' : checklist.status === 'En Progreso' ? 'secondary' : 'outline'}
                    className={
                        checklist.status === 'Completado' ? 'bg-green-500 text-white' :
                        checklist.status === 'En Progreso' ? 'bg-yellow-500 text-black' :
                        'border-primary text-primary'
                    }
                  >
                    {checklist.status}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  Últ. Modificación: {format(parseISO(checklist.lastModified), "dd MMM, yyyy 'a las' HH:mm", { locale: es })}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 border-t pt-4">
                <Button variant="outline" size="sm" onClick={() => handleViewChecklist(checklist.id)}>
                  <Eye className="mr-1 h-4 w-4" /> Ver/Completar
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleEditChecklist(checklist.id)}>
                  <Edit className="mr-1 h-4 w-4" /> Editar
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDeleteChecklist(checklist)}>
                  <Trash2 className="mr-1 h-4 w-4" /> Eliminar
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      {/* 
      <AddChecklistDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onChecklistAdded={() => { console.log("Checklist añadido"); }}
      />
      {selectedChecklistForDelete && (
        <DeleteChecklistDialog
          checklist={selectedChecklistForDelete}
          onChecklistDeleted={() => { console.log("Checklist eliminado"); setSelectedChecklistForDelete(null); }}
          open={!!selectedChecklistForDelete}
          onOpenChange={(open) => { if (!open) setSelectedChecklistForDelete(null); }}
        />
      )}
      */}
    </div>
  );
}
