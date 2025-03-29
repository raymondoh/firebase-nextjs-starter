"use client";

import { useState } from "react";
import { AdminUsersDataTable } from "./manage-users/AdminUsersDataTable";
import { columns } from "./columns";
import { fetchUsers } from "@/actions/user/admin";
import type { User, SerializedUser } from "@/types/user/common";
import { serializeUser } from "@/utils/serializeUser";

interface UsersClientProps {
  initialUsers: User[];
  totalUsers: number;
}

export function UsersClient({ initialUsers, totalUsers }: UsersClientProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);

  const refreshUsers = async () => {
    setLoading(true);
    try {
      const result = await fetchUsers(limit, page * limit);
      if (result.success) {
        setUsers(result.users ?? []);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle pagination
  const handlePageChange = async (newPage: number) => {
    setPage(newPage);
    setLoading(true);
    try {
      const result = await fetchUsers(limit, newPage * limit);
      if (result.success) {
        setUsers(result.users ?? []);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle limit change
  const handleLimitChange = async (newLimit: number) => {
    setLimit(newLimit);
    setPage(0); // Reset to first page when changing limit
    setLoading(true);
    try {
      const result = await fetchUsers(newLimit, 0);
      if (result.success) {
        setUsers(result.users ?? []);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  // 🔄 Convert users to SerializedUser before passing to table
  const serializedUsers: SerializedUser[] = users.map(user => serializeUser(user));

  return (
    <AdminUsersDataTable<SerializedUser, unknown>
      columns={columns}
      initialData={serializedUsers}
      totalUsers={totalUsers}
      isLoading={loading}
      refreshUsers={refreshUsers}
      pagination={{
        page,
        limit,
        total: totalUsers,
        onPageChange: handlePageChange,
        onLimitChange: handleLimitChange
      }}
    />
  );
}
