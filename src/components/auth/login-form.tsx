"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/contexts/auth-context';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Logo } from '../icons/logo';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (email === "admin@ejemplo.cl" && password === "password") {
      login(email, 'admin');
    } else if (email === "usuario@ejemplo.cl" && password === "password") {
      login(email, 'user');
    } else if (password === "password") { // Allow any email with 'password' for demo
      login(email, role);
    }
    else {
      setError('Correo o contraseña inválidos. Usa "password" como contraseña para cualquier correo para demostración.');
    }
    setIsLoading(false);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-32 h-8">
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 50" width="120" height="30" aria-label="Logo Gestor de Brigada" className="fill-primary">
                <rect width="200" height="50" fill="transparent" />
                <path d="M10 10 L10 40 L25 25 Z" />
                <text x="35" y="32" fontFamily="'PT Sans', sans-serif" fontSize="24" fontWeight="bold" >
                    Gestor de Brigada
                </text>
            </svg>
          </div>
          <CardTitle className="text-3xl font-headline">Bienvenido de Vuelta</CardTitle>
          <CardDescription>Ingresa tus credenciales para acceder al panel de tu brigada.</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error de Inicio de Sesión</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
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
                className="bg-white"
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
                className="bg-white"
              />
            </div>
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
            <Button type="submit" className="w-full font-semibold" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Iniciar Sesión"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
