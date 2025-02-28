import type React from "react";
import {
  Home,
  Info,
  Mail,
  LayoutDashboard,
  Settings,
  UserCircle,
  Bell,
  Activity,
  Users,
  Shield,
  FileText
} from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon: React.ComponentType;
};

// General navigation items visible to all users
export const generalNavItems: NavItem[] = [
  {
    title: "Home",
    href: "/",
    icon: Home
  },
  {
    title: "About",
    href: "/about",
    icon: Info
  },
  {
    title: "Contact",
    href: "/contact",
    icon: Mail
  }
];

// User-specific navigation items
export const userNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/user",
    icon: LayoutDashboard
  },
  {
    title: "Profile",
    href: "/user/profile",
    icon: UserCircle
  },
  {
    title: "Notifications",
    href: "/user/notifications",
    icon: Bell
  },
  {
    title: "Documents",
    href: "/user/documents",
    icon: FileText
  },
  {
    title: "Activity",
    href: "/user/activity",
    icon: Activity
  },
  {
    title: "Settings",
    href: "/user/settings",
    icon: Settings
  }
];

// Admin-specific navigation items
export const adminNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard
  },
  {
    title: "Manage Users",
    href: "/admin/users",
    icon: Users
  },
  {
    title: "Analytics",
    href: "/admin/analytics",
    icon: Activity
  },
  {
    title: "Security",
    href: "/admin/security",
    icon: Shield
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings
  }
];
