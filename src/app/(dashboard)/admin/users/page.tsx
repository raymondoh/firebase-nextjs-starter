// app/admin/users/page.tsx will be accessible only to authenticated users with the admin role.
import { getUsers } from "@/firebase/user";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { CustomersTable } from "@/components/user/CustomersTable";

export default async function AdminUsersPage() {
  const session = await auth();

  // Double-check for session and admin role
  if (!session || session.user.role !== "admin") {
    console.error("Unauthorized access attempt to admin users page");
    redirect("/unauthorized"); // or wherever you want to redirect unauthorized access
  }

  const { success, users, error } = await getUsers(20);

  if (!success || !users) {
    return <div>Error: {error || "Failed to fetch users"}</div>;
  }

  return (
    <div>
      <div className="container mx-auto px-4 py-8">
        <h1>Users</h1>
        <p>Welcome, {session.user.name} (Admin)</p>
        <ul>
          {users.map(user => (
            <li key={user.id}>
              {user.name} ({user.email}) - Role: {user.role}
            </li>
          ))}
        </ul>
      </div>
      <CustomersTable />
    </div>
  );
}
