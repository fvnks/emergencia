
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/auth-context";
import { useAppData, type AlertNotificationItem } from "@/contexts/app-data-context";
import { LogOut, Settings, Bell } from "lucide-react"; // Removed AlertTriangle as it's not used here
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const getPageTitle = (pathname: string) => {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return "Panel Principal"; 

  const mainSegment = segments[segments.length -1];
  switch (mainSegment) {
    case 'dashboard': return "Panel Principal";
    case 'vehicles': return "Vehículos";
    case 'equipment': return "Equipos (ERA)";
    case 'maintenance': return "Mantención";
    case 'inventory': return "Inventario";
    case 'tasks': return "Tareas";
    case 'personnel': return "Personal";
    case 'settings': return "Configuración";
    case 'tracking': return "Seguimiento GPS (Beta)";
    default:
      if (segments.includes('settings')) {
        const settingSubPage = segments[segments.length -1].replace(/-/g, ' ');
        return `Configuración - ${settingSubPage.charAt(0).toUpperCase() + settingSubPage.slice(1)}`;
      }
      return mainSegment.charAt(0).toUpperCase() + mainSegment.slice(1).replace(/-/g, ' ');
  }
};


export function Header() {
  const { user, logout } = useAuth();
  const { alertNotifications, seenNotificationIds, markNotificationAsSeen, activeAlertsCount } = useAppData(); // Get activeAlertsCount for the "Ver todas" link logic
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
  
  const avatarPlaceholder = user?.avatarSeed ? user.avatarSeed.toUpperCase() : getInitials(user?.name);
  const avatarHint = user?.role === 'admin' ? "administrador avatar" : "usuario avatar";

  const unreadNotifications = alertNotifications.filter(alert => !seenNotificationIds.includes(alert.id));
  const unreadCount = unreadNotifications.length;

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>
      <h1 className="text-xl font-headline font-semibold">{pageTitle}</h1>
      <div className="ml-auto flex items-center gap-2 sm:gap-4">
        {user && (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative rounded-full">
                  <Bell className={cn("h-5 w-5", unreadCount > 0 && "text-primary animate-ring-bell")} />
                  {unreadCount > 0 && (
                    <Badge
                      variant="destructive"
                      className={cn(
                        "absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs rounded-full",
                        unreadCount > 0 && "animate-pulse" 
                      )}
                    >
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </Badge>
                  )}
                  <span className="sr-only">Notificaciones</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 sm:w-96">
                <DropdownMenuLabel className="flex justify-between items-center">
                  <span>Notificaciones ({unreadCount})</span>
                  {alertNotifications.length > 0 && ( // Show "Ver todas" if there are any alerts at all, even if all are read in dropdown
                     <Link href="/dashboard#recent-activity" className="text-xs text-primary hover:underline">
                        Ver todas las alertas activas ({alertNotifications.length})
                     </Link>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {unreadNotifications.length > 0 ? (
                  <ScrollArea className="h-[200px] sm:h-[250px]">
                    <DropdownMenuGroup>
                    {unreadNotifications.slice(0, 5).map((alert: AlertNotificationItem) => (
                      <DropdownMenuItem key={alert.id} asChild className="cursor-pointer"
                        // onClick alone won't work well with `asChild` and Link navigation.
                        // We need to handle the click on the Link itself or wrap it.
                        // For simplicity, let's make the entire DropdownMenuItem clickable
                        // and have it call markAsSeen then navigate.
                        // This requires the Link to not preventDefault if the action is done here.
                        // A cleaner way might be a small button inside or more complex event handling.
                        // For now, direct click on DropdownMenuItem with Link as child.
                        onSelect={(e) => { // onSelect is better for DropdownMenuItem
                          markNotificationAsSeen(alert.id);
                          // Navigation will be handled by the Link component
                        }}
                      >
                        <Link href={alert.link || "/dashboard"} className="flex items-start gap-2.5 p-2.5 w-full h-full">
                          <alert.icon className={cn("h-4 w-4 mt-0.5 flex-shrink-0", alert.iconClassName)} />
                          <div className="flex-grow">
                            <p className="text-sm leading-snug whitespace-normal">{alert.description}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(alert.date, { addSuffix: true, locale: es })}
                            </p>
                          </div>
                        </Link>
                      </DropdownMenuItem>
                    ))}
                    </DropdownMenuGroup>
                  </ScrollArea>
                ) : (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    {alertNotifications.length > 0 ? "Has visto todas las notificaciones de esta sesión." : "No hay notificaciones nuevas."}
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

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
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground capitalize pt-1">
                       Rol: {user.role}
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
          </>
        )}
      </div>
    </header>
  );
}
