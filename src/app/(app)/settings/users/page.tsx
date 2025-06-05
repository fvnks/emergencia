
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft, Users } from "lucide-react";

export default function ManageUsersRedirectPage() {
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
         <Button variant="outline" asChild>
            <Link href="/settings"><ArrowLeft className="mr-2 h-4 w-4" /> Volver a Configuración</Link>
         </Button>
      </div>
      <Card className="shadow-md text-center">
        <CardHeader>
          <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full w-fit mb-4">
            <Users className="h-10 w-10" />
          </div>
          <CardTitle>Gestión de Usuarios Movida</CardTitle>
          <CardDescription>
            La gestión de usuarios (agregar, editar, eliminar) ahora se realiza directamente en la sección de "Personal".
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/personnel">
              Ir a Personal
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
