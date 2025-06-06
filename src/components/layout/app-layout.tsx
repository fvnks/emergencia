
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
        variant="floating" 
        collapsible="icon"
        className="bg-transparent" // Outer sidebar container is transparent or matches page bg
      >
        <SidebarHeader className="p-4 h-16 flex items-center"> {/* Ensure consistent padding */}
          <Link href="/dashboard" className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
            <Logo className="h-8 w-auto group-data-[collapsible=icon]:h-7" />
          </Link>
        </SidebarHeader>
        <SidebarContent className="p-2 flex-grow"> {/* p-2 for padding around menu items */}
          <SidebarNav />
        </SidebarContent>
        <SidebarFooter className="p-2"> {/* Removed border-t */}
           <SidebarMenuButton
              onClick={logout}
              className="justify-start w-full" 
              tooltip={{children: "Cerrar Sesión", className: "bg-popover text-popover-foreground border-border"}}
            >
              <LogOut />
              <span className="group-data-[collapsible=icon]:hidden">Cerrar Sesión</span>
            </SidebarMenuButton>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
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
