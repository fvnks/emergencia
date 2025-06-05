
"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from '@/contexts/auth-context';
import { AlertTriangle, Loader2, Shield } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading: authLoading, authError, setAuthError } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsSubmitting(true);
    try {
      await login(email, password);
      // Navigation is handled by the login function in AuthContext on success
    } catch (error) {
      console.error("Login form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = authLoading || isSubmitting;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900">
      <header className="py-3 px-4 sm:px-6 shadow-sm bg-white">
        <div className="container mx-auto flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <span className="font-semibold text-md text-slate-700">Administrador de Respuesta a Emergencias</span>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm space-y-8">
          <h1 className="text-3xl font-bold text-center text-slate-800">
            Bienvenido de nuevo
          </h1>

          {authError && (
            <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-700">
              <AlertTriangle className="h-4 w-4 !text-red-600" />
              <AlertTitle className="font-semibold">Error de Inicio de Sesión</AlertTitle>
              <AlertDescription>{authError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium text-slate-700">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="Ingresa tu correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-slate-100 border-slate-300 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-primary focus:border-transparent rounded-lg py-2.5 px-4 h-11 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium text-slate-700">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-slate-100 border-slate-300 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-primary focus:border-transparent rounded-lg py-2.5 px-4 h-11 text-sm"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="remember-me" className="font-normal text-sm text-slate-600 select-none cursor-pointer">Recuérdame</Label>
              <Checkbox
                id="remember-me"
                checked={rememberMe}
                onCheckedChange={() => setRememberMe(!rememberMe)}
                className="h-5 w-5 rounded border-slate-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:text-white focus-visible:ring-primary"
              />
            </div>

            <Button type="submit" className="w-full font-semibold bg-primary hover:bg-primary/90 text-primary-foreground py-3 h-11 rounded-lg text-sm" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Iniciar Sesión"}
            </Button>

            <div className="text-center">
              <a href="#" className="text-sm text-primary hover:text-primary/80 hover:underline">
                ¿Olvidaste tu contraseña?
              </a>
            </div>
          </form>
        </div>
      </main>
      <footer className="py-6 text-center text-xs text-slate-500">
        <p>Creado con ❤️ por Rodrigo Droguett Stahr</p>
      </footer>
    </div>
  );
}
