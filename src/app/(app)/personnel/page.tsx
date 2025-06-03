
"use client";

import type { User } from "@/services/userService"; // Import User type
import { useEffect, useState } from "react";
import { getAllUsers } from "@/services/userService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlusCircle, Edit, Trash2, ShieldCheck, ClipboardList, Mail, Phone, Loader2, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function PersonnelPage() {
  const [personnel, setPersonnel] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPersonnel() {
      try {
        setLoading(true);
        setError(null);
        const users = await getAllUsers();
        setPersonnel(users);
      } catch (err) {
        console.error("Error fetching personnel:", err);
        setError(err instanceof Error ? err.message : "No se pudo cargar el personal.");
      } finally {
        setLoading(false);
      }
    }
    fetchPersonnel();
  }, []);

  const getInitials = (name?: string) => {
    if (!name) return '??';
    const nameParts = name.split(' ');
    if (nameParts.length > 1) {
      return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-10">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg font-semibold">Cargando personal...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="max-w-2xl mx-auto">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error al Cargar Personal</AlertTitle>
        <AlertDescription>
          {error}
          <Button onClick={() => window.location.reload()} variant="link" className="p-0 h-auto ml-2">Reintentar</Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-headline font-bold">Directorio de Personal</h1>
        <Button disabled> {/* TODO: Implement Add Personnel functionality */}
          <PlusCircle className="mr-2 h-5 w-5" /> Agregar Nuevo Personal
        </Button>
      </div>

      {personnel.length === 0 && !loading && (
        <Card className="shadow-lg">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">No hay personal registrado en el sistema.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Intenta agregar nuevo personal o verifica si el script de seeding se ejecutó correctamente.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {personnel.map((person) => (
          <Card key={person.id_usuario} className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
            <CardHeader className="items-center text-center">
              <Avatar className="h-24 w-24 mb-3">
                <AvatarImage 
                  src={`https://placehold.co/100x100.png?text=${person.avatar_seed || getInitials(person.nombre_completo)}`} 
                  alt={person.nombre_completo}
                  data-ai-hint={person.rol === 'admin' ? "administrador avatar" : "usuario avatar"}
                />
                <AvatarFallback>{person.avatar_seed || getInitials(person.nombre_completo)}</AvatarFallback>
              </Avatar>
              <CardTitle className="font-headline text-xl">{person.nombre_completo}</CardTitle>
              <CardDescription className="capitalize">{person.rol}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-2 text-sm">
              <div className="flex items-center">
                <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                {person.email}
              </div>
              {person.telefono && (
                <div className="flex items-center">
                  <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                  {person.telefono}
                </div>
              )}
              <div className="flex items-start pt-1">
                <ShieldCheck className="mr-2 h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium">EPP: </span>N/A (Próximamente)
                </div>
              </div>
              <div className="flex items-center">
                <ClipboardList className="mr-2 h-4 w-4 text-muted-foreground" />
                Tareas Activas: N/A (Próximamente)
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2 border-t pt-4">
              {/* TODO: Implement Edit and Delete functionality */}
              <Button variant="outline" size="sm" disabled><Edit className="mr-1 h-4 w-4" /> Editar</Button>
              <Button variant="destructive" size="sm" disabled><Trash2 className="mr-1 h-4 w-4" /> Eliminar</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
