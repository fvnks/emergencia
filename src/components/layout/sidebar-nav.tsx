
"use client";

import Link from "next/link";
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
  icon: LucideIcon;
  adminOnly?: boolean;
  animationClass?: string;
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Panel Principal", icon: Home, animationClass: "group-hover:scale-110" },
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
        {filteredNavItems.map((item) => (
          <SidebarMenuItem key={item.href}>
            <Link href={item.href} passHref legacyBehavior>
              <SidebarMenuButton
                isActive={pathname.startsWith(item.href)}
                className="justify-start w-full"
                tooltip={{children: item.label, className: "bg-popover text-popover-foreground border-border"}}
              >
                <item.icon className={cn(
                  'transition-transform duration-200 ease-in-out',
                  item.animationClass
                )} />
                <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </>
  );
}
