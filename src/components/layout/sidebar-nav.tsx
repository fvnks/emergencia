
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react"; // Import useState and useEffect
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
  Fingerprint,
  BarChart3,
  ClipboardCheck as ChecklistIcon,
  Warehouse,
  Palette,
  ChevronDown, // Importar ChevronDown
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  animationClass?: string;
  adminOnly?: boolean;
  settingsSubItem?: boolean;
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Panel Principal", icon: Home, animationClass: "group-hover:scale-110" },
  { href: "/vehicles", label: "Vehículos", icon: Truck, animationClass: "group-hover:translate-x-0.5" },
  { href: "/equipment", label: "Equipos (ERA)", icon: ShieldCheck, animationClass: "group-hover:scale-110" },
  { href: "/maintenance", label: "Mantención", icon: Wrench, animationClass: "group-hover:rotate-[-15deg]" },
  { href: "/inventory", label: "Inventario", icon: Archive, animationClass: "group-hover:rotate-2 group-hover:translate-y-[-1px]" },
  { href: "/tasks", label: "Tareas", icon: ClipboardList, animationClass: "group-hover:translate-y-[-1.5px]" },
  { href: "/reports", label: "Informes", icon: BarChart3, animationClass: "group-hover:scale-105" },
  { href: "/checklists", label: "Checklists", icon: ChecklistIcon, animationClass: "group-hover:translate-y-[-1.5px]" },
  { href: "/personnel", label: "Personal", icon: Users, animationClass: "group-hover:scale-105" },
  { href: "/settings", label: "Configuración", icon: SettingsIcon, animationClass: "group-hover:rotate-45" },
  { href: "/settings/roles-permissions", label: "Roles y Permisos", icon: Fingerprint, adminOnly: true, settingsSubItem: true, animationClass: "group-hover:scale-110 group-hover:opacity-80" },
  { href: "/settings/warehouses", label: "Gestionar Bodegas", icon: Warehouse, adminOnly: true, settingsSubItem: true, animationClass: "group-hover:scale-105" },
  { href: "/settings/appearance", label: "Apariencia", icon: Palette, adminOnly: true, settingsSubItem: true, animationClass: "group-hover:scale-105" },
];

export function SidebarNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  const isSettingsPageActive = pathname.startsWith("/settings");
  const [settingsSubMenuOpen, setSettingsSubMenuOpen] = useState(isSettingsPageActive);

  useEffect(() => {
    // Sincronizar el estado del submenú con la ruta activa
    if (isSettingsPageActive) {
      setSettingsSubMenuOpen(true);
    } else {
      setSettingsSubMenuOpen(false); // Cerrar si no estamos en una página de settings
    }
  }, [isSettingsPageActive]);

  const filteredNavItems = navItems.filter(item => {
    if (item.adminOnly && user?.role !== 'admin') {
      return false;
    }
    return true;
  });

  const mainMenuItems = filteredNavItems.filter(item => !item.settingsSubItem);
  const settingsSubMenuItems = filteredNavItems.filter(item => item.settingsSubItem && item.href !== "/settings");

  const handleSettingsToggle = (e: React.MouseEvent) => {
    // El Link se encargará de la navegación. Este onClick solo alterna el estado.
    // Si ya estamos en una página de settings, permite cerrar/abrir.
    // Si no estamos, al hacer clic en "Configuración", el Link navega,
    // y el useEffect se encargará de abrir el submenú.
    setSettingsSubMenuOpen(prev => !prev);
  };

  return (
    <>
      <div className="px-4 pt-2 pb-1 text-[15px] font-semibold text-[hsl(var(--muted-foreground))] group-data-[collapsible=icon]:hidden">
        MENU
      </div>
      <SidebarMenu>
        {mainMenuItems.map((item) => {
          const IconComponent = item.icon;
          const iconClasses = cn(
            'transition-transform duration-200 ease-in-out',
            item.animationClass
          );
          const isActive = item.href === "/settings" ? isSettingsPageActive : pathname.startsWith(item.href);
          const isSettingsItem = item.href === "/settings";

          return (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} passHref legacyBehavior>
                <SidebarMenuButton
                  isActive={isActive}
                  className="justify-start w-full"
                  tooltip={{children: item.label, className: "bg-popover text-popover-foreground border-border"}}
                  onClick={isSettingsItem ? handleSettingsToggle : undefined}
                  aria-expanded={isSettingsItem ? settingsSubMenuOpen : undefined}
                >
                  <IconComponent className={iconClasses} />
                  <span className="group-data-[collapsible=icon]:hidden flex-1">{item.label}</span>
                  {isSettingsItem && settingsSubMenuItems.length > 0 && (
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 text-muted-foreground transition-transform duration-200 group-data-[collapsible=icon]:hidden",
                        settingsSubMenuOpen && "rotate-180"
                      )}
                    />
                  )}
                </SidebarMenuButton>
              </Link>
              
              {isSettingsItem && settingsSubMenuOpen && settingsSubMenuItems.length > 0 && (
                <ul className="pl-7 pt-1 space-y-1 group-data-[collapsible=icon]:hidden animate-accordion-down">
                  {settingsSubMenuItems.map(subItem => {
                    const SubIconComponent = subItem.icon;
                    return (
                      <li key={subItem.href}>
                        <Link href={subItem.href} passHref legacyBehavior>
                          <SidebarMenuButton
                             variant="ghost"
                             size="sm"
                             isActive={pathname.startsWith(subItem.href)}
                             className="justify-start w-full text-sm h-8"
                             tooltip={{children: subItem.label, className: "bg-popover text-popover-foreground border-border"}}
                          >
                            <SubIconComponent className={cn('h-3.5 w-3.5', subItem.animationClass)} />
                            <span>{subItem.label}</span>
                          </SidebarMenuButton>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </>
  );
}
