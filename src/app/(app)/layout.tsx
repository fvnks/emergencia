
"use client";

import type { ReactNode } from "react";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { AppLayout } from '@/components/layout/app-layout';
import { Loader2 } from "lucide-react";
import { AppDataProvider } from "@/contexts/app-data-context";

export default function AuthenticatedAppLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    // Solo muestra el loader si el usuario aún no está definido y la carga no ha terminado.
    // Si no hay usuario después de cargar, redirige, así que el loader no debería persistir mucho.
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-cool-loader-spin text-primary" />
        <p className="ml-4 text-lg font-semibold">Cargando Gestor de Brigada...</p>
      </div>
    );
  }
  
  // Si el usuario está definido (y por ende loading es false), renderiza el layout.
  return (
    <AppDataProvider>
      <AppLayout>{children}</AppLayout>
    </AppDataProvider>
  );
}
