// lib/navigation.ts
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
  //BarChart,
  FileText,
  Database,
  //Key,
  AlertTriangle,
  ShoppingBag,
  CarIcon
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

// Add this to your NavItem type in navigation.ts
// export interface NavItem {
//   title: string;
//   href: string;
//   icon: LucideIcon;
//   hasDropdown?: boolean; // Add this property
// }

// Then add a product nav item to generalNavItems
// {
//   title: "Products",
//   href: "#", // This will be overridden by the dropdown
//   icon: ShoppingBag,
//   hasDropdown: true
// }

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
    title: "Debug",
    href: "/debug-session",
    icon: Settings
  },
  {
    title: "Carousel",
    href: "/carousel",
    icon: CarIcon
  },
  {
    title: "Products",
    href: "/products",
    icon: ShoppingBag
  }
  // {
  //   title: "Products",
  //   href: "#", // This will be overridden by the dropdown
  //   icon: ShoppingBag,
  //   hasDropdown: true
  // }
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
    title: "Manage Users",
    href: "/admin/users",
    icon: Users
  },
  {
    title: "Activity",
    href: "/admin/activity",
    icon: Activity
  },
  {
    title: "Admin Profile",
    href: "/admin/profile",
    icon: UserCircle
  },
  {
    title: "Products",
    href: "/admin/products",
    icon: ShoppingBag
  }
];
