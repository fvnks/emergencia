
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { KeyRound, Database, ShieldAlert, Fingerprint, Users, Warehouse, Palette } from "lucide-react"; 
import Link from "next/link";
import { useState } from "react";
import { performSystemBackup } from "@/ai/flows/backup-system-flow";

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isBackupLoading, setIsBackupLoading] = useState(false);

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
    console.log("Simulando cambio de contraseña...");
    toast({ title: "Éxito", description: "Contraseña cambiada con éxito (simulado)." });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleBackupSystemData = async () => {
    setIsBackupLoading(true);
    toast({
      title: "Iniciando Respaldo",
      description: "El proceso de respaldo de datos del sistema ha comenzado...",
    });

    try {
      const result = await performSystemBackup({});
      if (result.status === 'success') {
        toast({
          title: "Respaldo Completado",
          description: result.message,
        });
      } else {
        toast({
          title: "Error en el Respaldo",
          description: result.message || "Ocurrió un error durante el respaldo.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error calling backup flow:", error);
      toast({
        title: "Error Crítico en Respaldo",
        description: error instanceof Error ? error.message : "No se pudo conectar con el servicio de respaldo.",
        variant: "destructive",
      });
    } finally {
      setIsBackupLoading(false);
    }
  };

  const adminSettingsCards = [
    { 
      href: "/settings/users", 
      icon: Users, 
      title: "Gestionar Usuarios", 
      description: "Administrar cuentas de usuario y sus roles (ahora en Personal)." 
    },
    { 
      href: "/settings/roles-permissions", 
      icon: Fingerprint, 
      title: "Roles y Permisos", 
      description: "Definir roles y asignar permisos específicos a módulos." 
    },
    { 
      href: "/settings/warehouses", 
      icon: Warehouse, 
      title: "Gestionar Bodegas", 
      description: "Administrar bodegas y centros de almacenamiento." 
    },
    {
      href: "/settings/appearance",
      icon: Palette,
      title: "Apariencia del Panel",
      description: "Personalizar logo, colores y tema del sistema."
    },
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
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
        <>
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center"><ShieldAlert className="mr-2 h-5 w-5 text-destructive" /> Herramientas Administrativas</CardTitle>
              <CardDescription>Opciones críticas del sistema. Usar con precaución.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                onClick={handleBackupSystemData}
                disabled={isBackupLoading}
                className="w-full sm:w-auto"
              >
                  <Database className="mr-2 h-4 w-4" /> 
                  {isBackupLoading ? "Respaldando..." : "Respaldo de Datos del Sistema"}
              </Button>
               <p className="text-xs text-muted-foreground mt-3">Opciones adicionales como registros del sistema, configuración de módulos e importación/exportación de datos podrían aparecer aquí.</p>
            </CardContent>
          </Card>

          <div className="mt-8">
            <h2 className="text-2xl font-headline font-semibold mb-4">Configuraciones Avanzadas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {adminSettingsCards.map((setting) => (
                <Link href={setting.href} key={setting.title} passHref>
                  <Card className="h-full hover:shadow-lg transition-shadow duration-200 cursor-pointer">
                    <CardHeader className="flex flex-row items-center gap-3">
                      <setting.icon className="h-8 w-8 text-primary" />
                      <div>
                        <CardTitle className="text-lg">{setting.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{setting.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
