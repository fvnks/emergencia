
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft, Fingerprint, Construction } from "lucide-react";

export default function RolesPermissionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Button variant="outline" asChild className="mb-2 sm:mb-0 sm:mr-4">
            <Link href="/settings"><ArrowLeft className="mr-2 h-4 w-4" /> Volver a Configuración</Link>
          </Button>
          <h1 className="text-3xl font-headline font-bold inline-block align-middle">
            <Fingerprint className="mr-3 h-7 w-7 inline-block align-middle" />
            Gestión de Roles y Permisos
          </h1>
        </div>
        {/* Futuro botón para "Agregar Nuevo Rol" 
        <Button disabled>
          <PlusCircle className="mr-2 h-5 w-5" /> Agregar Nuevo Rol
        </Button> 
        */}
      </div>
      <p className="text-muted-foreground">
        Esta sección está destinada a la creación y administración de roles personalizados y la asignación de permisos específicos a cada rol.
      </p>

      <Card className="shadow-md text-center">
        <CardHeader>
          <div className="mx-auto bg-amber-500/10 text-amber-600 p-3 rounded-full w-fit">
              <Construction className="h-10 w-10" />
          </div>
          <CardTitle className="mt-4">Funcionalidad en Desarrollo</CardTitle>
          <CardDescription>
            La capacidad de crear y gestionar roles y permisos personalizados detallados es una funcionalidad avanzada y se encuentra planificada para futuras versiones.
            <br />
            Actualmente, el sistema opera con los roles predefinidos de "Administrador" y "Usuario".
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Cuando esté implementada, aquí podrás:
          </p>
          <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 mb-4 text-left inline-block">
            <li>Crear nuevos roles (ej: "Jefe de Inventario", "Mecánico").</li>
            <li>Definir permisos específicos para cada módulo (ej: solo lectura, creación, edición, eliminación).</li>
            <li>Asignar estos roles a los usuarios en la sección de Personal.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
