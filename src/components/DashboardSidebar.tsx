"use client";

import { Home } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ModeToggle } from "@/components";
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

import { useSession } from "next-auth/react";
import { userNavItems, adminNavItems, type NavItem } from "@/lib/navigation";

export function DashboardSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const navItems = session?.user?.role === "admin" ? adminNavItems : userNavItems;

  return (
    <Sidebar className="">
      <SidebarHeader className="flex items-center justify-between">
        <Link href={session?.user?.role === "admin" ? "/admin" : "/dashboard"} className="flex items-center gap-2 px-2">
          <Home className="h-6 w-6" />
          <span className="font-bold">{session?.user?.role === "admin" ? "Admin" : "Dashboard"}</span>
        </Link>
        <SidebarTrigger />
      </SidebarHeader>
      <SidebarContent className="mt-10 mx-10">
        <SidebarMenu className=" ">
          {navItems.map((item: NavItem) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton asChild isActive={pathname === item.href}>
                <Link href={item.href}>
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      {/* <SidebarFooter className="flex items-center justify-between p-4">
        <div className="text-xs text-muted-foreground">
          <p>v1.0.0</p>
        </div>
        <ModeToggle />
      </SidebarFooter> */}
    </Sidebar>
  );
}
