// Update the dashboard page to use the enhanced ActivityLogWrapper
import { Separator } from "@/components/ui/separator";
import { DashboardShell, DashboardHeader } from "@/components";
import { ActivityLogWrapper } from "@/components/user/overview/ActivityLogWrapper";
import { AccountSummaryClient } from "@/components/user/overview/AccountSummaryClient";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { adminDb } from "@/firebase/admin";
import type { User } from "@/types/user";

// Helper function to ensure all data is properly serialized
function serializeData(data: any) {
  return JSON.parse(JSON.stringify(data));
}

export default async function UserDashboardOverviewPage() {
  // Get the session server-side
  const session = await auth();

  // Redirect if not authenticated
  if (!session?.user) {
    redirect("/login");
  }

  // Get the user's ID from the session
  const userId = session.user.id;

  // Base user data from session
  let userData: User = {
    id: userId,
    ...session.user,
    createdAt: null,
    lastLoginAt: null,
    emailVerified: session.user.emailVerified || false,
    hasPassword: false,
    has2FA: false
  };

  try {
    // Fetch the user document from Firestore
    const userDoc = await adminDb.collection("users").doc(userId).get();

    if (userDoc.exists) {
      // Get the user data
      const firestoreData = userDoc.data();

      if (firestoreData) {
        // Process timestamps
        const processedData = {
          ...firestoreData,
          createdAt: firestoreData.createdAt?.toDate?.() || firestoreData.createdAt,
          lastLoginAt: firestoreData.lastLoginAt?.toDate?.() || firestoreData.lastLoginAt
        };

        // Merge the data
        userData = {
          ...userData,
          ...processedData,
          // Determine security properties
          emailVerified: session.user.emailVerified || (processedData as any).emailVerified || false,
          hasPassword: !!(processedData as any).passwordHash || (processedData as any).provider !== "google",
          has2FA: (processedData as any).has2FA || false
        };
      }
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
    // Continue with basic session data if Firestore fetch fails
  }

  // Ensure data is properly serialized for client components
  const serializedUserData = serializeData(userData);

  // Get the user's name with fallbacks
  const userName =
    serializedUserData.name || (serializedUserData.email ? serializedUserData.email.split("@")[0] : "User");

  return (
    <DashboardShell>
      <DashboardHeader heading="Dashboard" text={`Welcome back, ${userName}! Here's an overview of your account.`} />
      <Separator className="mb-8" />

      <div className="grid gap-8 md:grid-cols-2">
        {/* Account Summary Card - Pass serialized data to client component */}
        <AccountSummaryClient userData={serializedUserData} />

        {/* Recent Activity Card - Using the enhanced wrapper component */}
        <ActivityLogWrapper
          limit={3}
          showFilters={false}
          showHeader={true}
          showViewAll={true}
          viewAllUrl="/user/activity"
        />
      </div>
    </DashboardShell>
  );
}
