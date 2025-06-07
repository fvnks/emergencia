
"use client";

import Link from "next/link";
import Image from "next/image"; // Import next/image
import { usePathname } from "next/navigation";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
  Home,
  Truck,
  ShieldCheck,
  Wrench,
  Archive,
  ClipboardList,
  Users,
  SettingsIcon,
  LucideIcon,
  Map,
  Fingerprint,
  BarChart3,
  ClipboardCheck as ChecklistIcon,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon | React.FC<any>; // Allow React functional components for icons
  animationClass?: string;
  adminOnly?: boolean;
}

// Placeholder Base64 para el icono del monitor (reemplazar con el real si se proporciona)
const MonitorIconPlaceholder = () => (
  <Image
    src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAsQAAALEBxi1JjAAAAAd0SU1FB+YMFBMyMRgA804AAAAZdEVYdENvbW1lbnQAQ3JlYXRlZCB3aXRoIEdJTVBXgQ4XAAACXUlEQVRYw+2Xv0sbcRTHP7/NZrJFNJUEYUAQh4BEBTsoBURxcBFUPARxFKxEQRGnZNXQSiToZCChKIdaOToEoSgiiEMQBEFRClRaFBsV3//z/o8jef9q94U7YOLO3fP7ved87979Q861/P8YQJaJt0/nNg7QJk0A8sK03zU/gH7MvNOYfJ4XvQ0fXg0N+58s8A00wTzzBTP519m2iW7P08+H1W8JjN5tX9PZGZ3RkK0hYqX/sH91m0M1pYjK8XW1c41m3iV/wV905WwH7R5LpGq4mC1gE/R0c5XjQbhbE76/2uJcYFVBR0BvV9fE+g1QZfN63zLdFm3FzE+l0HkEwG9H0+jA37zwywDTbVLeGf9Wz4XNFPwUe3L0hZJ6jXUq0lWkvJtK1Uq2lVKtJWStVq7KkVSWtSlKdpZ89y4xU0H32LBrT/e4t1024d2mG/zK2O7M6I6G9A1E379zV+v2+K0xNT9x59k8A00wTzzBTP51+2u7P08+H1x+K0xKjA8k9x2Z5yYnO+nZf44KkBquf6C/i5x9i3W/eZm5iYnPJ/v8Z7T9bW5gZ1eO9b+7NlDqBqgKq8j0FfK92G942sF2r3gWwG9H0+X8T5w00wzzTBzP1M2dZsfzz6vK+RUZGZ3THK/k+1VOpVpKxKUnalVSvaVUq2lVKtJWStVq7KlVSVtStKkp1lf4s9k8Qo6M6XvQ0/gH7MvNMYgP8H0A/pX5vml/AP2beaQpA4rUAAAAASUVORK5CYII="
    alt="Panel Principal"
    width={22} // Ajustar según el tamaño deseado (ej. 1.125rem * 16px/rem)
    height={22}
    className="transition-transform duration-200 ease-in-out group-hover:scale-110"
  />
);

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Panel Principal", icon: MonitorIconPlaceholder, animationClass: "group-hover:scale-110" }, // Icono reemplazado
  { href: "/tracking", label: "Seguimiento GPS (Beta)", icon: Map, animationClass: "group-hover:scale-110 group-hover:rotate-3" },
  { href: "/vehicles", label: "Vehículos", icon: Truck, animationClass: "group-hover:translate-x-0.5" },
  { href: "/equipment", label: "Equipos (ERA)", icon: ShieldCheck, animationClass: "group-hover:scale-110" },
  { href: "/maintenance", label: "Mantención", icon: Wrench, animationClass: "group-hover:rotate-[-15deg]" },
  { href: "/inventory", label: "Inventario", icon: Archive, animationClass: "group-hover:rotate-2 group-hover:translate-y-[-1px]" },
  { href: "/tasks", label: "Tareas", icon: ClipboardList, animationClass: "group-hover:translate-y-[-1.5px]" },
  { href: "/reports", label: "Informes", icon: BarChart3, animationClass: "group-hover:scale-105" },
  { href: "/checklists", label: "Checklists", icon: ChecklistIcon, animationClass: "group-hover:translate-y-[-1.5px]" },
  { href: "/personnel", label: "Personal", icon: Users, animationClass: "group-hover:scale-105" },
  { href: "/settings/roles-permissions", label: "Roles y Permisos", icon: Fingerprint, adminOnly: true, animationClass: "group-hover:scale-110 group-hover:opacity-80" },
  { href: "/settings", label: "Configuración", icon: SettingsIcon, animationClass: "group-hover:rotate-45" },
];

export function SidebarNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  const filteredNavItems = navItems.filter(item => {
    if (item.adminOnly && user?.role !== 'admin') {
      return false;
    }
    return true;
  });

  return (
    <>
      <div className="px-4 pt-2 pb-1 text-[15px] font-semibold text-[hsl(var(--muted-foreground))] group-data-[collapsible=icon]:hidden">
        MENU
      </div>
      <SidebarMenu>
        {filteredNavItems.map((item) => {
          const IconComponent = item.icon;
          // La clase de animación se aplica directamente en el componente Image si es un APNG,
          // o se mantiene en el elemento IconComponent si es Lucide.
          // Para el icono de Dashboard (MonitorIconPlaceholder), la animación ya está en su definición.
          // Para los demás, animationClass se aplica al IconComponent.
          const iconClasses = cn(
            'transition-transform duration-200 ease-in-out',
            item.href === "/dashboard" ? "" : item.animationClass // No aplicar animationClass externa al de APNG
          );

          return (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} passHref legacyBehavior>
                <SidebarMenuButton
                  isActive={pathname.startsWith(item.href)}
                  className="justify-start w-full"
                  tooltip={{children: item.label, className: "bg-popover text-popover-foreground border-border"}}
                >
                  <IconComponent className={iconClasses} />
                  <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </>
  );
}
