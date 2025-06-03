
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth, AuthUser } from "@/contexts/auth-context"; // Import AuthUser
import { LogOut, UserCircle, Settings } from "lucide-react"; // UserCircle is not used, can be removed
import Link from "next/link";
import { usePathname } from "next/navigation";

// Helper to get page title from pathname
const getPageTitle = (pathname: string) => {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return "Panel Principal"; 

  const mainSegment = segments[segments.length -1]; // Get the last segment for title
  switch (mainSegment) {
    case 'dashboard': return "Panel Principal";
    case 'vehicles': return "Vehículos";
    case 'equipment': return "Equipos (ERA)";
    case 'maintenance': return "Mantención";
    case 'inventory': return "Inventario";
    case 'tasks': return "Tareas";
    case 'personnel': return "Personal";
    case 'settings': return "Configuración";
    default:
      return mainSegment.charAt(0).toUpperCase() + mainSegment.slice(1).replace(/-/g, ' ');
  }
};


export function Header() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);

  const getInitials = (name?: string) => {
    if (!name) return 'GB'; 
    const nameParts = name.split(' ');
    if (nameParts.length > 1) {
      return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }
  
  // Use avatarSeed from user object if available for placeholder, otherwise initials
  const avatarPlaceholder = user?.avatarSeed ? user.avatarSeed.toUpperCase() : getInitials(user?.name);
  const avatarHint = user?.role === 'admin' ? "administrador avatar" : "usuario avatar";


  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>
      <h1 className="text-xl font-headline font-semibold">{pageTitle}</h1>
      <div className="ml-auto flex items-center gap-4">
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage 
                    src={`https://placehold.co/100x100.png?text=${avatarPlaceholder}`} 
                    alt={user.name || "Usuario"} 
                    data-ai-hint={avatarHint} 
                  />
                  <AvatarFallback>{avatarPlaceholder}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64"> {/* Increased width slightly */}
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground capitalize pt-1">
                    Rol: {user.role === 'admin' ? 'Administrador' : 'Usuario'}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings" className="flex items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configuración de Cuenta</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive-foreground focus:bg-destructive flex items-center">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Cerrar Sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
