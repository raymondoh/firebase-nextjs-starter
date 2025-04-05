// src/components/dashboard/AppSidebar.tsx
"use client";

import type React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarGroup,
  SidebarGroupContent,
  SidebarSeparator,
  useSidebar
} from "@/components/ui/sidebar";
import { userNavItems, adminNavItems, type NavItem } from "@/lib/navigation";

export function AppSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { isMobile, setOpenMobile } = useSidebar();
  const navItems: NavItem[] = session?.user?.role === "admin" ? adminNavItems : userNavItems;

  const handleLinkClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <Sidebar className="pt-6" collapsible="icon">
      <SidebarContent className="pt-5">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Back to Home button */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/" onClick={handleLinkClick}>
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back to Home</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Separator between back button and nav items */}
              <SidebarSeparator className="my-2" />

              {/* Navigation Items */}
              {navItems.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.href}>
                    <Link href={item.href} onClick={handleLinkClick}>
                      {item.icon && <item.icon className="h-4 w-4" />}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                  {item.subItems && (
                    <SidebarMenuSub>
                      {item.subItems.map(subItem => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild isActive={pathname === subItem.href}>
                            <Link href={subItem.href} onClick={handleLinkClick}>
                              {subItem.title}
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
