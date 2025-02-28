"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { userNavItems, adminNavItems, type NavItem } from "@/lib/navigation";

export function DashboardSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const navItems: NavItem[] = session?.user?.role === "admin" ? adminNavItems : userNavItems;

  return (
    <div className="flex flex-col w-64 bg-gray-800">
      <nav className="flex-grow">
        <ul className="flex flex-col py-4">
          {navItems.map(item => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center px-6 py-2 text-gray-100 hover:bg-gray-700 ${
                  pathname === item.href ? "bg-gray-700" : ""
                }`}>
                <item.icon className="w-5 h-5 mr-3" />
                {item.title}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
