import type { Metadata } from "next";
import { fetchActivityLogs } from "@/actions/dashboard/activity-logs";
import { Separator } from "@/components/ui/separator";
import {
  DashboardShell,
  DashboardHeader,
  AdminSystemPreview,
  AdminAlertsPreview,
  AdminUserPreview,
  AdminActivityPreview
} from "@/components";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { adminDb } from "@/firebase/admin/firebase-admin-init";
import { serializeData } from "@/utils";
import type { SerializedActivity } from "@/types/firebase";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Admin Dashboard"
};

export default async function AdminDashboardOverviewPage() {
  // Get the session server-side
  const session = await auth();
  // const result = await fetchActivityLogs({ limit: 10 });
  // const logs: SerializedActivity[] = Array.isArray(result) ? result : [];
  const result = await fetchActivityLogs({ limit: 10 });
  console.log("[AdminDashboardOverviewPage] fetchActivityLogs result:", result);
  const logs: SerializedActivity[] = result.success && Array.isArray(result.activities) ? result.activities : [];

  console.log("[AdminDashboardOverviewPage] Logs length:", logs.length);
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
    // Redirect if not an admin
    if (!isAdmin) {
      redirect("/not-authorized");
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
    console.log("ACTIVITIES:", activitiesSnapshot.data().count);
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

      {/* Top row - 2 columns with reduced gap on mobile */}
      <div className="w-full grid gap-4 md:gap-8 md:grid-cols-2 mb-4 md:mb-8">
        {/* System Overview Card */}
        <div className="w-full min-w-0 overflow-hidden">
          <AdminSystemPreview systemStats={serializedSystemStats} />
        </div>

        {/* System Alerts */}
        <div className="w-full min-w-0 overflow-hidden">
          {" "}
          <AdminAlertsPreview />{" "}
        </div>
      </div>

      {/* Bottom row - 2 columns with reduced gap on mobile */}
      <div className="w-full grid gap-4 md:gap-8 md:grid-cols-2">
        {/* User Management Preview */}
        <div className="w-full min-w-0 overflow-hidden">
          <AdminUserPreview limit={5} />
        </div>

        {/* Admin Activity Log */}
        <div className="w-full min-w-0 overflow-hidden">
          <AdminActivityPreview
            activities={logs}
            limit={5}
            showFilters={false}
            showHeader={true}
            showViewAll={true}
            viewAllUrl="/admin/activity"
          />
        </div>
      </div>
    </DashboardShell>
  );
}
