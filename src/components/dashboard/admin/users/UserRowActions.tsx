"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import type { SerializedUser } from "@/types/user";
import { AdminUserEditDialog } from "./AdminUserEditDialog";
import { AdminUserDeleteDialog } from "@/components/dashboard/admin/users/AdminUserDeleteDialog";

interface UserRowActionsProps {
  user: SerializedUser;
  onSuccess?: () => void;
}

export function UserRowActions({ user, onSuccess }: UserRowActionsProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            {/* <MoreHorizontal className="h-4 w-4" /> */}
            <Eye className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>

          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => setDeleteOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => router.push(`/admin/users/${user.id}`)}>
            <Eye className="mr-2 h-4 w-4" />
            View
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AdminUserEditDialog user={user} open={editOpen} onOpenChange={setEditOpen} onSuccess={onSuccess} />
      <AdminUserDeleteDialog user={user} open={deleteOpen} onOpenChange={setDeleteOpen} onSuccess={onSuccess} />
    </>
  );
}
