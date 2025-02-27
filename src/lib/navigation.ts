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
  ShoppingBag
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
    href: "/user/dashboard",
    icon: LayoutDashboard
  },
  {
    title: "Profile",
    href: "/user/profile",
    icon: UserCircle
  },
  {
    title: "Settings",
    href: "/user/settings",
    icon: Settings
  },
  {
    title: "Notifications",
    href: "/user/notifications",
    icon: Bell
  },
  {
    title: "Activity",
    href: "/user/activity",
    icon: Activity
  },
  {
    title: "Customers",
    href: "/user/customers",
    icon: Activity
  }
];

// Admin-specific navigation items
export const adminNavItems: NavItem[] = [
  {
    title: "Admin",
    href: "/admin",
    icon: LayoutDashboard
  },
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard
  },
  {
    title: "Manage Users",
    href: "/admin/users",
    icon: Users
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings
  },
  {
    title: "Security",
    href: "/admin/security",
    icon: Shield
  },
  {
    title: "Customers",
    href: "/admin/customers",
    icon: ShoppingBag
  },
  {
    title: "Profile",
    href: "/admin/profile",
    icon: Activity
  }
];
