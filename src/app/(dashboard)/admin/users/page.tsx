// app/dashboard/admin/users/page.tsx

import type { Metadata } from "next";
import { Separator } from "@/components/ui/separator";
import { DashboardShell, DashboardHeader, columns } from "@/components";
import { AdminUsersDataTable } from "@/components/dashboard/admin";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { adminDb } from "@/firebase/admin";
import { fetchUsers } from "@/actions/user/admin";
import type { SerializedUser } from "@/types/user";
import { serializeUserArray } from "@/utils/serializeUser";

export const metadata: Metadata = {
  title: "Manage Users - Admin",
  description: "View and manage all users in your application."
};

export default async function AdminUsersPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const userId = session.user.id;
  let isAdmin = false;

  try {
    const userDoc = await adminDb.collection("users").doc(userId).get();

    if (userDoc.exists) {
      const userData = userDoc.data();
      isAdmin = userData?.role === "admin";
    }

    if (!isAdmin) {
      redirect("/user/dashboard");
    }
  } catch (error) {
    console.error("Error checking admin status:", error);
    redirect("/user/dashboard");
  }

  const result = await fetchUsers(10, 0);
  const initialUsers = result.success ? result.users || [] : [];
  const totalUsers = result.success ? result.total || 0 : 0;

  const serializedUsers = serializeUserArray(initialUsers);

  return (
    <DashboardShell>
      <DashboardHeader heading="Manage Users" text="View and manage all users in your application." />
      <Separator className="mb-8" />

      <AdminUsersDataTable<SerializedUser, unknown>
        columns={columns}
        initialData={serializedUsers}
        totalUsers={totalUsers}
      />
    </DashboardShell>
  );
}
