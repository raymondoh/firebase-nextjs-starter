"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, User, Settings, Shield, Bell, Activity } from "lucide-react";

const navItems = [
  { href: "/user/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/user/profile", label: "Profile", icon: User },
  { href: "/user/settings", label: "Settings", icon: Settings },
  { href: "/user/security", label: "Security", icon: Shield },
  { href: "/user/notifications", label: "Notifications", icon: Bell },
  { href: "/user/activity", label: "Activity", icon: Activity }
];

export function UserSidebar() {
  const pathname = usePathname();

  return (
    <nav className="bg-background md:bg-muted p-4 md:p-6 flex md:flex-col overflow-x-auto md:overflow-x-visible">
      <ul className="flex md:flex-col space-x-4 md:space-x-0 md:space-y-2">
        {navItems.map(item => (
          <li key={item.href}>
            <Link
              href={item.href}
              className={`flex items-center p-2 rounded-lg text-sm font-medium transition-colors hover:bg-muted hover:text-accent-foreground
                ${pathname === item.href ? "bg-accent text-accent-foreground" : "text-muted-foreground"}
              `}>
              <item.icon className="mr-2 h-4 w-4" />
              <span className="hidden md:inline">{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
