// UsersClient.tsx (renamed from AdminUsersClient if needed)
"use client";

import { UsersDataTable } from "./UsersDataTable";
import { getUserColumns } from "./users-columns";
import type { SerializedUser } from "@/types/user";
import { UserDialog } from "./UserDialog";
import { useState } from "react";

interface AdminUsersClientProps {
  users: SerializedUser[];
  onRefresh?: () => void;
}

export function UsersClient({ users, onRefresh }: AdminUsersClientProps) {
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);

  return (
    <>
      <UsersDataTable
        data={users}
        columns={getUserColumns({
          onView: id => {
            window.location.href = `/admin/users/${id}`;
          }
        })}
        onRefresh={onRefresh}
      />
      <UserDialog
        open={isAddUserOpen}
        onOpenChange={setIsAddUserOpen}
        onSuccess={() => {
          onRefresh?.();
          setIsAddUserOpen(false);
        }}
      />
    </>
  );
}
