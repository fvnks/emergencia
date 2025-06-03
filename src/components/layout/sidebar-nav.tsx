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
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Panel Principal", icon: Home },
  { href: "/vehicles", label: "Vehículos", icon: Truck },
  { href: "/equipment", label: "Equipos (ERA)", icon: ShieldCheck },
  { href: "/maintenance", label: "Mantención", icon: Wrench },
  { href: "/inventory", label: "Inventario", icon: Archive },
  { href: "/tasks", label: "Tareas", icon: ClipboardList },
  { href: "/personnel", label: "Personal", icon: Users },
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
    <SidebarMenu>
      {filteredNavItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <Link href={item.href} passHref legacyBehavior>
            <SidebarMenuButton
              isActive={pathname.startsWith(item.href)}
              className="justify-start w-full text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground"
              tooltip={{children: item.label, className: "bg-popover text-popover-foreground border-border"}}
            >
              <item.icon className="h-5 w-5" />
              <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
