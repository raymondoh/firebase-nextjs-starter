import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getUsers } from "@/firebase/user";
import { DashboardStats } from "@/components/admin/DashboardStats";
import { UserList } from "@/components/admin/UserList";

export default async function AdminDashboardPage() {
  const session = await auth();

  if (!session || session.user.role !== "admin") {
    console.error("Unauthorized access attempt to admin dashboard");
    redirect("/");
  }

  const { success, users, error, lastVisible } = await getUsers(20);

  if (!success || !users) {
    console.error("Failed to fetch users:", error);
    return <div>Error: Failed to load dashboard data</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <DashboardStats users={users} />
      <UserList users={users} />
    </div>
  );
}
