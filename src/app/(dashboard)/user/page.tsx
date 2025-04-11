import { Separator } from "@/components/ui/separator";
import { DashboardShell, DashboardHeader } from "@/components";
import { UserActivityPreview } from "@/components";
import { UserAccountPreview } from "@/components/dashboard/user/overview/UserAccountPreview";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { adminDb } from "@/firebase/admin/firebase-admin-init";
import { parseServerDate } from "@/utils/date-server";
import type { User, SerializedUser } from "@/types/user";
import { serializeUser } from "@/utils/serializeUser";
import { fetchActivityLogs } from "@/actions/dashboard/activity-logs";

export default async function UserDashboardOverviewPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const userId = session.user.id;
  const sessionUser = session.user as User;

  // fetch activity logs
  const result = await fetchActivityLogs({ limit: 5 });
  const logs = result.success && Array.isArray(result.activities) ? result.activities : [];

  // Start with session values and fallback structure
  let userData: User = {
    id: userId,
    name: sessionUser.name ?? "",
    email: sessionUser.email ?? "",
    image: sessionUser.image ?? "",
    role: sessionUser.role,
    emailVerified: sessionUser.emailVerified ?? false,
    hasPassword: false,
    has2FA: false,
    createdAt: new Date(),
    lastLoginAt: new Date(),
    updatedAt: new Date()
  };

  try {
    const doc = await adminDb.collection("users").doc(userId).get();

    if (doc.exists) {
      const firestoreData = doc.data() as Partial<User>;

      userData = {
        ...userData,
        ...firestoreData,
        createdAt: parseServerDate(firestoreData.createdAt) ?? new Date(),
        lastLoginAt: parseServerDate(firestoreData.lastLoginAt) ?? new Date(),
        updatedAt: parseServerDate(firestoreData.updatedAt) ?? new Date(),
        hasPassword: !!firestoreData.passwordHash || firestoreData.provider !== "google",
        has2FA: firestoreData.has2FA ?? false
      };
    }
  } catch (error) {
    console.error("Error fetching Firestore user:", error);
    // Continue with fallback session data
  }

  const serializedUserData: SerializedUser = serializeUser(userData);
  const userName = serializedUserData.name || serializedUserData.email?.split("@")[0] || "User";

  return (
    <DashboardShell>
      <DashboardHeader heading="Dashboard" text={`Welcome back, ${userName}! Here's an overview of your account.`} />
      <Separator className="mb-8" />

      {/* Updated layout with consistent width */}
      <div className="w-full max-w-8xl mx-auto max-w-8xl flex flex-col lg:grid lg:grid-cols-2 gap-4 md:gap-8">
        {/* Account summary in its own container */}
        <div className="w-full min-w-0 overflow-hidden">
          <UserAccountPreview serializedUserData={serializedUserData} isLoading={!serializedUserData} />
        </div>

        {/* Activity preview in its own scrollable container */}
        <div className="w-full min-w-0 overflow-hidden">
          <UserActivityPreview
            activities={logs}
            limit={5}
            showFilters={false}
            showHeader={true}
            showViewAll={true}
            viewAllUrl="/user/activity"
          />
        </div>
      </div>
    </DashboardShell>
  );
}
