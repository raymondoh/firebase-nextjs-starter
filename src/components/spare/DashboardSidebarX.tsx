"use client";

import { BarChart3, Home, LayoutDashboard, Settings, ShoppingCart, Users } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ModeToggle } from "@/components/header/ModeToggle";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger
} from "@/components/ui/sidebar";

export function DashboardSidebar() {
  const pathname = usePathname();

  const routes = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      href: "/",
      isActive: pathname === "/"
    },
    {
      title: "Customers",
      icon: Users,
      href: "/customers",
      isActive: pathname === "/customersccccc"
    },
    {
      title: "Products",
      icon: ShoppingCart,
      href: "/products",
      isActive: pathname === "/products"
    },
    {
      title: "Analytics",
      icon: BarChart3,
      href: "/analytics",
      isActive: pathname === "/analytics"
    },
    {
      title: "Settings",
      icon: Settings,
      href: "/settings",
      isActive: pathname === "/settings"
    }
  ];

  return (
    <Sidebar>
      <SidebarHeader className="flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 px-2">
          <Home className="h-6 w-6" />
          <span className="font-bold">Acme Inc</span>
        </Link>
        <SidebarTrigger />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {routes.map(route => (
            <SidebarMenuItem key={route.href}>
              <SidebarMenuButton asChild isActive={route.isActive}>
                <Link href={route.href}>
                  <route.icon className="h-4 w-4" />
                  <span>{route.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="flex items-center justify-between p-4">
        <div className="text-xs text-muted-foreground">
          <p>v1.0.0</p>
        </div>
        <ModeToggle />
      </SidebarFooter>
    </Sidebar>
  );
}
