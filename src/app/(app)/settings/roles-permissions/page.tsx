
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { ArrowLeft, Fingerprint, PlusCircle, ShieldCheck, UserCircle2 } from "lucide-react";

interface Permission {
  id: string;
  label: string;
  granted: boolean;
}

interface Role {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  permissions: Permission[];
}

const rolesData: Role[] = [
  {
    id: "admin",
    name: "Administrador",
    description: "Acceso completo a todas las funcionalidades del sistema.",
    icon: ShieldCheck,
    permissions: [
      { id: "view_dashboard", label: "Ver Panel Principal", granted: true },
      { id: "manage_vehicles", label: "Gestionar Vehículos (Crear, Editar, Eliminar)", granted: true },
      { id: "manage_equipment", label: "Gestionar Equipos ERA (Crear, Editar, Eliminar, Asignar)", granted: true },
      { id: "manage_maintenance", label: "Gestionar Mantenciones (Crear, Editar, Eliminar)", granted: true },
      { id: "manage_inventory", label: "Gestionar Inventario (Crear, Editar, Eliminar, Asignar EPP)", granted: true },
      { id: "manage_tasks", label: "Gestionar Tareas (Crear, Editar, Eliminar, Asignar)", granted: true },
      { id: "manage_personnel", label: "Gestionar Personal (Crear, Editar, Eliminar)", granted: true },
      { id: "manage_settings", label: "Acceder y Modificar Configuración del Sistema", granted: true },
      { id: "manage_roles", label: "Gestionar Roles y Permisos", granted: true },
      { id: "manage_warehouses", label: "Gestionar Bodegas", granted: true },
    ],
  },
  {
    id: "usuario",
    name: "Usuario Estándar",
    description: "Acceso a funcionalidades operativas básicas.",
    icon: UserCircle2,
    permissions: [
      { id: "view_dashboard", label: "Ver Panel Principal", granted: true },
      { id: "view_vehicles", label: "Ver Vehículos y sus detalles", granted: true },
      { id: "edit_own_vehicles", label: "Editar información básica de vehículos (Ej: notas)", granted: false },
      { id: "view_equipment", label: "Ver Equipos ERA y sus detalles", granted: true },
      { id: "request_equipment", label: "Solicitar asignación de ERA", granted: true },
      { id: "view_maintenance", label: "Ver Mantenciones programadas", granted: true },
      { id: "complete_maintenance_assigned", label: "Completar mantenciones asignadas", granted: true },
      { id: "view_inventory", label: "Ver Inventario y stock", granted: true },
      { id: "request_inventory", label: "Solicitar ítems de inventario", granted: true },
      { id: "view_tasks", label: "Ver Tareas asignadas", granted: true },
      { id: "complete_tasks_assigned", label: "Completar tareas asignadas", granted: true },
      { id: "view_personnel_directory", label: "Ver Directorio de Personal", granted: true },
      { id: "view_own_settings", label: "Ver y modificar su propia configuración de cuenta", granted: true },
    ],
  },
];

export default function RolesPermissionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Button variant="outline" asChild className="mb-2 sm:mb-0 sm:mr-4">
            <Link href="/settings"><ArrowLeft className="mr-2 h-4 w-4" /> Volver a Configuración</Link>
          </Button>
          <h1 className="text-3xl font-headline font-bold inline-block align-middle">
            <Fingerprint className="mr-3 h-7 w-7 inline-block align-middle text-primary" />
            Gestión de Roles y Permisos
          </h1>
        </div>
        <Button disabled>
          <PlusCircle className="mr-2 h-5 w-5" /> Agregar Nuevo Rol
        </Button> 
      </div>
      <p className="text-muted-foreground">
        Aquí se podrían definir roles personalizados y asignar permisos específicos a cada módulo.
        Actualmente, el sistema opera con los roles predefinidos mostrados abajo. La creación de nuevos roles y asignación granular de permisos es una funcionalidad avanzada en desarrollo.
      </p>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        {rolesData.map((role) => (
          <Card key={role.id} className="shadow-md">
            <CardHeader>
              <div className="flex items-center gap-3">
                <role.icon className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle className="text-xl font-headline">{role.name}</CardTitle>
                  <CardDescription>{role.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <h4 className="text-md font-semibold text-muted-foreground">Permisos Asignados (Conceptual):</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {role.permissions.map((perm) => (
                  <div key={perm.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`${role.id}-${perm.id}`}
                      checked={perm.granted}
                      disabled // Todos los checkboxes deshabilitados en esta maqueta
                      aria-label={`${perm.label} para ${role.name}`}
                    />
                    <Label htmlFor={`${role.id}-${perm.id}`} className="text-sm font-normal text-foreground peer-disabled:opacity-100">
                      {perm.label}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
       <Card className="mt-8 shadow-sm">
        <CardHeader>
            <CardTitle className="text-lg">Próximos Pasos para Funcionalidad Completa</CardTitle>
            <CardDescription>Para una gestión de roles y permisos totalmente funcional, se requeriría:</CardDescription>
        </CardHeader>
        <CardContent>
            <ul className="list-disc list-outside space-y-1.5 pl-5 text-sm text-muted-foreground">
                <li>Diseño y creación de tablas en la base de datos para roles, permisos y la relación entre ellos.</li>
                <li>Desarrollo de servicios de backend (API endpoints) para:
                    <ul className="list-circle list-outside pl-5">
                        <li>Crear, leer, actualizar y eliminar roles.</li>
                        <li>Listar todos los permisos disponibles en el sistema.</li>
                        <li>Asignar y revocar permisos a los roles.</li>
                        <li>Asignar roles a los usuarios.</li>
                    </ul>
                </li>
                <li>Lógica en el frontend para interactuar con estos servicios (habilitar el botón "Agregar Nuevo Rol", formularios de edición, etc.).</li>
                <li>Integración de la verificación de permisos en todo el sistema (tanto en frontend para mostrar/ocultar UI, como en backend para proteger acciones).</li>
            </ul>
        </CardContent>
       </Card>

    </div>
  );
}

