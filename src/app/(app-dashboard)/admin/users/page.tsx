import { Separator } from "@/components/ui/separator";
import { DashboardShell, DashboardHeader } from "@/components";
import { UsersDataTable } from "@/components/admin";
import { columns } from "@/components/admin/users/columns";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { adminDb } from "@/firebase/admin";
import { fetchUsers } from "@/actions/user/admin";

// Helper function to ensure all data is properly serialized
function serializeData(data: any) {
  // Convert Firestore timestamps to ISO strings
  const serialized = JSON.parse(
    JSON.stringify(data, (key, value) => {
      // Check if the value is a Firestore timestamp
      if (value && typeof value === "object" && value.seconds !== undefined && value.nanoseconds !== undefined) {
        // Convert to Date and then to ISO string
        return new Date(value.seconds * 1000 + value.nanoseconds / 1000000).toISOString();
      }
      // Check if it's already a Date object
      if (value instanceof Date) {
        return value.toISOString();
      }
      return value;
    })
  );

  return serialized;
}

export default async function AdminUsersPage() {
  // Get the session server-side
  const session = await auth();

  // Redirect if not authenticated
  if (!session?.user) {
    redirect("/login");
  }

  // Check if user has admin role
  const userId = session.user.id;
  let isAdmin = false;

  try {
    // Fetch the user document from Firestore to check admin status
    const userDoc = await adminDb.collection("users").doc(userId).get();

    if (userDoc.exists) {
      const userData = userDoc.data();
      isAdmin = userData?.role === "admin";
    }

    // Redirect if not an admin
    if (!isAdmin) {
      redirect("/user/dashboard");
    }
  } catch (error) {
    console.error("Error checking admin status:", error);
    redirect("/user/dashboard");
  }

  // Fetch initial users data
  const result = await fetchUsers(10, 0);
  const initialUsers = result.success ? result.users || [] : [];
  const totalUsers = result.success ? result.total || 0 : 0;

  // Serialize the data for client components
  const serializedUsers = serializeData(initialUsers);

  return (
    <DashboardShell>
      <DashboardHeader heading="User Management" text="View and manage all users in your application." />
      <Separator className="mb-8" />

      {/* Pass the serialized data directly to the data table */}
      <UsersDataTable columns={columns} initialData={serializedUsers} totalUsers={totalUsers} />
    </DashboardShell>
  );
}
