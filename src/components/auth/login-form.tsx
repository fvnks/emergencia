
"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/contexts/auth-context';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
// import { Logo } from '../icons/logo'; // Logo is used in the SVG directly

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading: authLoading, authError, setAuthError } = useAuth(); // Renamed loading to authLoading to avoid conflict

  const [isSubmitting, setIsSubmitting] = useState(false); // Local loading state for form submission

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null); // Clear previous errors
    setIsSubmitting(true);
    try {
      await login(email, password);
      // Navigation is handled by the login function in AuthContext on success
    } catch (error) {
      // Errors are set in AuthContext, no need to set them here explicitly unless for additional local error handling
      console.error("Login form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = authLoading || isSubmitting;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 50" width="160" height="40" aria-label="Logo Gestor de Brigada">
                <rect width="200" height="50" fill="transparent" />
                {/* Simple shield icon */}
                <path d="M25 5 Q 25 2.5 27.5 2.5 L 42.5 2.5 Q 45 2.5 45 5 L 45 22.5 L 35 27.5 L 25 22.5 Z M 22.5 20 L 35 30 L 47.5 20" fill="hsl(var(--primary))" stroke="hsl(var(--card-foreground))" strokeWidth="1.5" />
                <text x="55" y="32" fontFamily="'PT Sans', sans-serif" fontSize="24" fontWeight="bold" fill="hsl(var(--primary))">
                    Gestor de Brigada
                </text>
            </svg>
          </div>
          <CardTitle className="text-3xl font-headline">Bienvenido de Vuelta</CardTitle>
          <CardDescription>Ingresa tus credenciales para acceder al panel de tu brigada.</CardDescription>
        </CardHeader>
        <CardContent>
          {authError && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error de Inicio de Sesión</AlertTitle>
              <AlertDescription>{authError}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="usuario@ejemplo.cl"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-card" // Changed to card for better theme consistency
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-card" // Changed to card for better theme consistency
              />
            </div>
            {/* Role selection removed as it's determined by the database now
            <div className="space-y-2">
              <Label>Rol (para demostración)</Label>
              <RadioGroup defaultValue="user" value={role} onValueChange={(value: 'user' | 'admin') => setRole(value)} className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="user" id="role-user" />
                  <Label htmlFor="role-user">Usuario</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="admin" id="role-admin" />
                  <Label htmlFor="role-admin">Administrador</Label>
                </div>
              </RadioGroup>
            </div>
            */}
            <Button type="submit" className="w-full font-semibold" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Iniciar Sesión"}
            </Button>
          </form>
        </CardContent>
      </Card>
      <footer className="mt-8 text-center text-sm text-muted-foreground">
        <p>Para demostración, crea un usuario en tu base de datos o usa credenciales pre-configuradas si existen.</p>
        <p>Ejemplo: admin@example.com / password (si lo creaste con el servicio createUser)</p>
      </footer>
    </div>
  );
}
