
"use client";

import type { ReactNode } from "react";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { SidebarNav } from "./sidebar-nav";
import { Header } from "./header";
import { Logo } from "../icons/logo";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "../ui/button";
import { LogOut } from "lucide-react";
import Link from "next/link";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, logout } = useAuth();

  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar
        variant="sidebar" 
        collapsible="icon"
        className="bg-[hsl(var(--sidebar-background))] border-r border-[hsl(var(--sidebar-border))]"
      >
        <SidebarHeader className="p-4 h-16 flex items-center">
          <Link href="/dashboard" className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
            <Logo className="h-8 w-auto group-data-[collapsible=icon]:h-7" />
          </Link>
        </SidebarHeader>
        <SidebarContent className="p-2 flex-grow">
          <SidebarNav />
        </SidebarContent>
        <SidebarFooter className="p-2 border-t border-[hsl(var(--sidebar-border))]">
           <SidebarMenuButton
              onClick={logout}
              className="justify-start w-full" // Let CVA handle styling
              tooltip={{children: "Cerrar Sesión", className: "bg-popover text-popover-foreground border-border"}}
            >
              <LogOut />
              <span className="group-data-[collapsible=icon]:hidden">Cerrar Sesión</span>
            </SidebarMenuButton>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="bg-background">
        <Header />
        <main className="flex-1 flex flex-col p-4 md:p-6 lg:p-8 overflow-auto">
          <div className="flex-grow">
            {children}
          </div>
          <footer className="mt-auto pt-6 pb-4 text-center text-xs text-muted-foreground border-t border-border">
            <p>&copy; {new Date().getFullYear()} Gestor de Brigada. Todos los derechos reservados.</p>
            <p className="mt-1">Aplicación funcional para demostración, no para uso en producción.</p>
          </footer>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
