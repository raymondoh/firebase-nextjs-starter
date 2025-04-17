// app/dashboard/admin/users/page.tsx

import type { Metadata } from "next";
import { Separator } from "@/components/ui/separator";
import { DashboardShell, DashboardHeader } from "@/components";
import { UsersClient } from "@/components/dashboard/admin/users/UsersClient";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { adminDb } from "@/firebase/admin/firebase-admin-init";
import { fetchUsers } from "@/actions/user/admin";
import { serializeUserArray } from "@/utils/serializeUser";

export const metadata: Metadata = {
  title: "Manage Users - Admin",
  description: "View and manage all users in your application."
};

export default async function AdminUsersPage() {
  const session = await auth();

  if (!session?.user) redirect("/login");

  const userId = session.user.id;
  const userDoc = await adminDb.collection("users").doc(userId).get();
  const isAdmin = userDoc.exists && userDoc.data()?.role === "admin";

  if (!isAdmin) redirect("/user/dashboard");

  const result = await fetchUsers(10, 0);
  const initialUsers = result.success ? result.users || [] : [];
  const serializedUsers = serializeUserArray(initialUsers);
  console.log("🚀 serializedUsers:", serializedUsers);
  console.log("🚀 initialUsers:", initialUsers);

  return (
    <DashboardShell>
      <DashboardHeader heading="User Management" text="View and manage users in your application." />
      <Separator className="mb-8" />

      <div className="w-full overflow-hidden">
        <UsersClient users={serializedUsers} />
      </div>
    </DashboardShell>
  );
}
