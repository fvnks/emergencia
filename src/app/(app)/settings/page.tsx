
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { KeyRound, Users, Database, ShieldAlert, Warehouse } from "lucide-react"; // Added Warehouse
import Link from "next/link"; // Added Link
import { useState } from "react";

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({ title: "Error", description: "Las nuevas contraseñas no coinciden.", variant: "destructive" });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: "Error", description: "La contraseña debe tener al menos 6 caracteres.", variant: "destructive" });
      return;
    }
    // Simulate password change
    toast({ title: "Éxito", description: "Contraseña cambiada con éxito (simulado)." });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-headline font-bold">Configuración</h1>
        <p className="text-muted-foreground">Gestiona tu cuenta y la configuración del sistema.</p>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center"><KeyRound className="mr-2 h-5 w-5 text-primary" /> Cambiar Contraseña</CardTitle>
          <CardDescription>Actualiza la contraseña de tu cuenta para mayor seguridad.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="currentPassword">Contraseña Actual</Label>
              <Input id="currentPassword" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="newPassword">Nueva Contraseña</Label>
              <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
              <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            </div>
            <Button type="submit">Actualizar Contraseña</Button>
          </form>
        </CardContent>
      </Card>

      {user?.role === 'admin' && (
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center"><ShieldAlert className="mr-2 h-5 w-5 text-destructive" /> Configuración de Administrador</CardTitle>
            <CardDescription>Gestiona las configuraciones generales del sistema. Estas acciones son críticas y deben manejarse con cuidado.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row flex-wrap gap-4">
                <Button variant="outline" className="w-full sm:w-auto justify-start">
                    <Users className="mr-2 h-4 w-4" /> Gestionar Usuarios y Roles
                </Button>
                <Button variant="outline" className="w-full sm:w-auto justify-start" asChild>
                  <Link href="/settings/warehouses">
                    <Warehouse className="mr-2 h-4 w-4" /> Gestionar Bodegas
                  </Link>
                </Button>
                <Button variant="outline" className="w-full sm:w-auto justify-start">
                    <Database className="mr-2 h-4 w-4" /> Respaldo Datos del Sistema
                </Button>
            </div>
            <p className="text-xs text-muted-foreground">Opciones administrativas adicionales como registros del sistema, configuración de módulos e importación/exportación de datos aparecerían aquí.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
