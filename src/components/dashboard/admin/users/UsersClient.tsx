"use client";

import * as React from "react";
import { useState, useTransition, useEffect } from "react";

import type { SerializedUser } from "@/types/user/common";
import { getUserColumns } from "./users-columns";
import { fetchAllUsersClient } from "@/actions/client/users";
import { UsersDataTable } from "./UsersDataTable";

interface UsersClientProps {
  users: SerializedUser[];
}

export function UsersClient({ users: initialUsers }: UsersClientProps) {
  const [users, setUsers] = useState<SerializedUser[]>(initialUsers);
  const [isPending, startTransition] = useTransition();

  // const handleRefresh = () => {
  //   startTransition(async () => {
  //     const freshUsers = await fetchAllUsersClient();
  //     setUsers(freshUsers);
  //   });
  // };
  const handleRefresh = () => {
    startTransition(async () => {
      const freshUsers = await fetchAllUsersClient();
      setUsers(freshUsers);
      //setGlobalFilter("");
      //setSorting([]);
    });
  };

  return (
    <UsersDataTable
      data={users}
      columns={getUserColumns({
        onView: id => {
          window.location.href = `/admin/users/${id}`;
        }
      })}
      onRefresh={handleRefresh}
    />
  );
}
