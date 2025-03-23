import { Separator } from "@/components/ui/separator";
import { DashboardShell, DashboardHeader } from "@/components";
import { AdminActivityLogWrapper } from "@/components/admin/AdminActivityLogWrapper";
import { SystemOverviewClient } from "@/components/admin/users/SystemOverviewClient";
import { UserManagementPreview } from "@/components/admin/users/UserManagementPreview";
import { SystemAlertsClient } from "@/components/admin/users/SystemAlertsClient";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { adminDb } from "@/firebase/admin";

// Helper function to ensure all data is properly serialized
function serializeData(data: any) {
  return JSON.parse(JSON.stringify(data));
}

export default async function AdminDashboardPage() {
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

  // Fetch system stats for the admin dashboard
  const systemStats = {
    totalUsers: 0,
    activeUsers: 0,
    newUsersToday: 0,
    totalActivities: 0
  };

  try {
    // Get total users count
    const usersSnapshot = await adminDb.collection("users").count().get();
    systemStats.totalUsers = usersSnapshot.data().count;

    // Get active users (logged in within last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const activeUsersSnapshot = await adminDb
      .collection("users")
      .where("lastLoginAt", ">=", sevenDaysAgo)
      .count()
      .get();
    systemStats.activeUsers = activeUsersSnapshot.data().count;

    // Get new users today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const newUsersSnapshot = await adminDb.collection("users").where("createdAt", ">=", today).count().get();
    systemStats.newUsersToday = newUsersSnapshot.data().count;

    // Get total activities
    const activitiesSnapshot = await adminDb.collection("activities").count().get();
    systemStats.totalActivities = activitiesSnapshot.data().count;
  } catch (error) {
    console.error("Error fetching system stats:", error);
    // Continue with default values if fetch fails
  }

  // Ensure data is properly serialized for client components
  const serializedSystemStats = serializeData(systemStats);

  // Get the admin's name with fallbacks
  const adminName = session.user.name || (session.user.email ? session.user.email.split("@")[0] : "Admin");

  return (
    <DashboardShell>
      <DashboardHeader heading="Admin Dashboard" text={`Welcome, ${adminName}! Here's an overview of your system.`} />
      <Separator className="mb-8" />

      {/* Top row - 2 columns */}
      <div className="grid gap-8 md:grid-cols-2 mb-8">
        {/* System Overview Card */}
        <SystemOverviewClient systemStats={serializedSystemStats} />

        {/* System Alerts */}
        <SystemAlertsClient />
      </div>

      {/* Bottom row - 2 columns */}
      <div className="grid gap-8 md:grid-cols-2">
        {/* User Management Preview */}
        <UserManagementPreview limit={5} />

        {/* Admin Activity Log */}
        <AdminActivityLogWrapper
          limit={5}
          showFilters={false}
          showHeader={true}
          showViewAll={true}
          viewAllUrl="/admin/activity"
        />
      </div>
    </DashboardShell>
  );
}
