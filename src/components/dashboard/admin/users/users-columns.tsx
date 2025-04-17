// src/components/dashboard/admin/users/users-columns.tsx
"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Shield, ShieldAlert, ShieldCheck, UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/utils/date";
import type { SerializedUser } from "@/types/user/common";
import { UserRowActions } from "./UserRowActions";
import { UserAvatar } from "@/components/shared/UserAvatar";

type UserColumnActions = {
  onView?: (id: string) => void;
};

function getRoleIcon(role: string | undefined) {
  switch (role) {
    case "admin":
      return <ShieldAlert className="h-4 w-4 text-destructive" />;
    case "moderator":
      return <ShieldCheck className="h-4 w-4 text-yellow-500" />;
    case "support":
      return <Shield className="h-4 w-4 text-muted-foreground" />;
    default:
      return <UserIcon className="h-4 w-4 text-muted-foreground" />;
  }
}

export function getUserColumns({ onView }: UserColumnActions): ColumnDef<SerializedUser>[] {
  return [
    {
      accessorKey: "name",
      header: "User",
      cell: ({ row }) => {
        const user = row.original;
        // ✅ Log the entire user row so we can inspect what's being passed
        console.log("[User Table] Row user data:", user);
        console.log("Rendering avatar for:", user.email, "Image:", user.image);

        return (
          <div className="flex items-center gap-3">
            {/* <Avatar className="h-10 w-10">
              {user.image ? (
                <div className="relative aspect-square h-full w-full">
                  <Image
                    src={user.image || "/placeholder.svg"}
                    alt={user.name || user.email || "User"}
                    fill
                    className="object-cover rounded-full"
                  />
                </div>
              ) : (
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  {getInitials(user.name, user.email)}
                </AvatarFallback>
              )}
            </Avatar> */}
            {/* <UserAvatar src={user?.image} name={user?.name} email={user?.email} className="h-10 w-10" /> */}
            <div
              className="h-10 w-10 rounded-full transition 
             hover:ring-2 hover:ring-gray-700 
             ring-offset-0 ring-0">
              <UserAvatar src={user?.image} name={user?.name} email={user?.email} className="h-10 w-10" />
            </div>

            <div className="flex flex-col">
              <span className="font-medium truncate max-w-[160px]">
                {user.name || user.username || user.email?.split("@")[0] || "Unknown"}
              </span>
              <span className="text-xs text-muted-foreground truncate max-w-[160px]">{user.email}</span>
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
              {role}
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
          <Badge variant={status === "active" ? "default" : status === "disabled" ? "destructive" : "outline"}>
            {status}
          </Badge>
        );
      }
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Registered
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const date = row.original.createdAt;
        return <span className="text-muted-foreground text-sm">{date ? formatDate(date) : "Unknown"}</span>;
      }
    },
    {
      accessorKey: "lastLoginAt",
      header: "Last Login",
      cell: ({ row }) => {
        const date = row.original.lastLoginAt;
        return (
          <span className="text-muted-foreground text-sm">{date ? formatDate(date, { relative: true }) : "N/A"}</span>
        );
      }
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="text-right">
            <UserRowActions user={user} />
          </div>
        );
      }
    }
  ];
}
