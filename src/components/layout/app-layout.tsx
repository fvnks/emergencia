
"use client";

import type { ReactNode } from "react";
import { useState, useEffect } from "react"; // Import useState and useEffect
import Image from "next/image"; // Import Image
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
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

const LOCALSTORAGE_LOGO_URL_KEY = "customLogoUrl";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, logout } = useAuth();
  const [customLogoUrl, setCustomLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    const storedUrl = localStorage.getItem(LOCALSTORAGE_LOGO_URL_KEY);
    if (storedUrl) {
      setCustomLogoUrl(storedUrl);
    } else {
      setCustomLogoUrl(null);
    }

    const handleLogoChange = () => {
      const updatedUrl = localStorage.getItem(LOCALSTORAGE_LOGO_URL_KEY);
      setCustomLogoUrl(updatedUrl || null);
    };

    window.addEventListener('customLogoChanged', handleLogoChange);
    window.addEventListener('storage', handleLogoChange); // Listen for changes from other tabs

    return () => {
      window.removeEventListener('customLogoChanged', handleLogoChange);
      window.removeEventListener('storage', handleLogoChange);
    };
  }, []);

  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar
        variant="floating" 
        collapsible="icon"
        className="bg-transparent"
      >
        <SidebarHeader className="p-4 h-16 flex items-center group-data-[collapsible=icon]:justify-center">
          <Link href="/dashboard" className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
            {customLogoUrl ? (
              <Image
                src={customLogoUrl}
                alt="Logo Personalizado"
                width={120} // Adjust as needed
                height={30} // Adjust as needed
                className="max-h-[30px] w-auto group-data-[collapsible=icon]:hidden"
                data-ai-hint="custom company logo"
                onError={(e) => { 
                  e.currentTarget.src = `https://placehold.co/120x30.png?text=Error`;
                  e.currentTarget.alt = "Error al cargar logo";
                }}
              />
            ) : (
              <Logo className="h-8 w-auto" showText={true} /> 
            )}
             {/* Icon-only version for collapsed sidebar */}
            {customLogoUrl ? (
                 <Image
                    src={customLogoUrl}
                    alt="Logo Icono"
                    width={30}
                    height={30}
                    className="hidden group-data-[collapsible=icon]:block max-h-[30px] w-auto"
                    data-ai-hint="custom company logo icon"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                 />
            ) : (
                 <Logo className="hidden group-data-[collapsible=icon]:block h-7 w-auto" showText={false} />
            )}
          </Link>
        </SidebarHeader>
        <SidebarContent className="p-2 flex-grow">
          <SidebarNav />
        </SidebarContent>
        <SidebarFooter className="p-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <SidebarMenuButton
                  onClick={logout}
                  className="justify-start w-full" 
                >
                  <LogOut />
                  <span className="group-data-[collapsible=icon]:hidden">Cerrar Sesión</span>
                </SidebarMenuButton>
              </TooltipTrigger>
              <TooltipContent side="right" align="center" className="bg-popover text-popover-foreground border-border">
                Cerrar Sesión
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <Header />
        <main className="flex-1 flex flex-col p-4 md:p-6 lg:p-8 overflow-auto bg-background">
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
