
"use client";

import type { ReactNode } from "react";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { AppLayout } from '@/components/layout/app-layout';
import { Loader2 } from "lucide-react";
import { AppDataProvider } from "@/contexts/app-data-context"; // Importar el proveedor

export default function AuthenticatedAppLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg font-semibold">Cargando Gestor de Brigada...</p>
      </div>
    );
  }

  return (
    <AppDataProvider> {/* Envolver AppLayout con el proveedor */}
      <AppLayout>{children}</AppLayout>
    </AppDataProvider>
  );
}
