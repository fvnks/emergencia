
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
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Panel Principal", icon: Home },
  { href: "/tracking", label: "Seguimiento GPS (Beta)", icon: Map },
  { href: "/vehicles", label: "Vehículos", icon: Truck },
  { href: "/equipment", label: "Equipos (ERA)", icon: ShieldCheck },
  { href: "/maintenance", label: "Mantención", icon: Wrench },
  { href: "/inventory", label: "Inventario", icon: Archive },
  { href: "/tasks", label: "Tareas", icon: ClipboardList },
  { href: "/personnel", label: "Personal", icon: Users },
  { href: "/settings/roles-permissions", label: "Roles y Permisos", icon: Fingerprint, adminOnly: true },
  { href: "/settings", label: "Configuración", icon: SettingsIcon },
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
      <div className="px-4 pt-2 pb-1 text-xs font-semibold text-[hsl(var(--muted-foreground))] group-data-[collapsible=icon]:hidden">
        MENU
      </div>
      <SidebarMenu>
        {filteredNavItems.map((item) => (
          <SidebarMenuItem key={item.href}>
            <Link href={item.href} passHref legacyBehavior>
              <SidebarMenuButton
                isActive={pathname.startsWith(item.href)}
                className="justify-start w-full" // Removed explicit color classes, should come from CVA
                tooltip={{children: item.label, className: "bg-popover text-popover-foreground border-border"}}
              >
                <item.icon /> {/* Icon styling will be handled by SidebarMenuButton's CVA logic */}
                <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </>
  );
}
