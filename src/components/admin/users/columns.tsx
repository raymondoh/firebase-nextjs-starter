"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Shield, ShieldAlert, ShieldCheck, UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { User } from "@/types/user/common";
import Link from "next/link";

// Helper function to get initials from name or email
function getInitials(name: string | undefined | null, email: string | undefined | null): string {
  if (name) {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  }

  if (email) {
    return email.substring(0, 2).toUpperCase();
  }

  return "UN";
}

// Helper function to format dates in a readable way
function formatDate(date: Date | string | number | null | undefined): string {
  if (!date) return "N/A";

  try {
    // Convert to Date object if it's not already
    const dateObj = date instanceof Date ? date : new Date(date);

    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return "Invalid date";
    }

    const now = new Date();
    const diff = now.getTime() - dateObj.getTime();

    // Less than a minute
    if (diff < 60 * 1000) {
      return "Just now";
    }

    // Less than an hour
    if (diff < 60 * 60 * 1000) {
      const minutes = Math.floor(diff / (60 * 1000));
      return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
    }

    // Less than a day
    if (diff < 24 * 60 * 60 * 1000) {
      const hours = Math.floor(diff / (60 * 60 * 1000));
      return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
    }

    // Less than a week
    if (diff < 7 * 24 * 60 * 60 * 1000) {
      const days = Math.floor(diff / (24 * 60 * 60 * 1000));
      return `${days} day${days !== 1 ? "s" : ""} ago`;
    }

    // Format as date
    return dateObj.toLocaleDateString();
  } catch (error) {
    console.error("Date formatting error:", error);
    return "Invalid date";
  }
}

// Helper function to get role icon
function getRoleIcon(role: string | undefined) {
  switch (role) {
    case "admin":
      return <ShieldAlert className="h-4 w-4 text-destructive" />;
    case "moderator":
      return <ShieldCheck className="h-4 w-4 text-warning" />;
    case "support":
      return <Shield className="h-4 w-4 text-muted-foreground" />;
    default:
      return <UserIcon className="h-4 w-4 text-muted-foreground" />;
  }
}

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: "User",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex items-center gap-3">
          <Avatar>
            {user.image && <AvatarImage src={user.image} alt={user.name || user.email || ""} />}
            <AvatarFallback>{getInitials(user.name, user.email)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium">
              {user.name || user.username || (user.email ? user.email.split("@")[0] : "Unknown")}
            </span>
            <span className="text-xs text-muted-foreground">{user.email}</span>
          </div>
        </div>
      );
    }
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = (row.getValue("role") as string) || "user";
      return (
        <div className="flex items-center gap-2">
          {getRoleIcon(role)}
          <Badge variant={role === "admin" ? "destructive" : role === "moderator" ? "outline" : "secondary"}>
            {role || "user"}
          </Badge>
        </div>
      );
    }
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = (row.getValue("status") as string) || "active";
      return (
        <Badge variant={status === "active" ? "success" : status === "disabled" ? "destructive" : "outline"}>
          {status || "active"}
        </Badge>
      );
    }
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Registered
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = row.original.createdAt;
      return <span className="text-muted-foreground text-sm">{formatDate(date)}</span>;
    }
  },
  {
    accessorKey: "lastLoginAt",
    header: "Last Login",
    cell: ({ row }) => {
      const date = row.original.lastLoginAt;
      return <span className="text-muted-foreground text-sm">{formatDate(date)}</span>;
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="text-right">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/admin/users/${user.id}`}>View</Link>
          </Button>
        </div>
      );
    }
  }
];
