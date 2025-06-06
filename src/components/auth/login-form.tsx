
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
    } catch (error) {
      console.error("Login form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = authLoading || isSubmitting;

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="py-3 px-4 sm:px-6 shadow-sm bg-card border-border">
        <div className="container mx-auto flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <span className="font-semibold text-md text-foreground/80">Gestor de Brigada</span>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-card p-6 sm:p-8 rounded-xl shadow-xl border border-border">
          <div className="text-center mb-8">
            <Shield className="mx-auto h-12 w-12 text-primary mb-3" />
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Iniciar Sesión
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Accede a tu panel de gestión.
            </p>
          </div>


          {authError && (
            <Alert variant="destructive" className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle className="font-semibold">Error de Inicio de Sesión</AlertTitle>
              <AlertDescription>{authError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="Ingresa tu correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 text-base bg-background" 
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11 text-base bg-background"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <Label htmlFor="remember-me" className="flex items-center font-normal text-muted-foreground select-none cursor-pointer">
                <Checkbox
                  id="remember-me"
                  checked={rememberMe}
                  onCheckedChange={() => setRememberMe(!rememberMe)}
                  className="mr-2 h-4 w-4 rounded border-input data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:text-primary-foreground focus-visible:ring-primary"
                />
                Recuérdame
              </Label>
              <a href="#" className="text-primary hover:text-primary/80 hover:underline">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <Button type="submit" className="w-full font-semibold bg-primary hover:bg-primary/90 text-primary-foreground py-3 h-11 text-sm rounded-lg" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Iniciar Sesión"}
            </Button>
          </form>
        </div>
      </main>
      <footer className="py-6 text-center text-xs text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Gestor de Brigada. Todos los derechos reservados.</p>
        <p className="mt-1">Aplicación funcional para demostración, no para uso en producción.</p>
      </footer>
    </div>
  );
}
