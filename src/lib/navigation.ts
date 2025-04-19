// lib/navigation.ts
import type React from "react";
import {
  Home,
  Info,
  Mail,
  LayoutDashboard,
  Settings,
  UserCircle,
  Activity,
  Users,
  Shield,
  //BarChart,

  //Key,
  ShoppingBag
} from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  hasDropdown?: boolean; // Add this property
  // Add the subItems property
  subItems?: Array<{
    title: string;
    href: string;
    icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  }>;
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
  },
  {
    title: "Products",
    href: "/products",
    icon: ShoppingBag
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
    title: "Settings",
    href: "/user/settings",
    icon: Settings
  },
  {
    title: "Activity",
    href: "/user/activity",
    icon: Activity
  },

  {
    title: "Data & Privacy",
    href: "/user/data-privacy",
    icon: Shield
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
    title: "Activity",
    href: "/admin/activity",
    icon: Activity
  },
  {
    title: "Manage Users",
    href: "/admin/users",
    icon: Users
  },
  {
    title: "Products",
    href: "/admin/products",
    icon: ShoppingBag
  },
  {
    title: "Admin Profile",
    href: "/admin/profile",
    icon: UserCircle
  }
];
