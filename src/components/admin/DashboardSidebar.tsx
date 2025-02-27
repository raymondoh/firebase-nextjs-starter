"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { userNavItems, adminNavItems, type NavItem } from "@/lib/navigation";

export function DashboardSidebar({ isAdmin = false }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const navItems = isAdmin ? adminNavItems : userNavItems;

  return (
    <aside className="w-64 bg-gray-800 p-4">
      <nav className="space-y-2">
        {navItems.map((item: NavItem) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center space-x-2 p-2 rounded-md ${
              pathname === item.href ? "bg-gray-700" : "hover:bg-gray-500"
            }`}>
            {item.icon && <item.icon className="h-5 w-5" />}
            <span>{item.title}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
